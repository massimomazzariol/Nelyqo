/**
 * "Horizontal motion" settings, shared by the Horizontal Scroll block and the Scroll Section
 * horizontal track. The theme's horizontal engine reads them at render time (functions.php), so
 * changing them never changes the saved markup.
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';

export default function HorizontalMotionPanel( {
	attributes,
	setAttributes,
	withEmphasis = false,
} ) {
	const {
		trackDirection,
		trackSpeed,
		showProgress,
		settleOnCard,
		mobileLayout,
		cardEmphasis,
		motionIntensity,
	} = attributes;

	return (
		<PanelBody
			title={ __( 'Horizontal motion', 'nelyqo' ) }
			initialOpen={ false }
		>
			<SelectControl
				label={ __( 'Cards travel', 'nelyqo' ) }
				help={ __(
					'Automatic follows the language: left in left-to-right languages, right in right-to-left ones.',
					'nelyqo'
				) }
				value={ trackDirection }
				options={ [
					{ label: __( 'Automatic', 'nelyqo' ), value: 'auto' },
					{ label: __( 'To the left', 'nelyqo' ), value: 'left' },
					{ label: __( 'To the right', 'nelyqo' ), value: 'right' },
				] }
				onChange={ ( value ) =>
					setAttributes( { trackDirection: value } )
				}
			/>
			<SelectControl
				label={ __( 'Speed', 'nelyqo' ) }
				help={ __(
					'How much the page scrolls while the cards cross.',
					'nelyqo'
				) }
				value={ trackSpeed }
				options={ [
					{ label: __( 'Slow', 'nelyqo' ), value: 'slow' },
					{ label: __( 'Normal', 'nelyqo' ), value: 'normal' },
					{ label: __( 'Fast', 'nelyqo' ), value: 'fast' },
				] }
				onChange={ ( value ) => setAttributes( { trackSpeed: value } ) }
			/>
			<ToggleControl
				label={ __( 'Progress bar', 'nelyqo' ) }
				help={ __(
					'A thin line under the cards that fills as they travel.',
					'nelyqo'
				) }
				checked={ !! showProgress }
				onChange={ ( value ) => setAttributes( { showProgress: value } ) }
			/>
			<ToggleControl
				label={ __( 'Settle on a card', 'nelyqo' ) }
				help={ __(
					'When scrolling stops, the cards finish their move to the next whole card.',
					'nelyqo'
				) }
				checked={ !! settleOnCard }
				onChange={ ( value ) => setAttributes( { settleOnCard: value } ) }
			/>
			<SelectControl
				label={ __( 'On phones', 'nelyqo' ) }
				value={ mobileLayout }
				options={ [
					{
						label: __( 'Swipe the cards sideways', 'nelyqo' ),
						value: 'swipe',
					},
					{
						label: __( 'Stack the cards', 'nelyqo' ),
						value: 'stack',
					},
				] }
				onChange={ ( value ) =>
					setAttributes( { mobileLayout: value } )
				}
			/>
			{ withEmphasis && (
				<ToggleControl
					label={ __( 'Card emphasis', 'nelyqo' ) }
					help={ __(
						'The card in the middle is fully lit, the others a little smaller and fainter.',
						'nelyqo'
					) }
					checked={ !! cardEmphasis }
					onChange={ ( value ) =>
						setAttributes( { cardEmphasis: value } )
					}
				/>
			) }
			{ withEmphasis && cardEmphasis && (
				<SelectControl
					label={ __( 'Emphasis strength', 'nelyqo' ) }
					value={ motionIntensity }
					options={ [
						{ label: __( 'Subtle', 'nelyqo' ), value: 'subtle' },
						{ label: __( 'Medium', 'nelyqo' ), value: 'medium' },
						{ label: __( 'Strong', 'nelyqo' ), value: 'strong' },
					] }
					onChange={ ( value ) =>
						setAttributes( { motionIntensity: value } )
					}
				/>
			) }
		</PanelBody>
	);
}
