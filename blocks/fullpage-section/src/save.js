import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { sectionTone, heightMode, verticalAlign } = attributes;

	const blockProps = useBlockProps.save( {
		className: [
			'nelyqo-fullpage-section',
			`is-tone-${ sectionTone }`,
			`is-height-${ heightMode }`,
			`is-align-${ verticalAlign }`,
		]
			.filter( Boolean )
			.join( ' ' ),
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'nelyqo-fullpage-section__layout',
	} );

	return (
		<section { ...blockProps }>
			<div { ...innerBlocksProps } />
		</section>
	);
}
