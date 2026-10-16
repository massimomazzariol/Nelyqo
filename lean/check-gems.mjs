// Contrast check for the gem section styles (styles/sections/gem-*.json), WCAG 2.2 AA:
// body text and muted text >= 4.5:1 on the ground; every metal stop >= 3:1 (it colours large type only).
// Exits 1 when a gem fails. Usage: node lean/check-gems.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join( dirname( fileURLToPath( import.meta.url ) ), '..', 'styles', 'sections' );
const luminance = ( hex ) => {
	const [ r, g, b ] = [ 1, 3, 5 ].map( ( i ) => parseInt( hex.slice( i, i + 2 ), 16 ) / 255 ).map( ( c ) => ( c <= 0.04045 ? c / 12.92 : ( ( c + 0.055 ) / 1.055 ) ** 2.4 ) );
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = ( a, b ) => {
	const [ hi, lo ] = [ luminance( a ), luminance( b ) ].sort( ( x, y ) => y - x );
	return ( hi + 0.05 ) / ( lo + 0.05 );
};

let failures = 0;
for ( const file of readdirSync( dir ).filter( ( f ) => f.startsWith( 'gem-' ) && f.endsWith( '.json' ) ) ) {
	const gem = JSON.parse( readFileSync( join( dir, file ), 'utf8' ) );
	const ground = gem.styles.color.background;
	const vars = Object.fromEntries( [ ...gem.styles.css.matchAll( /--nelyqo-([\w-]+):\s*(#[0-9a-f]{6})/gi ) ].map( ( m ) => [ m[ 1 ], m[ 2 ] ] ) );
	const checks = [
		[ 'text', gem.styles.color.text, 4.5 ],
		[ 'muted', vars.muted, 4.5 ],
		...[ 'm1', 'm2', 'm3', 'm4', 'm5' ].map( ( k ) => [ k, vars[ k ], 3 ] ),
		// Small type in precious.css: the eyebrow label (--nelyqo-label, else m2) and the button letters
		// (the ground) on --nelyqo-button, else on the m1-m3 metal gradient.
		[ 'label', vars.label ?? vars.m2, 4.5 ],
		...( vars.button ? [ [ 'button', vars.button, 4.5 ] ] : [ 'm1', 'm2', 'm3' ].map( ( k ) => [ `button ${ k }`, vars[ k ], 4.5 ] ) ),
	];
	const bad = checks.filter( ( [ , color, min ] ) => ! color || contrast( color, ground ) < min );
	// The next stretch of sand starts in the colour this one ends in (m2), or the grains jump colour.
	if ( vars[ 'sand-from' ] !== vars.m2 ) {
		bad.push( [ 'sand-from', vars[ 'sand-from' ] ] );
		console.log( `FAIL ${ gem.title }: --nelyqo-sand-from ${ vars[ 'sand-from' ] } is not m2 ${ vars.m2 }` );
	}
	failures += bad.length;
	console.log( `${ bad.length ? 'FAIL' : 'ok  ' } ${ gem.title.padEnd( 16 ) } ${ checks.map( ( [ k, c ] ) => `${ k } ${ c ? contrast( c, ground ).toFixed( 1 ) : 'missing' }` ).join( ', ' ) }` );
}
console.log( failures ? `${ failures } colour(s) below AA` : 'All gems pass WCAG 2.2 AA' );
process.exit( failures ? 1 : 0 );
