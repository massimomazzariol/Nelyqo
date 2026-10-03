import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { Notice, PanelBody, SelectControl } from '@wordpress/components';
import './editor.scss';

const CONTENT_TEMPLATE = [
	[
		'core/paragraph',
		{
			placeholder: 'Track eyebrow',
			className: 'nelyqo-horizontal-scroll__eyebrow',
		},
	],
	[ 'core/heading', { level: 2, placeholder: 'Track title' } ],
	[
		'core/paragraph',
		{
			placeholder: 'Add intro copy for this horizontal section...',
		},
	],
	[ 'core/buttons' ],
];

const TEMPLATE = [
	[ 'nelyqo/horizontal-scroll-content', {}, CONTENT_TEMPLATE ],
	[ 'nelyqo/horizontal-scroll-track', {} ],
];

export default function Edit( { attributes, setAttributes } ) {
	const { trackCardWidth, sectionTone } = attributes;

	const blockProps = useBlockProps( {
		className: [
			'nelyqo-horizontal-scroll',
			`is-track-width-${ trackCardWidth }`,
			`is-tone-${ sectionTone }`,
		]
			.filter( Boolean )
			.join( ' ' ),
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{},
		{
			allowedBlocks: [
				'nelyqo/horizontal-scroll-content',
				'nelyqo/horizontal-scroll-track',
			],
			template: TEMPLATE,
			templateLock: 'all',
		}
	);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __(
						'Horizontal scroll settings',
						'nelyqo-horizontal-scroll'
					) }
					initialOpen={ true }
				>
					<Notice status="info" isDismissible={ false }>
						{ __(
							'Content stays static in the sticky viewport. Cards translate horizontally as you scroll down.',
							'nelyqo-horizontal-scroll'
						) }
					</Notice>

					<SelectControl
						label={ __(
							'Section tone',
							'nelyqo-horizontal-scroll'
						) }
						value={ sectionTone }
						options={ [
							{
								label: __(
									'Light',
									'nelyqo-horizontal-scroll'
								),
								value: 'light',
							},
							{
								label: __( 'Warm', 'nelyqo-horizontal-scroll' ),
								value: 'warm',
							},
							{
								label: __( 'Dark', 'nelyqo-horizontal-scroll' ),
								value: 'dark',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { sectionTone: value } )
						}
					/>

					<SelectControl
						label={ __(
							'Track card width',
							'nelyqo-horizontal-scroll'
						) }
						value={ trackCardWidth }
						options={ [
							{
								label: __(
									'Compact',
									'nelyqo-horizontal-scroll'
								),
								value: 'compact',
							},
							{
								label: __(
									'Medium',
									'nelyqo-horizontal-scroll'
								),
								value: 'medium',
							},
							{
								label: __( 'Wide', 'nelyqo-horizontal-scroll' ),
								value: 'wide',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { trackCardWidth: value } )
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
