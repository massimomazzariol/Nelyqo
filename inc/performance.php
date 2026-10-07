<?php
/**
 * Front-end performance defaults: font preloading, no emoji polyfill, lazy autoplay videos.
 *
 * @package Nelyqo
 */

add_action( 'wp_head', 'nelyqo_preload_fonts', 1 );
add_action( 'init', 'nelyqo_disable_emoji' );
add_filter( 'render_block_core/video', 'nelyqo_lazy_video' );
add_filter( 'render_block_core/cover', 'nelyqo_lazy_video' );

/**
 * Font files to preload: the first woff2 source of every fontFace that the active theme
 * (child included) declares in theme.json. Filter 'nelyqo_preload_fonts' to change the list.
 *
 * @return string[] Font URLs.
 */
function nelyqo_font_preloads() {
	$urls     = array();
	$families = wp_get_global_settings( array( 'typography', 'fontFamilies', 'theme' ) );
	foreach ( is_array( $families ) ? $families : array() as $family ) {
		foreach ( $family['fontFace'] ?? array() as $face ) {
			foreach ( (array) ( $face['src'] ?? array() ) as $src ) {
				if ( str_ends_with( $src, '.woff2' ) ) {
					$urls[] = str_starts_with( $src, 'file:./' ) ? get_theme_file_uri( substr( $src, 7 ) ) : $src;
					break;
				}
			}
		}
	}
	return array_values( array_unique( apply_filters( 'nelyqo_preload_fonts', $urls ) ) );
}

/**
 * Preloads the theme fonts, so text renders in its final face at once instead of
 * swapping after the stylesheet is parsed (fewer layout shifts).
 */
function nelyqo_preload_fonts() {
	foreach ( nelyqo_font_preloads() as $url ) {
		printf( '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n", esc_url( $url ) );
	}
}

/**
 * Removes the emoji polyfill (a script and inline styles on every page): current browsers draw
 * emoji natively. Filter 'nelyqo_disable_emoji' to false to keep it.
 */
function nelyqo_disable_emoji() {
	if ( ! apply_filters( 'nelyqo_disable_emoji', true ) ) {
		return;
	}
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
	remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
	remove_action( 'admin_enqueue_scripts', 'wp_enqueue_emoji_styles' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
	add_filter( 'emoji_svg_url', '__return_false' );
}

/**
 * Autoplaying videos no longer download on page load: the server drops autoplay and sets
 * preload="none", and assets/js/lazy-video.js plays each one when it nears the viewport.
 * With reduced motion requested they stay paused on their first frame. Without JavaScript
 * they simply do not autoplay.
 *
 * @param string $content Rendered block.
 */
function nelyqo_lazy_video( $content ) {
	if ( ! str_contains( $content, '<video' ) || ! apply_filters( 'nelyqo_lazy_video', true ) ) {
		return $content;
	}
	$tags = new WP_HTML_Tag_Processor( $content );
	$lazy = false;
	while ( $tags->next_tag( 'video' ) ) {
		if ( null === $tags->get_attribute( 'autoplay' ) ) {
			continue;
		}
		$tags->remove_attribute( 'autoplay' );
		$tags->set_attribute( 'preload', 'none' );
		$tags->set_attribute( 'data-nelyqo-autoplay', '' );
		$lazy = true;
	}
	if ( $lazy ) {
		$path = get_template_directory() . '/assets/js/lazy-video.js';
		wp_enqueue_script( 'nelyqo-lazy-video', get_template_directory_uri() . '/assets/js/lazy-video.js', array(), (string) filemtime( $path ), array( 'strategy' => 'defer' ) );
	}
	return $tags->get_updated_html();
}