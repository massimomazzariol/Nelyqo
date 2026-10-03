import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { trackCardWidth, sectionTone } = attributes;

	const blockProps = useBlockProps.save( {
		className: [
			'nelyqo-horizontal-scroll',
			`is-track-width-${ trackCardWidth }`,
			`is-tone-${ sectionTone }`,
		]
			.filter( Boolean )
			.join( ' ' ),
	} );

	return (
		<section { ...blockProps }>
			<InnerBlocks.Content />
		</section>
	);
}
