// Whole-page journey, down to the bottom and back up to the top, with one input method.
// Checks at every step: the page never gets stuck, the full-page scenes are all seen in order
// both ways, the horizontal track only moves forward going down and back going up and reaches both
// ends, sticky elements hold where they should, the sand never shows two loose ends, no script errors.
// Usage: node lean/journey-check.mjs <url> <dir with playwright installed> <chromium|firefox|webkit> <wheel|pagekeys|space|arrows|touch> [width height]
// (touch needs chromium; REDUCED=1 runs with reduced motion). Example, the presentation:
// node lean/journey-check.mjs http://localhost:8888/ ~/repos/wp-lean-check firefox pagekeys
import { createRequire } from 'node:module';
import { join } from 'node:path';

const [ url, pwDir, engine, method, width = '1440', height = '900' ] = process.argv.slice( 2 );
const pw = createRequire( join( pwDir, 'package.json' ) )( 'playwright' );
const browser = await pw[ engine ].launch();
const touch = method === 'touch';
const context = await browser.newContext( { viewport: { width: +width, height: +height }, hasTouch: touch, isMobile: touch, reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference' } );
const page = await context.newPage();
const errors = [];
page.on( 'pageerror', ( e ) => errors.push( e.message ) );
await page.goto( url, { waitUntil: 'networkidle' } );
await page.waitForTimeout( 3000 );
const cdp = touch ? await context.newCDPSession( page ) : null;
await page.mouse.move( 300, 150 );

const read = () => page.evaluate( () => {
	const hz = document.querySelector( '.wp-block-nelyqo-horizontal-scroll, .is-mode-horizontal-track' )?.querySelector( '.wp-block-nelyqo-scroll-card' );
	// Share of a stretch not yet poured (0-100): its window slides down from 100% above its section.
	const clip = ( s ) => {
		const y = s.getBoundingClientRect().top - s.parentElement.getBoundingClientRect().top;
		return s.offsetHeight ? ( -y / s.offsetHeight ) * 100 : 0;
	};
	const sands = [ ...document.querySelectorAll( '.nelyqo-sand' ) ];
	const gap = sands.some( ( s, i ) => i > 0 && clip( sands[ i - 1 ] ) > 0.5 && clip( s ) < 99.5 && s.parentElement.getBoundingClientRect().top < innerHeight );
	// Sticky elements in the stream: held at their top while their parent's content box allows it.
	const loose = [];
	document.querySelectorAll( '.is-style-sand-stream *' ).forEach( ( el ) => {
		const cs = getComputedStyle( el );
		if ( cs.position !== 'sticky' || el.offsetHeight === 0 ) {
			return;
		}
		const top = parseFloat( cs.top );
		const r = el.getBoundingClientRect();
		const p = el.parentElement;
		const pr = p.getBoundingClientRect();
		const pcs = getComputedStyle( p );
		const contentTop = pr.top + parseFloat( pcs.paddingTop );
		const contentBottom = pr.bottom - parseFloat( pcs.paddingBottom );
		if ( contentTop < top - 2 && contentBottom > top + r.height + parseFloat( cs.marginBottom ) + 2 && Math.abs( r.top - top ) > 2 ) {
			loose.push( `${ el.className.toString().slice( 0, 40 ) } at ${ Math.round( r.top ) } not ${ top }` );
		}
	} );
	return {
		y: Math.round( scrollY ),
		max: document.documentElement.scrollHeight - innerHeight,
		scene: [ ...document.querySelectorAll( '.nelyqo-fullpage-section__panel' ) ].findIndex( ( p ) => p.classList.contains( 'is-active' ) ),
		// Where the track's first card is: read from what is on screen, whatever moves it.
		hz: hz ? hz.getBoundingClientRect().left : 0,
		gap,
		loose,
	};
} );

const step = async ( dir ) => {
	if ( method === 'wheel' ) {
		await page.mouse.wheel( 0, 300 * dir );
	} else if ( method === 'pagekeys' ) {
		await page.keyboard.press( dir > 0 ? 'PageDown' : 'PageUp' );
	} else if ( method === 'space' ) {
		await page.keyboard.press( dir > 0 ? 'Space' : 'Shift+Space' );
	} else if ( method === 'arrows' ) {
		for ( let i = 0; i < 4; i++ ) {
			await page.keyboard.press( dir > 0 ? 'ArrowDown' : 'ArrowUp' );
		}
	} else {
		const [ from, to ] = dir > 0 ? [ 700, 250 ] : [ 250, 700 ];
		await cdp.send( 'Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [ { x: 195, y: from } ] } );
		for ( let y = from; dir > 0 ? y >= to : y <= to; y -= 30 * dir ) {
			await cdp.send( 'Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [ { x: 195, y } ] } );
		}
		await cdp.send( 'Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] } );
	}
	await page.waitForTimeout( 750 );
	return read();
};

const problems = [];
for ( const dir of [ 1, -1 ] ) {
	const name = dir > 0 ? 'down' : 'up';
	let s = await read();
	const scenes = [ s.scene ];
	let still = 0;
	let hzBack = 0;
	const hzSeen = [ s.hz ];
	for ( let i = 0; i < 400; i++ ) {
		const next = await step( dir );
		if ( next.scene !== scenes.at( -1 ) ) {
			scenes.push( next.scene );
		}
		hzSeen.push( next.hz );
		// Going down the track only moves left (more negative), going up only right.
		if ( ( next.hz - s.hz ) * dir > 0.5 ) {
			hzBack++;
		}
		if ( next.gap ) {
			problems.push( `${ name }: two loose sand ends at y=${ next.y }` );
		}
		next.loose.forEach( ( l ) => problems.push( `${ name }: sticky not held at y=${ next.y }: ${ l }` ) );
		still = next.y === s.y && next.scene === s.scene ? still + 1 : 0;
		s = next;
		if ( ( dir > 0 && s.y >= s.max - 1 ) || ( dir < 0 && s.y <= 0 ) ) {
			break;
		}
		if ( still >= 4 ) {
			problems.push( `${ name }: stuck at y=${ s.y }, scene ${ s.scene }` );
			break;
		}
	}
	const expected = dir > 0 ? '0,1,2' : '2,1,0';
	if ( scenes.join( ',' ) !== expected ) {
		problems.push( `${ name }: scenes seen ${ scenes.join( ' ' ) }, expected ${ expected.replaceAll( ',', ' ' ) }` );
	}
	// On a desktop screen with motion the track travels: it must cover some distance each way.
	if ( +width >= 960 && ! process.env.REDUCED && Math.max( ...hzSeen ) - Math.min( ...hzSeen ) < 100 ) {
		problems.push( `${ name }: the horizontal track hardly moved` );
	}
	if ( hzBack ) {
		problems.push( `${ name }: horizontal track moved the wrong way ${ hzBack } time(s)` );
	}
	const reached = dir > 0 ? s.y >= s.max - 1 : s.y <= 0;
	if ( ! reached ) {
		problems.push( `${ name }: did not reach the ${ dir > 0 ? 'bottom' : 'top' } (y=${ s.y })` );
	}
	console.log( `  ${ name }: y=${ s.y }, scenes ${ scenes.join( ' ' ) }, track ${ Math.round( s.hz ) }px` );
}
// De-duplicate repeated reports from neighbouring steps.
const unique = [ ...new Set( problems ) ].concat( errors.map( ( e ) => `script error: ${ e }` ) );
console.log( `${ unique.length ? 'FAIL' : 'ok  ' } ${ engine } ${ method } ${ width }x${ height }${ unique.length ? '\n    ' + unique.slice( 0, 12 ).join( '\n    ' ) : '' }` );
await browser.close();
process.exit( unique.length ? 1 : 0 );
