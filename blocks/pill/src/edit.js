import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	RichText,
	InspectorControls,
	useSettings,
} from '@wordpress/block-editor';
import { PanelBody, ColorPalette, BaseControl } from '@wordpress/components';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { text, pillColor, pillBorderColor, pillHoverBg, pillHoverColor } =
		attributes;

	const [ themeColors = [] ] = useSettings( 'color.palette' );

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

	const blockProps = useBlockProps( {
		className: 'nelyqo-pill',
		...( Object.keys( pillVars ).length ? { style: pillVars } : {} ),
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Pill colors', 'nelyqo-pill' ) }
					initialOpen={ false }
				>
					<BaseControl
						label={ __( 'Text color', 'nelyqo-pill' ) }
						id="nelyqo-pill-color"
						help={ __(
							'Overrides the parent Nelyqo Pills default.',
							'nelyqo-pill'
						) }
					>
						<ColorPalette
							colors={ themeColors }
							value={ pillColor }
							onChange={ ( value ) =>
								setAttributes( { pillColor: value || '' } )
							}
						/>
					</BaseControl>

					<BaseControl
						label={ __( 'Border color', 'nelyqo-pill' ) }
						id="nelyqo-pill-border"
					>
						<ColorPalette
							colors={ themeColors }
							value={ pillBorderColor }
							onChange={ ( value ) =>
								setAttributes( {
									pillBorderColor: value || '',
								} )
							}
						/>
					</BaseControl>

					<BaseControl
						label={ __( 'Hover background', 'nelyqo-pill' ) }
						id="nelyqo-pill-hover-bg"
					>
						<ColorPalette
							colors={ themeColors }
							value={ pillHoverBg }
							onChange={ ( value ) =>
								setAttributes( { pillHoverBg: value || '' } )
							}
						/>
					</BaseControl>

					<BaseControl
						label={ __( 'Hover text color', 'nelyqo-pill' ) }
						id="nelyqo-pill-hover-color"
					>
						<ColorPalette
							colors={ themeColors }
							value={ pillHoverColor }
							onChange={ ( value ) =>
								setAttributes( { pillHoverColor: value || '' } )
							}
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<RichText
					tagName="span"
					value={ text || '' }
					onChange={ ( value ) => setAttributes( { text: value } ) }
					placeholder={ __( 'Pill text', 'nelyqo-pill' ) }
					allowedFormats={ [] }
					withoutInteractiveFormatting
				/>
			</div>
		</>
	);
}
