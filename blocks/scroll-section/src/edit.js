import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import {
	InnerBlocks,
	InspectorControls,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	Notice,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import HorizontalMotionPanel from '../../shared/horizontal-motion-panel';
import './editor.scss';

const INTRO_CLASS = 'nelyqo-scroll-section__intro';
const ROOT_ALLOWED_BLOCKS = [ 'core/group', 'nelyqo/scroll-card' ];
const CARD_ALLOWED_BLOCKS = [ 'nelyqo/scroll-card' ];

const TEMPLATE = [
	[
		'core/group',
		{
			className: INTRO_CLASS,
			layout: {
				type: 'constrained',
			},
			lock: {
				move: true,
				remove: true,
			},
		},
		[
			[
				'core/paragraph',
				{
					placeholder: 'Section eyebrow',
					className: 'nelyqo-scroll-section__eyebrow',
				},
			],
			[
				'core/heading',
				{
					level: 2,
					placeholder: 'Section title',
				},
			],
			[
				'core/paragraph',
				{
					placeholder: 'Add section introduction copy...',
				},
			],
			[ 'core/buttons' ],
		],
	],
	[ 'nelyqo/scroll-card' ],
	[ 'nelyqo/scroll-card' ],
];

const hasClassName = ( className = '', expectedClass ) =>
	className.split( ' ' ).includes( expectedClass );

const isIntroBlock = ( block ) =>
	block?.name === 'core/group' &&
	hasClassName( block.attributes?.className, INTRO_CLASS );

const HorizontalTrackAppender = () => (
	<div className="nelyqo-scroll-section__editor-appender">
		<InnerBlocks.ButtonBlockAppender />
	</div>
);

export default function Edit( { attributes, setAttributes, clientId } ) {
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

	const directInnerBlocks = useSelect(
		( select ) => select( blockEditorStore ).getBlocks( clientId ),
		[ clientId ]
	);

	const introBlocks = directInnerBlocks.filter( isIntroBlock );
	const hasIntroBlock = introBlocks.length > 0;
	const hasInvalidStructure =
		introBlocks.length !== 1 ||
		directInnerBlocks.some(
			( block ) =>
				block.name !== 'nelyqo/scroll-card' && ! isIntroBlock( block )
		);

	const blockProps = useBlockProps( {
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

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'nelyqo-scroll-section__layout',
		},
		{
			allowedBlocks: hasIntroBlock
				? CARD_ALLOWED_BLOCKS
				: ROOT_ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
			renderAppender:
				mode === 'horizontal-track'
					? HorizontalTrackAppender
					: InnerBlocks.ButtonBlockAppender,
		}
	);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __(
						'Scroll section settings',
						'nelyqo-scroll-section'
					) }
					initialOpen={ true }
				>
					<Notice status="info" isDismissible={ false }>
						{ mode === 'horizontal-track'
							? __(
									'The vertical intro-plus-direct-cards structure stays canonical. Horizontal track remains a frontend enhancement built on the same structure.',
									'nelyqo-scroll-section'
							  )
							: __(
									'Vertical sticky keeps the intro fixed on desktop while the cards stay as direct child blocks in the flow.',
									'nelyqo-scroll-section'
							  ) }
					</Notice>

					{ hasInvalidStructure && (
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'Keep exactly one intro Group as the first direct child. After that, insert only Nelyqo Scroll Card blocks.',
								'nelyqo-scroll-section'
							) }
						</Notice>
					) }

					<SelectControl
						label={ __( 'Mode', 'nelyqo-scroll-section' ) }
						value={ mode }
						options={ [
							{
								label: __(
									'Vertical sticky',
									'nelyqo-scroll-section'
								),
								value: 'vertical-sticky',
							},
							{
								label: __(
									'Horizontal track',
									'nelyqo-scroll-section'
								),
								value: 'horizontal-track',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { mode: value } )
						}
					/>

					<SelectControl
						label={ __( 'Section tone', 'nelyqo-scroll-section' ) }
						value={ sectionTone }
						options={ [
							{
								label: __( 'Default', 'nelyqo-scroll-section' ),
								value: 'light',
							},
							{
								label: __( 'Soft', 'nelyqo-scroll-section' ),
								value: 'warm',
							},
							{
								label: __( 'Dark', 'nelyqo-scroll-section' ),
								value: 'dark',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { sectionTone: value } )
						}
					/>

					<ToggleControl
						label={
							mode === 'horizontal-track'
								? __(
										'Pinned stage on desktop',
										'nelyqo-scroll-section'
								  )
								: __(
										'Sticky intro content',
										'nelyqo-scroll-section'
								  )
						}
						checked={ stickyEnabled }
						onChange={ ( value ) =>
							setAttributes( { stickyEnabled: value } )
						}
					/>

					{ stickyEnabled && (
						<RangeControl
							label={
								mode === 'horizontal-track'
									? __(
											'Pinned stage offset',
											'nelyqo-scroll-section'
									  )
									: __(
											'Sticky offset',
											'nelyqo-scroll-section'
									  )
							}
							value={ stickyOffset }
							onChange={ ( value ) =>
								setAttributes( { stickyOffset: value ?? 32 } )
							}
							min={ 0 }
							max={ 160 }
						/>
					) }

					<ToggleControl
						label={ __(
							'Subtle motion styling',
							'nelyqo-scroll-section'
						) }
						checked={ motionEnabled }
						onChange={ ( value ) =>
							setAttributes( { motionEnabled: value } )
						}
					/>

					{ motionEnabled && (
						<SelectControl
							label={ __(
								'Motion intensity',
								'nelyqo-scroll-section'
							) }
							value={ motionIntensity }
							options={ [
								{
									label: __(
										'Subtle',
										'nelyqo-scroll-section'
									),
									value: 'subtle',
								},
								{
									label: __(
										'Medium',
										'nelyqo-scroll-section'
									),
									value: 'medium',
								},
								{
									label: __(
										'Strong',
										'nelyqo-scroll-section'
									),
									value: 'strong',
								},
							] }
							onChange={ ( value ) =>
								setAttributes( { motionIntensity: value } )
							}
						/>
					) }

					{ motionEnabled && (
						<ToggleControl
							label={ __(
								'Active card emphasis',
								'nelyqo-scroll-section'
							) }
							checked={ cardEmphasis }
							onChange={ ( value ) =>
								setAttributes( { cardEmphasis: value } )
							}
						/>
					) }

					{ mode === 'horizontal-track' && (
						<SelectControl
							label={ __(
								'Track card width',
								'nelyqo-scroll-section'
							) }
							value={ trackCardWidth }
							options={ [
								{
									label: __(
										'Compact',
										'nelyqo-scroll-section'
									),
									value: 'compact',
								},
								{
									label: __(
										'Medium',
										'nelyqo-scroll-section'
									),
									value: 'medium',
								},
								{
									label: __(
										'Wide',
										'nelyqo-scroll-section'
									),
									value: 'wide',
								},
							] }
							onChange={ ( value ) =>
								setAttributes( { trackCardWidth: value } )
							}
						/>
					) }
				</PanelBody>
				{ mode === 'horizontal-track' && (
					<HorizontalMotionPanel
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				) }
			</InspectorControls>

			<section { ...blockProps }>
				<div { ...innerBlocksProps } />
			</section>
		</>
	);
}
