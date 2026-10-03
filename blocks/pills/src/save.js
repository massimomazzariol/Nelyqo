import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { pillColor, pillBorderColor, pillHoverBg, pillHoverColor } =
		attributes;

	const pillVars = {};
	if ( pillColor ) {
		pillVars[ '--nelyqo-pill-color' ] = pillColor;
	}
	if ( pillBorderColor ) {
		pillVars[ '--nelyqo-pill-border-color' ] = pillBorderColor;
	}
	if ( pillHoverBg ) {
		pillVars[ '--nelyqo-pill-hover-bg' ] = pillHoverBg;
	}
	if ( pillHoverColor ) {
		pillVars[ '--nelyqo-pill-hover-color' ] = pillHoverColor;
	}

	const blockProps = useBlockProps.save( {
		className: 'nelyqo-pills',
		...( Object.keys( pillVars ).length ? { style: pillVars } : {} ),
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}
