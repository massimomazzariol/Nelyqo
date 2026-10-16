// Full-page Section behavior check: one slide per wheel or trackpad gesture (inertia included),
// slides dock to fill the screen before they change, and the page scrolls on after the last one.
// Exits 1 when a step does not end where expected.
// Usage: node lean/fullpage-check.mjs <page with the lean/fixtures/fullpage.html content> <dir with playwright installed>
// Example: node lean/fullpage-check.mjs http://localhost:8888/fullpage/ ~/repos/wp-lean-check
import { createRequire } from 'node:module';
import { join } from 'node:path';

const [ url, playwrightDir ] = process.argv.slice( 2 );
const { chromium } = createRequire( join( playwrightDir, 'package.json' ) )( 'playwright' );
const browser = await chromium.launch();
const page = await browser.newPage( { viewport: { width: 1280, height: 800 } } );
const sleep = ( ms ) => page.waitForTimeout( ms );
const read = () =>
	page.evaluate( () => ( {
		slide: [ ...document.querySelectorAll( '.nelyqo-fullpage-section__panel' ) ].findIndex( ( p ) => p.classList.contains( 'is-active' ) ) + 1,
		top: Math.round( document.querySelector( '.nelyqo-fullpage-section__sequence' ).getBoundingClientRect().top ),
	} ) );
// A push ramping up, then inertia decaying over about 2 s, an event every 16 ms.
const swipe = async ( sign ) => {
	for ( const d of [ 8, 20, 45, 60 ] ) {
		await page.mouse.wheel( 0, sign * d );
		await sleep( 16 );
	}
	for ( let d = 60; d > 0.5; d *= 0.95 ) {
		await page.mouse.wheel( 0, sign * Math.max( 1, Math.round( d ) ) );
		await sleep( 16 );
	}
	await sleep( 400 );
};
const notch = async ( delta, wait = 1200 ) => {
	await page.mouse.wheel( 0, delta );
	await sleep( wait );
};

let failures = 0;
const expect = async ( step, check ) => {
	const state = await read();
	const ok = check( state );
	failures += ok ? 0 : 1;
	console.log( `${ ok ? 'ok  ' : 'FAIL' } ${ step }: slide ${ state.slide }, slides top ${ state.top }px` );
};

try {
	await page.goto( url, { waitUntil: 'networkidle' } );
	await page.mouse.move( 640, 700 );
	await expect( 'start below the page title', ( s ) => s.slide === 1 && s.top > 0 );
	await notch( 120 );
	await expect( 'first notch docks the slides', ( s ) => s.slide === 1 && s.top === 0 );
	await notch( 30 );
	await expect( 'tiny nudge does not change slide', ( s ) => s.slide === 1 && s.top === 0 );
	await swipe( 1 );
	await expect( 'trackpad swipe with inertia moves one slide', ( s ) => s.slide === 2 && s.top === 0 );
	await swipe( 1 );
	await expect( 'second swipe moves one more', ( s ) => s.slide === 3 && s.top === 0 );
	await swipe( -1 );
	await expect( 'swipe up moves one back', ( s ) => s.slide === 2 && s.top === 0 );
	for ( let i = 0; i < 6; i++ ) {
		await notch( 100, 40 );
	}
	await sleep( 1200 );
	await expect( 'fast six-notch spin moves one slide', ( s ) => s.slide === 3 && s.top === 0 );
	await notch( 120 );
	await expect( 'after the last slide the page scrolls on', ( s ) => s.slide === 3 && s.top < 0 );
	// The wheel is read page-wide while the slides are on screen: docking back works with the
	// pointer anywhere, here above the slides.
	await page.mouse.move( 640, 20 );
	await notch( -120 );
	await expect( 'scrolling back docks on the last slide', ( s ) => s.slide === 3 && s.top === 0 );
	await notch( -120 );
	await notch( -120 );
	await expect( 'two slow notches up reach the first slide', ( s ) => s.slide === 1 && s.top === 0 );
	await notch( -120 );
	await expect( 'before the first slide the page scrolls on', ( s ) => s.slide === 1 && s.top > 0 );
} finally {
	await browser.close();
}
console.log( failures ? `${ failures } step(s) failed` : 'All steps passed' );
process.exit( failures ? 1 : 0 );
