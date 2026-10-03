import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	useSettings,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	ToggleControl,
	RangeControl,
	SelectControl,
	ColorPalette,
	GradientPicker,
	BaseControl,
} from '@wordpress/components';
import './editor.scss';

const TEMPLATE = [
	[
		'core/paragraph',
		{
			placeholder: 'Introduction headline',
			className: 'nelyqo-hero__intro',
		},
	],
	[
		'core/heading',
		{
			level: 1,
			placeholder: 'Your bold headline',
		},
	],
	[
		'core/paragraph',
		{
			placeholder: 'Add a short supporting text...',
		},
	],
	[ 'nelyqo/pills' ],
];

export default function Edit( { attributes, setAttributes } ) {
	const {
		backgroundUrl,
		backgroundId,
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

	const [ themeColors = [] ] = useSettings( 'color.palette' );
	const [ themeGradients = [] ] = useSettings( 'color.gradients' );

	let bgStyle = {};
	if ( backgroundMode === 'image' && backgroundUrl ) {
		bgStyle = { backgroundImage: `url(${ backgroundUrl })` };
	} else if ( backgroundMode === 'color' && backgroundColor ) {
		bgStyle = { backgroundColor };
	} else if ( backgroundMode === 'gradient' && backgroundGradient ) {
		bgStyle = { background: backgroundGradient };
	}

	const blockProps = useBlockProps( {
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
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Hero settings', 'nelyqo-hero' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Background mode', 'nelyqo-hero' ) }
						value={ backgroundMode }
						options={ [
							{
								label: __( 'No background', 'nelyqo-hero' ),
								value: 'none',
							},
							{
								label: __( 'Theme color', 'nelyqo-hero' ),
								value: 'color',
							},
							{
								label: __( 'Gradient', 'nelyqo-hero' ),
								value: 'gradient',
							},
							{
								label: __( 'Image', 'nelyqo-hero' ),
								value: 'image',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { backgroundMode: value } )
						}
					/>

					{ backgroundMode === 'image' && (
						<>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ ( media ) =>
										setAttributes( {
											backgroundUrl: media?.url || '',
											backgroundId: media?.id || 0,
										} )
									}
									allowedTypes={ [ 'image' ] }
									value={ backgroundId }
									render={ ( { open } ) => (
										<Button
											variant="primary"
											onClick={ open }
										>
											{ backgroundUrl
												? __(
														'Replace background image',
														'nelyqo-hero'
												  )
												: __(
														'Choose background image',
														'nelyqo-hero'
												  ) }
										</Button>
									) }
								/>
							</MediaUploadCheck>

							{ backgroundUrl && (
								<Button
									variant="secondary"
									onClick={ () =>
										setAttributes( {
											backgroundUrl: '',
											backgroundId: 0,
										} )
									}
									style={ { marginTop: '12px' } }
								>
									{ __(
										'Remove background image',
										'nelyqo-hero'
									) }
								</Button>
							) }
						</>
					) }

					{ backgroundMode === 'color' && (
						<BaseControl
							label={ __( 'Background color', 'nelyqo-hero' ) }
							id="nelyqo-hero-bg-color"
						>
							<ColorPalette
								colors={ themeColors }
								value={ backgroundColor }
								onChange={ ( value ) =>
									setAttributes( {
										backgroundColor: value || '',
									} )
								}
							/>
						</BaseControl>
					) }

					{ backgroundMode === 'gradient' && (
						<GradientPicker
							gradients={ themeGradients }
							value={ backgroundGradient }
							onChange={ ( value ) =>
								setAttributes( {
									backgroundGradient: value || '',
								} )
							}
						/>
					) }

					<div style={ { height: '16px' } } />

					<SelectControl
						label={ __( 'Height mode', 'nelyqo-hero' ) }
						value={ heightMode }
						options={ [
							{
								label: __( 'Auto', 'nelyqo-hero' ),
								value: 'auto',
							},
							{
								label: __( 'Full screen', 'nelyqo-hero' ),
								value: 'full',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { heightMode: value } )
						}
					/>

					<SelectControl
						label={ __( 'Scroll mode', 'nelyqo-hero' ) }
						value={ scrollMode }
						options={ [
							{
								label: __( 'Normal', 'nelyqo-hero' ),
								value: 'normal',
							},
							{
								label: __( 'Sticky section', 'nelyqo-hero' ),
								value: 'sticky',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { scrollMode: value } )
						}
					/>

					<SelectControl
						label={ __( 'Content vertical align', 'nelyqo-hero' ) }
						value={ contentAlign }
						options={ [
							{
								label: __( 'Top', 'nelyqo-hero' ),
								value: 'top',
							},
							{
								label: __( 'Center', 'nelyqo-hero' ),
								value: 'center',
							},
							{
								label: __( 'Bottom', 'nelyqo-hero' ),
								value: 'bottom',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { contentAlign: value } )
						}
					/>

					<ToggleControl
						label={ __( 'Overlay', 'nelyqo-hero' ) }
						checked={ hasOverlay }
						onChange={ ( value ) =>
							setAttributes( { hasOverlay: value } )
						}
					/>

					{ hasOverlay && (
						<RangeControl
							label={ __( 'Overlay opacity', 'nelyqo-hero' ) }
							value={ overlayOpacity }
							onChange={ ( value ) =>
								setAttributes( { overlayOpacity: value ?? 45 } )
							}
							min={ 0 }
							max={ 90 }
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Hero default colors', 'nelyqo-hero' ) }
					initialOpen={ false }
				>
					<BaseControl
						label={ __( 'Default text color', 'nelyqo-hero' ) }
						id="nelyqo-hero-text-color"
						help={ __(
							'Sets the default color for all inner text. Individual blocks can override this via their own color controls.',
							'nelyqo-hero'
						) }
					>
						<ColorPalette
							colors={ themeColors }
							value={ textColor }
							onChange={ ( value ) =>
								setAttributes( { textColor: value || '' } )
							}
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<div className="nelyqo-hero__stage">
					<div className="nelyqo-hero__overlay" />
					<div className="nelyqo-hero__inner">
						<InnerBlocks
							template={ TEMPLATE }
							templateLock={ false }
							renderAppender={ InnerBlocks.ButtonBlockAppender }
						/>
					</div>
				</div>
			</section>
		</>
	);
}
