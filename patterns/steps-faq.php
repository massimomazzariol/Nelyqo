<?php
/**
 * Title: Steps and FAQ
 * Slug: nelyqo/steps-faq
 * Categories: text, about
 * Keywords: how it works, steps, process, faq, questions, accordion
 * Description: Two columns: a numbered three-step process and a FAQ accordion built on the Details block.
 * Viewport Width: 1400
 *
 * @package Nelyqo
 */

$nelyqo_steps = array(
	array( '01', __( 'Tell us what you need', 'nelyqo' ), __( 'A few details are enough to get started.', 'nelyqo' ) ),
	array( '02', __( 'Get a clear answer', 'nelyqo' ), __( 'A tailored proposal, with no obligation.', 'nelyqo' ) ),
	array( '03', __( 'Relax, it is handled', 'nelyqo' ), __( 'Confirmation, contact details and follow-up.', 'nelyqo' ) ),
);

$nelyqo_faq = array(
	array( __( 'How much does it cost?', 'nelyqo' ), __( 'Explain how pricing works, or link to your price list.', 'nelyqo' ) ),
	array( __( 'How soon can you start?', 'nelyqo' ), __( 'Give a realistic lead time and what affects it.', 'nelyqo' ) ),
	array( __( 'Which areas do you cover?', 'nelyqo' ), __( 'List the places or the radius you serve.', 'nelyqo' ) ),
);
?>
<!-- wp:group {"tagName":"section","align":"full","className":"is-style-reveal","style":{"spacing":{"padding":{"top":"clamp(4rem,8vw,7rem)","bottom":"clamp(4rem,8vw,7rem)","left":"clamp(1.5rem,4.5vw,4rem)","right":"clamp(1.5rem,4.5vw,4rem)"}}},"layout":{"type":"constrained","contentSize":"1340px"}} -->
<section class="wp-block-group alignfull is-style-reveal" style="padding-top:clamp(4rem,8vw,7rem);padding-right:clamp(1.5rem,4.5vw,4rem);padding-bottom:clamp(4rem,8vw,7rem);padding-left:clamp(1.5rem,4.5vw,4rem)"><!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"clamp(2rem,7vw,6rem)"}}}} -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"style":{"typography":{"fontSize":"clamp(2.25rem,3.8vw,3.25rem)","fontWeight":"500"}},"fontFamily":"heading"} -->
<h2 class="wp-block-heading has-heading-font-family" style="font-size:clamp(2.25rem,3.8vw,3.25rem);font-weight:500"><?php esc_html_e( 'How it works', 'nelyqo' ); ?></h2>
<!-- /wp:heading -->

<?php foreach ( $nelyqo_steps as $nelyqo_step ) : ?><!-- wp:group {"style":{"border":{"top":{"color":"var:preset|color|line","width":"1px"}},"spacing":{"padding":{"top":"1.5rem","bottom":"1.5rem"},"blockGap":"2rem"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group" style="border-top-color:var(--wp--preset--color--line);border-top-width:1px;padding-top:1.5rem;padding-bottom:1.5rem"><!-- wp:paragraph {"style":{"typography":{"fontSize":"2.4rem","lineHeight":"1"},"layout":{"selfStretch":"fixed","flexSize":"3.5rem"}},"textColor":"accent","fontFamily":"heading"} -->
<p class="has-accent-color has-text-color has-heading-font-family" style="font-size:2.4rem;line-height:1"><?php echo esc_html( $nelyqo_step[0] ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0.2rem"},"layout":{"selfStretch":"fill","flexSize":null}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontSize":"1.05rem","fontWeight":"500"}}} -->
<p style="font-size:1.05rem;font-weight:500"><?php echo esc_html( $nelyqo_step[1] ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.88rem"}},"textColor":"foreground-muted"} -->
<p class="has-foreground-muted-color has-text-color" style="font-size:0.88rem"><?php echo esc_html( $nelyqo_step[2] ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<?php endforeach; ?></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"style":{"typography":{"fontSize":"clamp(2.25rem,3.8vw,3.25rem)","fontWeight":"500"}},"fontFamily":"heading"} -->
<h2 class="wp-block-heading has-heading-font-family" style="font-size:clamp(2.25rem,3.8vw,3.25rem);font-weight:500"><?php esc_html_e( 'Frequently asked questions', 'nelyqo' ); ?></h2>
<!-- /wp:heading -->

<?php foreach ( $nelyqo_faq as $nelyqo_item ) : ?><!-- wp:details -->
<details class="wp-block-details"><summary><?php echo esc_html( $nelyqo_item[0] ); ?></summary><!-- wp:paragraph {"style":{"typography":{"fontSize":"0.95rem"}},"textColor":"foreground-muted"} -->
<p class="has-foreground-muted-color has-text-color" style="font-size:0.95rem"><?php echo esc_html( $nelyqo_item[1] ); ?></p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->

<?php endforeach; ?></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></section>
<!-- /wp:group -->
