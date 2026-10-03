import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		backgroundUrl,
		backgroundMode,
		backgroundColor,
		backgroundGradient,
		heightMode,
		scrollMode,
		hasOverlay,
		overlayOpacity,
		contentAlign,
		textColor,
	} = attributes;

	let bgStyle = {};
	if ( backgroundMode === 'image' && backgroundUrl ) {
		bgStyle = { backgroundImage: `url(${ backgroundUrl })` };
	} else if ( backgroundMode === 'color' && backgroundColor ) {
		bgStyle = { backgroundColor };
	} else if ( backgroundMode === 'gradient' && backgroundGradient ) {
		bgStyle = { background: backgroundGradient };
	}

	const blockProps = useBlockProps.save( {
		className: [
			'nelyqo-hero',
			heightMode === 'full' ? 'is-height-full' : 'is-height-auto',
			scrollMode === 'sticky' ? 'is-scroll-sticky' : 'is-scroll-normal',
			`is-content-${ contentAlign }`,
			`has-bg-mode-${ backgroundMode || 'color' }`,
			hasOverlay ? 'has-overlay' : 'has-no-overlay',
		].join( ' ' ),
		style: {
			...bgStyle,
			'--nelyqo-hero-overlay-opacity': overlayOpacity / 100,
			...( textColor ? { '--nelyqo-hero-text-color': textColor } : {} ),
		},
	} );

	return (
		<section { ...blockProps }>
			<div className="nelyqo-hero__stage">
				<div className="nelyqo-hero__overlay" />
				<div className="nelyqo-hero__inner">
					<InnerBlocks.Content />
				</div>
			</div>
		</section>
	);
}
