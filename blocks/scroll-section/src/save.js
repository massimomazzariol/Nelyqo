import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		mode,
		stickyEnabled,
		stickyOffset,
		motionEnabled,
		motionIntensity,
		cardEmphasis,
		trackCardWidth,
		sectionTone,
	} = attributes;

	const blockProps = useBlockProps.save( {
		className: [
			'nelyqo-scroll-section',
			`is-mode-${ mode }`,
			`is-track-width-${ trackCardWidth }`,
			stickyEnabled ? 'has-sticky' : 'has-no-sticky',
			motionEnabled ? 'has-motion' : 'has-no-motion',
			motionIntensity !== 'medium'
				? `is-motion-${ motionIntensity }`
				: null,
			! cardEmphasis ? 'has-no-card-emphasis' : null,
			`is-tone-${ sectionTone }`,
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			'--nelyqo-scroll-sticky-offset': `${ stickyOffset }px`,
		},
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'nelyqo-scroll-section__layout',
	} );

	return (
		<section { ...blockProps }>
			<div { ...innerBlocksProps } />
		</section>
	);
}
