<?php
/**
 * Title: Intro with coded list
 * Slug: nelyqo/coded-list
 * Categories: text, featured
 * Keywords: list, locations, services, codes, rows
 * Description: Section intro on the left, a ruled list on the right: short code, name and a link on each row (airports, branches, services).
 * Viewport Width: 1400
 *
 * @package Nelyqo
 */

$nelyqo_rows = array(
	array( 'A01', __( 'First location or service', 'nelyqo' ) ),
	array( 'B02', __( 'Second location or service', 'nelyqo' ) ),
	array( 'C03', __( 'Third location or service', 'nelyqo' ) ),
	array( 'D04', __( 'Fourth location or service', 'nelyqo' ) ),
);
?>
<!-- wp:group {"tagName":"section","align":"full","className":"is-style-reveal","style":{"spacing":{"padding":{"top":"clamp(4rem,8vw,7rem)","bottom":"clamp(4rem,8vw,7rem)","left":"clamp(1.5rem,7vw,6.875rem)","right":"clamp(1.5rem,7vw,6.875rem)"}}},"layout":{"type":"constrained","contentSize":"1340px"}} -->
<section class="wp-block-group alignfull is-style-reveal" style="padding-top:clamp(4rem,8vw,7rem);padding-right:clamp(1.5rem,7vw,6.875rem);padding-bottom:clamp(4rem,8vw,7rem);padding-left:clamp(1.5rem,7vw,6.875rem)"><!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"clamp(2rem,6vw,6rem)"}}}} -->
<div class="wp-block-columns"><!-- wp:column {"width":"42%"} -->
<div class="wp-block-column" style="flex-basis:42%"><!-- wp:paragraph {"style":{"typography":{"textTransform":"uppercase","letterSpacing":"0.2em","fontSize":"0.72rem"}},"textColor":"primary"} -->
<p class="has-primary-color has-text-color" style="font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase"><?php esc_html_e( 'Where we work', 'nelyqo' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"style":{"typography":{"fontSize":"clamp(2rem,3.6vw,3.25rem)","lineHeight":"1.06","fontWeight":"500"}},"fontFamily":"heading"} -->
<h2 class="wp-block-heading has-heading-font-family" style="font-size:clamp(2rem,3.6vw,3.25rem);font-weight:500;line-height:1.06"><?php esc_html_e( 'Everything you cover, at a glance', 'nelyqo' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.7"}},"textColor":"foreground-muted"} -->
<p class="has-foreground-muted-color has-text-color" style="line-height:1.7"><?php esc_html_e( 'A short paragraph that frames the list: what the rows have in common and how to get started with any of them.', 'nelyqo' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"58%"} -->
<div class="wp-block-column" style="flex-basis:58%"><!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><?php foreach ( $nelyqo_rows as $nelyqo_row ) : ?><!-- wp:group {"style":{"border":{"bottom":{"color":"var:preset|color|line","width":"1px"}},"spacing":{"padding":{"top":"1.1rem","bottom":"1.1rem"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--line);border-bottom-width:1px;padding-top:1.1rem;padding-bottom:1.1rem"><!-- wp:paragraph {"style":{"typography":{"fontSize":"2rem","lineHeight":"1"},"layout":{"selfStretch":"fixed","flexSize":"5.5rem"}},"textColor":"accent","fontFamily":"heading"} -->
<p class="has-accent-color has-text-color has-heading-font-family" style="font-size:2rem;line-height:1"><?php echo esc_html( $nelyqo_row[0] ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"layout":{"selfStretch":"fill","flexSize":null}}} -->
<p><?php echo esc_html( $nelyqo_row[1] ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"textTransform":"uppercase","letterSpacing":"0.16em","fontSize":"0.7rem"}},"textColor":"foreground-muted"} -->
<p class="has-foreground-muted-color has-text-color" style="font-size:0.7rem;letter-spacing:0.16em;text-transform:uppercase"><a href="#"><?php esc_html_e( 'Learn more', 'nelyqo' ); ?></a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --><?php endforeach; ?></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></section>
<!-- /wp:group -->
