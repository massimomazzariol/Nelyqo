// Builds the presentation demo from demo/presentation.json inside a running WordPress editor, so
// every block is created and serialized by WordPress itself (valid saved markup, no hand-written
// HTML), then checks the result parses back as valid blocks. Writes demo/presentation.html.
// Usage: node lean/build-presentation.mjs <site url> <dir with playwright installed> [user] [password]
// Example: node lean/build-presentation.mjs http://localhost:8888 ~/repos/wp-lean-check admin password
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [ base, playwrightDir, user = 'admin', password = 'password' ] = process.argv.slice( 2 );
const root = join( dirname( fileURLToPath( import.meta.url ) ), '..' );
const data = JSON.parse( readFileSync( join( root, 'demo/presentation.json' ), 'utf8' ) );
// "gemPills" sections list the presentation's gems, each pill marked with its gem's metal (styles/sections).
data.gems = data.sections.map( ( { gem } ) => {
	const style = JSON.parse( readFileSync( join( root, `styles/sections/gem-${ gem }.json` ), 'utf8' ) );
	return { title: style.title, metal: style.styles.css.match( /--nelyqo-m2:\s*(#[0-9a-f]{6})/i )[ 1 ] };
} );
const { chromium } = createRequire( join( playwrightDir, 'package.json' ) )( 'playwright' );

const browser = await chromium.launch();
try {
	const page = await browser.newPage();
	await page.goto( `${ base }/wp-login.php` );
	await page.fill( '#user_login', user );
	await page.fill( '#user_pass', password );
	await Promise.all( [ page.waitForNavigation(), page.click( '#wp-submit' ) ] );
	await page.goto( `${ base }/wp-admin/post-new.php?post_type=page` );
	await page.waitForFunction( () => window.wp?.blocks?.getBlockType( 'nelyqo/scroll-section' ), null, { timeout: 120000 } );

	const result = await page.evaluate( ( { sections, sizes, gems } ) => {
		const { createBlock, serialize, parse } = window.wp.blocks;
		const tree = ( [ name, attributes = {}, inner = [] ] ) => createBlock( name, attributes, inner.map( tree ) );

		const scenes = sections.flatMap( ( section, index ) => {
			// Text sits on the side away from the sand stream, which runs right in even sections and
			// left in odd ones (nelyqo_sand_stream() in inc/precious.php).
			const side = section.align || ( index % 2 ? 'right' : 'left' );
			const intro = [
				[ 'core/paragraph', { className: 'is-style-eyebrow', style: { typography: { textAlign: side } }, content: section.eyebrow } ],
				[ 'core/heading', { level: section.level || 2, className: section.foil ? 'is-style-foil' : undefined, content: section.heading, style: { typography: { textAlign: side, fontSize: sizes[ section.level || 2 ] } } } ],
				[ 'core/paragraph', { style: { typography: { textAlign: side } }, content: section.text } ],
			];
			if ( section.buttons ) {
				intro.push( [ 'core/buttons', { layout: { type: 'flex', justifyContent: side } }, section.buttons.map( ( [ text, url ] ) => [ 'core/button', { text, url } ] ) ] );
			}
			const body = section.gemPills ? [ [ 'nelyqo/pills', {}, gems.map( ( { title, metal } ) => [ 'nelyqo/pill', { text: title, pillBorderColor: metal } ] ) ] ] : section.blocks;
			const heading = tree( [
				'core/group',
				{
					className: `is-style-gem-${ section.gem }`,
					anchor: section.anchor,
					align: 'full',
					style: { dimensions: { minHeight: '100vh' } },
					layout: { type: 'flex', orientation: 'vertical', justifyContent: 'center' === side ? 'center' : 'stretch', verticalAlignment: 'center' },
				},
				[ [ 'core/group', { className: 'is-style-reveal', align: 'wide', layout: { type: 'flex', orientation: 'vertical', justifyContent: side } }, intro ] ],
			] );
			// The blocks follow in a second section of the same gem: the sand curves beside the heading,
			// then runs straight down the middle between the blocks (nelyqo_sand_stream_mark()).
			return body ? [ heading, tree( [ 'core/group', { className: `is-style-gem-${ section.gem }`, align: 'full', layout: { type: 'flex', orientation: 'vertical', justifyContent: 'stretch' } }, body ] ) ] : [ heading ];
		} );

		const html = serialize( [ createBlock( 'core/group', { align: 'full', className: 'is-style-sand-stream', layout: { type: 'default' } }, scenes ) ] );
		const invalid = [];
		const walk = ( blocks ) => blocks.forEach( ( b ) => {
			if ( ! b.isValid ) {
				invalid.push( b.name );
			}
			walk( b.innerBlocks );
		} );
		walk( parse( html ) );
		return { html, invalid };
	}, data );

	if ( result.invalid.length ) {
		console.error( `Invalid blocks after a round trip: ${ result.invalid.join( ', ' ) }` );
		process.exitCode = 1;
	}
	writeFileSync( join( root, 'demo/presentation.html' ), result.html + '\n' );
	console.log( `Wrote demo/presentation.html (${ result.html.length } bytes, ${ data.sections.length } sections${ result.invalid.length ? ', with invalid blocks' : ', all blocks valid' })` );
} finally {
	await browser.close();
}
