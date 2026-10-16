// Discretion check: with the switches at their defaults, a visitor's requests reveal no versions,
// no user names and no announced doors (docs/DISCRETION-AUDIT.md). Exits 1 when a signal is back.
// Usage: node lean/discretion-check.mjs [site url, default http://localhost:8888]
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = ( process.argv[ 2 ] ?? 'http://localhost:8888' ).replace( /\/$/, '' );
const data = JSON.parse( readFileSync( join( dirname( fileURLToPath( import.meta.url ) ), '..', 'data', 'discretion.json' ), 'utf8' ) );
let failures = 0;
const check = ( ok, text ) => {
	failures += ok ? 0 : 1;
	console.log( `${ ok ? 'ok  ' : 'FAIL' } ${ text }` );
};
const get = ( path ) => fetch( base + path, { redirect: 'manual' } );

const home = await get( '/' );
const html = await home.text();
check( ! /<meta name="generator"/i.test( html ), 'no generator tag' );
check( ! html.includes( 'https://api.w.org/' ) && ! home.headers.get( 'link' ), 'no API discovery link or header' );
check( ! /EditURI|wlwmanifest|rel="shortlink"/.test( html ), 'no editing-client or shortlink links' );
data.headers.forEach( ( header ) => check( ! home.headers.has( header ), `no ${ header } header` ) );
check( ( await get( '/?author=1' ) ).status === 404, '?author=1 answers 404' );
check( ( await get( '/wp-json/wp/v2/users' ) ).status === 404, 'the REST user list answers 404' );
check( ( await get( '/xmlrpc.php' ) ).status === 403, 'xmlrpc.php answers 403' );
check( ! /wp-sitemap-users/.test( await ( await get( '/wp-sitemap.xml' ) ).text() ), 'no user sitemap' );
console.log( failures ? `${ failures } signal(s) back` : 'Nothing extra revealed' );
process.exit( failures ? 1 : 0 );
