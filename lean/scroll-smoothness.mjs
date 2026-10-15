// Scroll smoothness under a slow CPU: scrolls each page top to bottom with the wheel while Chromium
// runs 4x slower, and reports frame times (rAF intervals) and long animation frames (> 50 ms).
// Lighthouse measures loading, not this. Exits 1 when a page drops below the budget.
// Usage: node lean/scroll-smoothness.mjs <base url> <dir with playwright installed> [page ...]
// Example: node lean/scroll-smoothness.mjs http://localhost:8888 ~/repos/wp-lean-check /sand/ /scroll-static/
import { createRequire } from 'node:module';
import { join } from 'node:path';

const [ base, playwrightDir, ...pages ] = process.argv.slice( 2 );
const { chromium } = createRequire( join( playwrightDir, 'package.json' ) )( 'playwright' );
// Budget: at 4x throttling, 95% of frames within 50 ms (20 fps) and at most 3 long animation frames.
const budget = { p95: 50, longFrames: 3 };

const browser = await chromium.launch();
let failures = 0;
try {
	for ( const path of pages.length ? pages : [ '/' ] ) {
		const page = await browser.newPage( { viewport: { width: 1280, height: 800 } } );
		await page.goto( base + path, { waitUntil: 'networkidle' } );
		const cdp = await page.context().newCDPSession( page );
		await cdp.send( 'Emulation.setCPUThrottlingRate', { rate: 4 } );
		await page.evaluate( () => {
			window.__frames = [];
			window.__long = 0;
			let last = performance.now();
			const tick = ( now ) => {
				window.__frames.push( now - last );
				last = now;
				requestAnimationFrame( tick );
			};
			requestAnimationFrame( tick );
			if ( PerformanceObserver.supportedEntryTypes.includes( 'long-animation-frame' ) ) {
				new PerformanceObserver( ( list ) => {
					window.__long += list.getEntries().length;
				} ).observe( { type: 'long-animation-frame' } );
			}
		} );
		await page.mouse.move( 640, 400 );
		const height = await page.evaluate( () => document.documentElement.scrollHeight - innerHeight );
		for ( let y = 0; y < height; y += 100 ) {
			await page.mouse.wheel( 0, 100 );
			await page.waitForTimeout( 40 );
		}
		await page.waitForTimeout( 500 );
		const { frames, longFrames } = await page.evaluate( () => ( { frames: window.__frames.slice( 2 ), longFrames: window.__long } ) );
		const sorted = [ ...frames ].sort( ( a, b ) => a - b );
		const p50 = sorted[ Math.floor( sorted.length * 0.5 ) ];
		const p95 = sorted[ Math.floor( sorted.length * 0.95 ) ];
		const ok = p95 <= budget.p95 && longFrames <= budget.longFrames;
		failures += ok ? 0 : 1;
		console.log( `${ ok ? 'ok  ' : 'FAIL' } ${ path.padEnd( 18 ) } frames ${ frames.length }, median ${ p50.toFixed( 1 ) } ms, p95 ${ p95.toFixed( 1 ) } ms, long animation frames ${ longFrames }` );
		await page.close();
	}
} finally {
	await browser.close();
}
process.exit( failures ? 1 : 0 );
