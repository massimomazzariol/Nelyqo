<?php
/**
 * Title: Hero with side card
 * Slug: nelyqo/hero-split
 * Categories: banner
 * Keywords: hero, cover, sticky, intro
 * Description: Full-height cover that holds still while scrolling, with the pitch on the left and a call-to-action card on the right. Replace the background with your photo.
 * Viewport Width: 1400
 *
 * @package Nelyqo
 */

?>
<!-- wp:group {"align":"full","className":"is-style-sticky-section","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"blockGap":"0"}},"layout":{"type":"default"}} -->
<div class="wp-block-group alignfull is-style-sticky-section" style="margin-top:0;margin-bottom:0"><!-- wp:cover {"overlayColor":"foreground","isUserOverlayColor":true,"minHeight":92,"minHeightUnit":"vh","align":"full","style":{"spacing":{"padding":{"top":"clamp(7rem,12vw,9rem)","bottom":"clamp(3rem,6vw,5rem)","left":"clamp(1.5rem,7vw,6.875rem)","right":"clamp(1.5rem,7vw,6.875rem)"}}},"textColor":"on-primary","layout":{"type":"constrained","contentSize":"1340px"}} -->
<div class="wp-block-cover alignfull has-on-primary-color has-text-color" style="padding-top:clamp(7rem,12vw,9rem);padding-right:clamp(1.5rem,7vw,6.875rem);padding-bottom:clamp(3rem,6vw,5rem);padding-left:clamp(1.5rem,7vw,6.875rem);min-height:92vh"><span aria-hidden="true" class="wp-block-cover__background has-foreground-background-color has-background-dim-100 has-background-dim"></span><div class="wp-block-cover__inner-container"><!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"clamp(2rem,5vw,5rem)"}}}} -->
<div class="wp-block-columns are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center","width":"56%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:56%"><!-- wp:paragraph {"style":{"typography":{"textTransform":"uppercase","letterSpacing":"0.2em","fontSize":"0.72rem"}}} -->
<p style="font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase"><?php esc_html_e( 'Your service · Your city', 'nelyqo' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"clamp(2.75rem,5.6vw,4.75rem)","lineHeight":"1.02","fontWeight":"500"}},"fontFamily":"heading"} -->
<h1 class="wp-block-heading has-heading-font-family" style="font-size:clamp(2.75rem,5.6vw,4.75rem);font-weight:500;line-height:1.02"><?php echo wp_kses( __( 'A clear promise, <em>said beautifully</em>', 'nelyqo' ), array( 'em' => array() ) ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.1rem","lineHeight":"1.65"}}} -->
<p style="font-size:1.1rem;line-height:1.65"><?php esc_html_e( 'One or two sentences on what you offer, who it is for and what happens next. Keep it short: the card on the right does the asking.', 'nelyqo' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:list {"className":"is-style-default","style":{"typography":{"fontSize":"0.9rem"},"spacing":{"margin":{"top":"2rem"}}}} -->
<ul style="margin-top:2rem;font-size:0.9rem" class="wp-block-list is-style-default"><!-- wp:list-item -->
<li><?php esc_html_e( 'First reason to trust you', 'nelyqo' ); ?></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><?php esc_html_e( 'Second reason to trust you', 'nelyqo' ); ?></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><?php esc_html_e( 'Third reason to trust you', 'nelyqo' ); ?></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":"44%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:44%"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|line","radius":"3px"},"spacing":{"padding":{"top":"2rem","bottom":"2rem","left":"2rem","right":"2rem"}}},"backgroundColor":"background","textColor":"foreground","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-border-color has-foreground-color has-background-background-color has-text-color has-background" style="border-color:var(--wp--preset--color--line);border-width:1px;border-radius:3px;padding-top:2rem;padding-right:2rem;padding-bottom:2rem;padding-left:2rem"><!-- wp:heading {"style":{"typography":{"fontSize":"1.75rem","fontWeight":"500"}},"fontFamily":"heading"} -->
<h2 class="wp-block-heading has-heading-font-family" style="font-size:1.75rem;font-weight:500"><?php esc_html_e( 'Ask for a quote', 'nelyqo' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"}},"textColor":"foreground-muted"} -->
<p class="has-foreground-muted-color has-text-color" style="font-size:0.9rem"><?php esc_html_e( 'Drop a form block here, or keep the buttons and link them to your contact page.', 'nelyqo' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button"><?php esc_html_e( 'Get in touch', 'nelyqo' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button"><?php esc_html_e( 'See prices', 'nelyqo' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div></div>
<!-- /wp:cover --></div>
<!-- /wp:group -->
