import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { tone, height, featured, ctaShell, showIndex } = attributes;

	const blockProps = useBlockProps.save( {
		className: [
			'nelyqo-scroll-card',
			`is-tone-${ tone }`,
			`is-height-${ height }`,
			featured ? 'is-featured' : 'is-standard',
			! ctaShell ? 'has-no-cta-shell' : null,
			showIndex ? 'has-index' : 'has-no-index',
		]
			.filter( Boolean )
			.join( ' ' ),
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'nelyqo-scroll-card__content',
	} );

	return (
		<article { ...blockProps }>
			{ showIndex && (
				<span
					className="nelyqo-scroll-card__index"
					aria-hidden="true"
				/>
			) }
			<div { ...innerBlocksProps } />
		</article>
	);
}
