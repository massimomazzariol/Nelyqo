// Lighthouse baseline: every page of lean/lighthouse.json, mobile and desktop, N runs each,
// reported as median and range (markdown on stdout).
// Usage: CHROME_PATH=<chrome or chromium> node lean/lighthouse.mjs [config]  (a running site, e.g. wp-env)
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const cli = createRequire( import.meta.url ).resolve( 'lighthouse/cli/index.js' );
const run = ( url, preset ) => {
	let out;
	try {
		out = execFileSync(
			process.execPath,
			[ cli, url, '--output=json', '--output-path=stdout', '--only-categories=performance', '--quiet', '--chrome-flags=--headless=new', ...( 'desktop' === preset ? [ '--preset=desktop' ] : [] ) ],
			{ maxBuffer: 64 * 1024 * 1024, stdio: [ 'ignore', 'pipe', 'pipe' ] }
		);
	} catch ( error ) {
		// On Windows the launcher may fail to delete Chrome's temp folder after the report is written (EPERM).
		out = error.stdout;
	}
	return JSON.parse( out );
};

const config = JSON.parse( readFileSync( process.argv[ 2 ] || new URL( './lighthouse.json', import.meta.url ), 'utf8' ) );
const metrics = {
	Score: ( r ) => Math.round( r.categories.performance.score * 100 ),
	'FCP ms': ( r ) => Math.round( r.audits[ 'first-contentful-paint' ].numericValue ),
	'LCP ms': ( r ) => Math.round( r.audits[ 'largest-contentful-paint' ].numericValue ),
	'TBT ms': ( r ) => Math.round( r.audits[ 'total-blocking-time' ].numericValue ),
	CLS: ( r ) => +r.audits[ 'cumulative-layout-shift' ].numericValue.toFixed( 3 ),
	'TTFB ms': ( r ) => Math.round( r.audits[ 'server-response-time' ].numericValue ),
	'Bytes KB': ( r ) => Math.round( r.audits[ 'total-byte-weight' ].numericValue / 1024 ),
};
const median = ( values ) => {
	const sorted = [ ...values ].sort( ( a, b ) => a - b );
	const mid = Math.floor( sorted.length / 2 );
	return sorted.length % 2 ? sorted[ mid ] : +( ( sorted[ mid - 1 ] + sorted[ mid ] ) / 2 ).toFixed( 3 );
};

for ( const preset of config.presets ) {
	console.log( `\n### ${ preset } (${ config.runs } runs, median and range)\n` );
	console.log( `| Page | ${ Object.keys( metrics ).join( ' | ' ) } |` );
	console.log( `| --- |${ ' ---: |'.repeat( Object.keys( metrics ).length ) }` );
	for ( const page of config.pages ) {
		const values = Object.fromEntries( Object.keys( metrics ).map( ( k ) => [ k, [] ] ) );
		for ( let i = 0; i < config.runs; i++ ) {
			const lhr = run( config.base + page, preset );
			for ( const [ k, read ] of Object.entries( metrics ) ) {
				values[ k ].push( read( lhr ) );
			}
		}
		const cells = Object.values( values ).map( ( v ) => `${ median( v ) } (${ Math.min( ...v ) }-${ Math.max( ...v ) })` );
		console.log( `| \`${ page }\` | ${ cells.join( ' | ' ) } |` );
	}
}
