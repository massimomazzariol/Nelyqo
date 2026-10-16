// Horizontal track check, for the Horizontal Scroll block and the Scroll Section horizontal mode.
// Reads only what the visitor sees (where the cards are), so it holds whatever moves them. While
// the stage is held, the cards sit in the middle of the screen, the track moves about as far as the
// page scrolls in the expected direction, and it reaches its end before the stage lets go. With
// reduced motion nothing is held. Exits 1 on a failed step.
// Usage: node lean/horizontal-check.mjs <page with a horizontal track> <dir with playwright installed>
// ENGINE=firefox|webkit picks the browser (default chromium); DIRECTION=right expects cards moving right.
// Example: node lean/horizontal-check.mjs http://localhost:8888/ ~/repos/wp-lean-check
import { createRequire } from 'node:module';
import { join } from 'node:path';

const [ url, playwrightDir ] = process.argv.slice( 2 );
const engine = process.env.ENGINE || 'chromium';
const sign = process.env.DIRECTION === 'right' ? 1 : -1;
const browserType = createRequire( join( playwrightDir, 'package.json' ) )( 'playwright' )[ engine ];
const browser = await browserType.launch();
const ROOT = '.wp-block-nelyqo-horizontal-scroll, .is-mode-horizontal-track';
let failures = 0;
const check = ( ok, text ) => {
	failures += ok ? 0 : 1;
	console.log( `${ ok ? 'ok  ' : 'FAIL' } ${ text }` );
};

// Scrolls through the track in 50px steps and returns where the first card is at each step.
const walk = async ( page ) => {
	const top = await page.evaluate( ( root ) => document.querySelector( root ).getBoundingClientRect().top + window.scrollY, ROOT );
	const samples = [];
	for ( let y = top - 900; y < top + 3500; y += 50 ) {
		await page.evaluate( ( v ) => window.scrollTo( 0, v ), y );
		await page.waitForTimeout( 120 );
		// Scripts update on the next frame after the scroll event: let two frames pass.
		await page.evaluate( () => new Promise( ( done ) => requestAnimationFrame( () => requestAnimationFrame( done ) ) ) );
		samples.push( { y, ...( await page.evaluate( ( root ) => {
			const card = document.querySelector( root ).querySelector( '.wp-block-nelyqo-scroll-card' ).getBoundingClientRect();
			// The stage's content: the cards, with the introduction above them (Horizontal Scroll) or beside them.
			const intro = document.querySelector( root ).querySelector( '.nelyqo-horizontal-scroll__content, .nelyqo-scroll-section__intro' )?.getBoundingClientRect() ?? card;
			return { x: card.left, top: card.top, centre: ( Math.min( card.top, intro.top ) + Math.max( card.bottom, intro.bottom ) ) / 2, scrolled: window.scrollY };
		}, ROOT ) ) } );
	}
	// Held: the page moved (it may not, at its end) but the cards did not move up.
	return samples.map( ( s, i ) => ( { ...s, held: i > 0 && s.scrolled - samples[ i - 1 ].scrolled > 40 && Math.abs( s.top - samples[ i - 1 ].top ) < 1 } ) );
};

try {
	const page = await browser.newPage( { viewport: { width: 1440, height: 900 } } );
	await page.goto( url, { waitUntil: 'networkidle' } );
	const samples = await walk( page );
	const held = samples.filter( ( s ) => s.held );
	check( held.length > 4, `${ engine }: the stage holds (${ held.length } steps of 50px)` );
	const off = Math.max( ...held.map( ( s ) => Math.abs( s.centre - 468 ) ) );
	check( off < 70, `the stage's content in the middle of the screen while held (off by ${ Math.round( off ) }px at most)` );
	const start = samples[ 0 ].x;
	const end = samples.reduce( ( far, s ) => ( ( s.x - start ) * sign > ( far - start ) * sign ? s.x : far ), start );
	// Whole steps between the first and the last card (the steps where the track starts or stops are partial).
	const steps = held.filter( ( s, i ) => i && held[ i - 1 ].x !== start && s.x !== end ).map( ( s ) => ( s.x - held[ held.indexOf( s ) - 1 ].x ) / 50 );
	check( steps.length > 2 && steps.every( ( r ) => r * sign > 0.7 && r * sign < 1.35 ), `the track follows the scroll ${ sign < 0 ? 'leftwards' : 'rightwards' } (px per scroll px: ${ steps.map( ( r ) => r.toFixed( 2 ) ).join( ' ' ) })` );
	check( Math.abs( end - start ) > 100 && held.at( -1 ).x === end, `the track reaches its end (${ Math.round( end - start ) }px) before the stage lets go` );

	const still = await browser.newPage( { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' } );
	await still.goto( url, { waitUntil: 'networkidle' } );
	const quiet = await walk( still );
	check( ! quiet.some( ( s ) => s.held ) && quiet.every( ( s ) => s.x === quiet[ 0 ].x ), 'reduced motion: nothing held, the track does not move by itself' );
} finally {
	await browser.close();
}
console.log( failures ? `${ failures } step(s) failed` : 'All steps passed' );
process.exit( failures ? 1 : 0 );
