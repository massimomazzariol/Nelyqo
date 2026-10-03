import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { Notice, PanelBody, SelectControl } from '@wordpress/components';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { sectionTone, heightMode, verticalAlign } = attributes;

	const blockProps = useBlockProps( {
		className: [
			'nelyqo-fullpage-section',
			`is-tone-${ sectionTone }`,
			`is-height-${ heightMode }`,
			`is-align-${ verticalAlign }`,
		]
			.filter( Boolean )
			.join( ' ' ),
	} );

	const innerBlocksProps = useInnerBlocksProps( {
		className: 'nelyqo-fullpage-section__layout',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __(
						'Fullpage section settings',
						'nelyqo-fullpage-section'
					) }
					initialOpen={ true }
				>
					<Notice status="info" isDismissible={ false }>
						{ __(
							'On the frontend, consecutive Fullpage Section blocks become a vertical slide sequence. Inner blocks stay normal content inside this slide.',
							'nelyqo-fullpage-section'
						) }
					</Notice>

					<SelectControl
						label={ __(
							'Section tone',
							'nelyqo-fullpage-section'
						) }
						value={ sectionTone }
						options={ [
							{
								label: __( 'Light', 'nelyqo-fullpage-section' ),
								value: 'light',
							},
							{
								label: __( 'Soft', 'nelyqo-fullpage-section' ),
								value: 'warm',
							},
							{
								label: __( 'Dark', 'nelyqo-fullpage-section' ),
								value: 'dark',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { sectionTone: value } )
						}
					/>

					<SelectControl
						label={ __(
							'Section height',
							'nelyqo-fullpage-section'
						) }
						value={ heightMode }
						options={ [
							{
								label: __(
									'Viewport',
									'nelyqo-fullpage-section'
								),
								value: 'viewport',
							},
							{
								label: __(
									'Content-driven',
									'nelyqo-fullpage-section'
								),
								value: 'auto',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { heightMode: value } )
						}
					/>

					<SelectControl
						label={ __(
							'Vertical alignment',
							'nelyqo-fullpage-section'
						) }
						value={ verticalAlign }
						options={ [
							{
								label: __( 'Start', 'nelyqo-fullpage-section' ),
								value: 'start',
							},
							{
								label: __(
									'Center',
									'nelyqo-fullpage-section'
								),
								value: 'center',
							},
							{
								label: __( 'End', 'nelyqo-fullpage-section' ),
								value: 'end',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { verticalAlign: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<div { ...innerBlocksProps } />
			</section>
		</>
	);
}
