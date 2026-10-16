// Sand stream check: the rendered presentation has exactly one stretch of sand (.nelyqo-sand) per
// gem section built from demo/presentation.json, so a stretch that silently disappears (or doubles) fails.
// Exits 1 on a mismatch. Usage: node lean/check-sand.mjs [url, default http://localhost:8888/]
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.argv[ 2 ] ?? 'http://localhost:8888/';
const data = JSON.parse( readFileSync( join( dirname( fileURLToPath( import.meta.url ) ), '..', 'demo', 'presentation.json' ), 'utf8' ) );
const html = await ( await fetch( url ) ).text();
const found = html.match( /<span class="nelyqo-sand"/g )?.length ?? 0;
// A section with blocks renders as two gem sections (heading, then blocks), each with its stretch.
const expected = data.sections.reduce( ( sum, s ) => sum + ( s.blocks || s.gemPills ? 2 : 1 ), 0 );
console.log( `${ found === expected ? 'ok' : 'FAIL' }: ${ found } sand stretches, ${ expected } expected` );
process.exit( found === expected ? 0 : 1 );
