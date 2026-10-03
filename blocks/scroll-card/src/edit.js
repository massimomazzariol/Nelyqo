import { __ } from '@wordpress/i18n';
import {
	InnerBlocks,
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import './editor.scss';

const TEMPLATE = [
	[ 'core/image' ],
	[
		'core/heading',
		{
			level: 3,
			placeholder: 'Card title',
		},
	],
	[
		'core/paragraph',
		{
			placeholder: 'Add card copy...',
		},
	],
	[ 'core/buttons' ],
];

export default function Edit( { attributes, setAttributes } ) {
	const { tone, height, featured, ctaShell, showIndex } = attributes;

	const blockProps = useBlockProps( {
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

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'nelyqo-scroll-card__content',
		},
		{
			template: TEMPLATE,
			templateLock: false,
			renderAppender: InnerBlocks.ButtonBlockAppender,
		}
	);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Scroll card settings', 'nelyqo-scroll-card' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Tone', 'nelyqo-scroll-card' ) }
						value={ tone }
						options={ [
							{
								label: __( 'Default', 'nelyqo-scroll-card' ),
								value: 'light',
							},
							{
								label: __( 'Dark', 'nelyqo-scroll-card' ),
								value: 'dark',
							},
							{
								label: __( 'Accent', 'nelyqo-scroll-card' ),
								value: 'warm',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { tone: value } )
						}
					/>

					<SelectControl
						label={ __( 'Card height', 'nelyqo-scroll-card' ) }
						value={ height }
						options={ [
							{
								label: __( 'Auto', 'nelyqo-scroll-card' ),
								value: 'auto',
							},
							{
								label: __( 'Medium', 'nelyqo-scroll-card' ),
								value: 'medium',
							},
							{
								label: __( 'Large', 'nelyqo-scroll-card' ),
								value: 'large',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { height: value } )
						}
					/>

					<ToggleControl
						label={ __(
							'Featured emphasis',
							'nelyqo-scroll-card'
						) }
						checked={ featured }
						onChange={ ( value ) =>
							setAttributes( { featured: value } )
						}
					/>

					<ToggleControl
						label={ __(
							'Button shell styling',
							'nelyqo-scroll-card'
						) }
						checked={ ctaShell }
						onChange={ ( value ) =>
							setAttributes( { ctaShell: value } )
						}
					/>

					<ToggleControl
						label={ __( 'Show index badge', 'nelyqo-scroll-card' ) }
						checked={ showIndex }
						onChange={ ( value ) =>
							setAttributes( { showIndex: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<article { ...blockProps }>
				{ showIndex && (
					<span
						className="nelyqo-scroll-card__index"
						aria-hidden="true"
					/>
				) }
				<div { ...innerBlocksProps } />
			</article>
		</>
	);
}
