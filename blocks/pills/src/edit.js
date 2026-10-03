import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	useSettings,
} from '@wordpress/block-editor';
import { PanelBody, ColorPalette, BaseControl } from '@wordpress/components';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { pillColor, pillBorderColor, pillHoverBg, pillHoverColor } =
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
		className: 'nelyqo-pills',
		...( Object.keys( pillVars ).length ? { style: pillVars } : {} ),
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Pill default colors', 'nelyqo-pills' ) }
					initialOpen={ true }
				>
					<BaseControl
						label={ __( 'Text color', 'nelyqo-pills' ) }
						id="nelyqo-pills-color"
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
						label={ __( 'Border color', 'nelyqo-pills' ) }
						id="nelyqo-pills-border"
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
						label={ __( 'Hover background', 'nelyqo-pills' ) }
						id="nelyqo-pills-hover-bg"
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
						label={ __( 'Hover text color', 'nelyqo-pills' ) }
						id="nelyqo-pills-hover-color"
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
				<InnerBlocks
					orientation="horizontal"
					renderAppender={ InnerBlocks.ButtonBlockAppender }
				/>
			</div>
		</>
	);
}
