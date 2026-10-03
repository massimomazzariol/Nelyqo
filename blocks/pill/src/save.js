import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { text, pillColor, pillBorderColor, pillHoverBg, pillHoverColor } =
		attributes;
	const cleanText = ( text || '' ).trim();

	if ( ! cleanText ) {
		return null;
	}

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
		className: 'nelyqo-pill',
		...( Object.keys( pillVars ).length ? { style: pillVars } : {} ),
	} );

	return (
		<div { ...blockProps }>
			<RichText.Content tagName="span" value={ cleanText } />
		</div>
	);
}
