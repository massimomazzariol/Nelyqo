// Horizontal track check, for the Horizontal Scroll block and the Scroll Section horizontal mode.
// Reads only what the visitor sees (where the cards are), so it holds whatever moves them. While
// the stage is held, the cards sit in the middle of the screen, the track moves about as far as the
// page scrolls in the expected direction, and it reaches its end before the stage lets go. With
// reduced motion nothing is held. Exits 1 on a failed step.
// Usage: node lean/horizontal-check.mjs <page with a horizontal track> <dir with playwright installed>
// ENGINE=firefox|webkit picks the browser (default chromium); DIRECTION=right expects cards moving right;
// RTL=1 makes the page right-to-left; SPEED=slow|fast expects that speed option; SETTLE=1 checks "Settle on a card" instead of the walk, NOSETTLE=1 walks such a track without it.
// Example: node lean/horizontal-check.mjs http://localhost:8888/ ~/repos/wp-lean-check
import { createRequire } from 'node:module';
import { join } from 'node:path';

const [ url, playwrightDir ] = process.argv.slice( 2 );
const engine = process.env.ENGINE || 'chromium';
const sign = process.env.DIRECTION === 'right' ? 1 : -1;
// Track px per page px: 1 at normal speed (SPEED=slow: 1 / 1.5, SPEED=fast: 1 / 0.6).
const ratio = { slow: 1 / 1.5, fast: 1 / 0.6 }[ process.env.SPEED ] ?? 1;
const browserType = createRequire( join( playwrightDir, 'package.json' ) )( 'playwright' )[ engine ];
const browser = await browserType.launch();
// ROOT=<selector> picks which horizontal block to check (default: the first on the page).
const ROOT = process.env.ROOT || '.wp-block-nelyqo-horizontal-scroll, .is-mode-horizontal-track';
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

// SETTLE=1: for a track with "Settle on a card": it rests on whole cards, one wheel notch or one
// arrow key moves one card, and a longer move settles on the nearest card.
const settleCheck = async ( page ) => {
	const read = () => page.evaluate( ( root ) => {
		const el = document.querySelector( root );
		const shell = el.querySelector( '.nelyqo-scroll-section__horizontal-shell, .nelyqo-horizontal-scroll__horizontal' ).getBoundingClientRect();
		const middle = shell.left + shell.width / 2;
		const offs = [ ...el.querySelectorAll( '.wp-block-nelyqo-scroll-card' ) ].map( ( c ) => {
			const r = c.getBoundingClientRect();
			return Math.abs( ( r.left + r.right ) / 2 - middle );
		} );
		const card = offs.indexOf( Math.min( ...offs ) );
		return { card, off: offs[ card ], last: offs.length - 1, top: el.querySelector( '.wp-block-nelyqo-scroll-card' ).getBoundingClientRect().top, y: window.scrollY };
	}, ROOT );
	const rest = async () => {
		await page.waitForTimeout( 1300 );
		return read();
	};
	await page.evaluate( ( root ) => window.scrollTo( 0, document.querySelector( root ).getBoundingClientRect().top + window.scrollY - 400 ), ROOT );
	await page.mouse.move( 700, 450 );
	// Wheel until the stage holds, then let it come to rest on the first card.
	let before = await read();
	for ( let i = 0; i < 40; i++ ) {
		await page.mouse.wheel( 0, 60 );
		await page.waitForTimeout( 80 );
		const now = await read();
		if ( Math.abs( now.top - before.top ) < 1 && now.y !== before.y ) {
			break;
		}
		before = now;
	}
	let at = await rest();
	check( at.off < 3, `rests on a whole card when the stage holds (card ${ at.card + 1 }, ${ Math.round( at.off ) }px off)` );
	// One wheel notch at a time: each goes on to the next card.
	const perCard = [];
	// (The last card may never reach the middle: the travel ends when it is fully in view.)
	for ( let notch = 0; notch < 3 && at.card < at.last - 1; notch++ ) {
		await page.mouse.wheel( 0, 100 );
		const next = await rest();
		check( next.card === at.card + 1 && next.off < 3, `one wheel notch goes on to the next card (card ${ at.card + 1 } to ${ next.card + 1 }, ${ Math.round( next.off ) }px off)` );
		perCard.push( next.y - at.y );
		at = next;
	}
	// A long move that stops a little past a card settles on that card, not on the one after
	// (from the middle of the travel: at its start no card need sit exactly in the middle).
	const step = Math.round( perCard.reduce( ( a, b ) => a + b, 0 ) / Math.max( 1, perCard.length ) );
	if ( step > 0 && at.card > 1 ) {
		await page.evaluate( ( dy ) => window.scrollBy( 0, dy ), -Math.round( step * 1.2 ) );
		const past = await rest();
		check( past.card === at.card - 1 && past.off < 3, `a move of 1.2 cards back settles on the nearest card (card ${ at.card + 1 } to ${ past.card + 1 }, ${ Math.round( past.off ) }px off)` );
		at = past;
	}
	// One arrow key press: one card further (going down) or back (going up).
	if ( at.card > 0 ) {
		await page.keyboard.press( 'ArrowDown' );
		const ahead = await rest();
		check( ahead.card === at.card + 1 && ahead.off < 3, `one ArrowDown goes on one card (card ${ at.card + 1 } to ${ ahead.card + 1 })` );
	}
};

try {
	const page = await browser.newPage( { viewport: { width: 1440, height: 900 } } );
	await page.goto( url, { waitUntil: 'networkidle' } );
	if ( process.env.NOSETTLE ) {
		// Walk a track that has "Settle on a card" without it, to check its direction and speed.
		await page.evaluate( ( root ) => document.querySelector( root ).classList.remove( 'has-h-settle' ), ROOT );
	}
	if ( process.env.RTL ) {
		// A right-to-left page: the engine reads the direction when it measures (on resize).
		await page.evaluate( () => {
			document.documentElement.dir = 'rtl';
			window.dispatchEvent( new Event( 'resize' ) );
		} );
		await page.waitForTimeout( 300 );
	}
	if ( process.env.SETTLE ) {
		await settleCheck( page );
		throw new Error( 'done' );
	}
	const samples = await walk( page );
	const held = samples.filter( ( s ) => s.held );
	check( held.length > 4, `${ engine }: the stage holds (${ held.length } steps of 50px)` );
	const off = Math.max( ...held.map( ( s ) => Math.abs( s.centre - 468 ) ) );
	check( off < 70, `the stage's content in the middle of the screen while held (off by ${ Math.round( off ) }px at most)` );
	const start = samples[ 0 ].x;
	const end = samples.reduce( ( far, s ) => ( ( s.x - start ) * sign > ( far - start ) * sign ? s.x : far ), start );
	// Whole steps between the first and the last card (the steps where the track starts or stops are partial).
	const steps = held.filter( ( s, i ) => i && held[ i - 1 ].x !== start && s.x !== end ).map( ( s ) => ( s.x - held[ held.indexOf( s ) - 1 ].x ) / 50 );
	check( steps.length > 2 && steps.every( ( r ) => r * sign > 0.7 * ratio && r * sign < 1.35 * ratio ), `the track follows the scroll ${ sign < 0 ? 'leftwards' : 'rightwards' } (px per scroll px: ${ steps.map( ( r ) => r.toFixed( 2 ) ).join( ' ' ) })` );
	check( Math.abs( end - start ) > 100 && held.at( -1 ).x === end, `the track reaches its end (${ Math.round( end - start ) }px) before the stage lets go` );

	const still = await browser.newPage( { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' } );
	await still.goto( url, { waitUntil: 'networkidle' } );
	const quiet = await walk( still );
	check( ! quiet.some( ( s ) => s.held ) && quiet.every( ( s ) => s.x === quiet[ 0 ].x ), 'reduced motion: nothing held, the track does not move by itself' );
} catch ( error ) {
	if ( error.message !== 'done' ) {
		throw error;
	}
} finally {
	await browser.close();
}
console.log( failures ? `${ failures } step(s) failed` : 'All steps passed' );
process.exit( failures ? 1 : 0 );
