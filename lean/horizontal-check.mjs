// Scroll Section horizontal track check: while pinned, the cards sit in the middle of the screen,
// the track moves about as far as the page scrolls (no rush), and it reaches its end before the
// section lets go. With reduced motion the track is not pinned. Exits 1 on a failed step.
// Usage: node lean/horizontal-check.mjs <page with a horizontal track, e.g. the presentation> <dir with playwright installed>
// Example: node lean/horizontal-check.mjs http://localhost:8888/ ~/repos/wp-lean-check
import { createRequire } from 'node:module';
import { join } from 'node:path';

const [ url, playwrightDir ] = process.argv.slice( 2 );
const { chromium } = createRequire( join( playwrightDir, 'package.json' ) )( 'playwright' );
const browser = await chromium.launch();
let failures = 0;
const check = ( ok, text ) => {
	failures += ok ? 0 : 1;
	console.log( `${ ok ? 'ok  ' : 'FAIL' } ${ text }` );
};

try {
	const page = await browser.newPage( { viewport: { width: 1440, height: 900 } } );
	await page.goto( url, { waitUntil: 'networkidle' } );
	const read = () => page.evaluate( () => {
		const section = document.querySelector( '.is-mode-horizontal-track' );
		const shell = section.querySelector( '.nelyqo-scroll-section__horizontal-shell' ).getBoundingClientRect();
		return {
			pinned: section.classList.contains( 'is-horizontal-pinned' ),
			sectionTop: section.getBoundingClientRect().top,
			shellCentre: ( shell.top + shell.bottom ) / 2,
			offset: parseFloat( section.style.getPropertyValue( '--nelyqo-scroll-horizontal-track-offset' ) ) || 0,
			layoutTop: section.querySelector( '.nelyqo-scroll-section__layout' ).getBoundingClientRect().top,
			pinTop: parseFloat( section.style.getPropertyValue( '--nelyqo-scroll-horizontal-pin-top' ) ),
		};
	} );
	const scrollTo = async ( y ) => {
		await page.evaluate( ( v ) => window.scrollTo( 0, v ), y );
		await page.waitForTimeout( 150 );
		// The script updates on the next frame after the scroll event: let two frames pass.
		await page.evaluate( () => new Promise( ( done ) => requestAnimationFrame( () => requestAnimationFrame( done ) ) ) );
		return read();
	};
	const top = await page.evaluate( () => document.querySelector( '.is-mode-horizontal-track' ).getBoundingClientRect().top + window.scrollY );
	const samples = [];
	for ( let y = top - 900; y < top + 2500; y += 50 ) {
		samples.push( { y, ...( await scrollTo( y ) ) } );
	}
	const held = samples.filter( ( s ) => Math.abs( s.layoutTop - s.pinTop ) < 1 );
	check( samples[ 0 ].pinned && held.length > 4, `the track pins (${ held.length } samples held)` );
	const centres = held.map( ( s ) => Math.abs( s.shellCentre - 450 ) );
	check( Math.max( ...centres ) < 60, `cards in the middle of the screen while held (off by ${ Math.round( Math.max( ...centres ) ) }px at most)` );
	const last = Math.min( ...samples.map( ( s ) => s.offset ) );
	// Whole steps between the first and the last card (the steps where the track starts or stops are partial).
	const moving = held.filter( ( s, i ) => i && held[ i - 1 ].offset < 0 && s.offset > last );
	const ratios = moving.map( ( s ) => ( held[ held.indexOf( s ) - 1 ].offset - s.offset ) / 50 );
	check( ratios.length > 2 && ratios.every( ( r ) => r > 0.7 && r < 1.35 ), `the track follows the scroll (track px per scroll px: ${ ratios.map( ( r ) => r.toFixed( 2 ) ).join( ' ' ) })` );
	check( last < -100 && held.at( -1 ).offset === last, `the track reaches its end (${ Math.round( last ) }px) before the section lets go` );

	const still = await browser.newPage( { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' } );
	await still.goto( url, { waitUntil: 'networkidle' } );
	check( ! ( await still.evaluate( () => document.querySelector( '.is-mode-horizontal-track' ).classList.contains( 'is-horizontal-pinned' ) ) ), 'reduced motion: not pinned' );
} finally {
	await browser.close();
}
console.log( failures ? `${ failures } step(s) failed` : 'All steps passed' );
process.exit( failures ? 1 : 0 );
