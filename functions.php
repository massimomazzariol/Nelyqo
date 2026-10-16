<?php
/**
 * Nelyqo theme functions.
 *
 * @package Nelyqo
 * @copyright 2026 Massimo Mazzariol - https://github.com/massimomazzariol/Nelyqo
 */

require get_template_directory() . '/inc/style-variations.php';
require get_template_directory() . '/inc/performance.php';
require get_template_directory() . '/inc/discretion.php';
require get_template_directory() . '/inc/precious.php';

add_action( 'after_setup_theme', 'nelyqo_theme_setup' );
add_action( 'wp_enqueue_scripts', 'nelyqo_enqueue_styles' );
add_action( 'init', 'nelyqo_register_custom_blocks' );
add_action( 'init', 'nelyqo_register_block_styles' );
add_filter( 'render_block_core/image', 'nelyqo_backport_lightbox', 20 );
add_filter( 'render_block_nelyqo/scroll-section', 'nelyqo_horizontal_engine', 10, 2 );
add_filter( 'render_block_nelyqo/horizontal-scroll', 'nelyqo_horizontal_engine', 10, 2 );
add_filter( 'render_block_nelyqo/scroll-section', 'nelyqo_scroll_section_card_count', 10, 2 );

/**
 * Backports Gutenberg PR #79058 to the core Image lightbox: enlarged images keep their own
 * proportions instead of the gallery/thumbnail crop. The patched module replaces core's only
 * while core ships the exact file it was made from (WordPress 7.1.2); any core update turns the
 * backport off by itself, so it can never pin an outdated copy. Runs only on pages that render
 * a lightbox (core adds it at priority 15), once per page.
 *
 * @param string $content Rendered Image block.
 * @return string
 */
function nelyqo_backport_lightbox( $content ) {
	static $done = false;
	if ( $done || ! str_contains( $content, 'wp-lightbox-container' ) ) {
		return $content;
	}
	$done = true;

	// MD5 of wp-includes/js/dist/script-modules/block-library/image/view.js in WordPress 7.1.2 (unchanged in 7.1.3).
	$patched_from = '62f41374a716f8279dbad485c21344a9';
	$core_file    = ABSPATH . WPINC . '/js/dist/script-modules/block-library/image/view.js';
	// Line endings are normalized: git checkouts on Windows and FTP text mode turn LF into CRLF.
	if ( ! is_readable( $core_file ) || md5( str_replace( "\r\n", "\n", (string) file_get_contents( $core_file ) ) ) !== $patched_from ) {
		return $content;
	}

	// Core has already enqueued its module while rendering the block: swap it and enqueue ours.
	$id = '@wordpress/block-library/image/view';
	wp_deregister_script_module( $id );
	wp_register_script_module(
		$id,
		get_template_directory_uri() . '/assets/js/lightbox-view.js',
		array( '@wordpress/interactivity' ),
		(string) filemtime( get_template_directory() . '/assets/js/lightbox-view.js' ),
		array(
			'fetchpriority' => 'low',
			'in_footer'     => true,
		)
	);
	wp_enqueue_script_module( $id );

	$path = get_template_directory() . '/assets/css/lightbox.css';
	wp_enqueue_style( 'nelyqo-lightbox', get_template_directory_uri() . '/assets/css/lightbox.css', array(), (string) filemtime( $path ) );
	wp_style_add_data( 'nelyqo-lightbox', 'path', $path );
	return $content;
}

/**
 * Registers the Group styles: "Sticky section" holds the Group's content still for a
 * stretch of scrolling, like the Hero block's sticky mode; "Reveal on scroll" lets its
 * text rise into place as it enters the viewport.
 */
function nelyqo_register_block_styles() {
	register_block_style(
		'core/group',
		array(
			'name'  => 'sticky-section',
			'label' => __( 'Sticky section', 'nelyqo' ),
		)
	);
	register_block_style(
		'core/group',
		array(
			'name'  => 'reveal',
			'label' => __( 'Reveal on scroll', 'nelyqo' ),
		)
	);
}

/**
 * Configures theme support and editor styles.
 */
function nelyqo_theme_setup() {
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'title-tag' );
	add_editor_style( array( 'style.css', 'assets/css/precious.css' ) );
}

/**
 * Enqueues the theme stylesheets. They are loaded from the parent theme directory, so a
 * child theme gets them without re-enqueueing and keeps its own style.css for itself.
 */
function nelyqo_enqueue_styles() {
	wp_enqueue_style(
		'nelyqo-style',
		get_template_directory_uri() . '/style.css',
		array(),
		wp_get_theme( get_template() )->get( 'Version' )
	);

	wp_enqueue_style(
		'nelyqo-structure',
		get_template_directory_uri() . '/assets/css/structure.css',
		array( 'nelyqo-style' ),
		(string) filemtime( get_template_directory() . '/assets/css/structure.css' )
	);

	// With a path, WordPress inlines these small stylesheets (within styles_inline_size_limit): two requests fewer.
	wp_style_add_data( 'nelyqo-style', 'path', get_template_directory() . '/style.css' );
	wp_style_add_data( 'nelyqo-structure', 'path', get_template_directory() . '/assets/css/structure.css' );
}

/**
 * Horizontal engine (assets/js/horizontal-engine.js) for the Horizontal Scroll block and the Scroll
 * Section horizontal track: loads the script and its styles only where one renders, and turns the
 * block's motion options into classes at render time, so the saved markup never changes. The
 * vertical Scroll Section modes animate with CSS alone and load neither.
 *
 * @param string $content Rendered block.
 * @param array  $block   Parsed block.
 * @return string
 */
function nelyqo_horizontal_engine( $content, $block ) {
	$attrs = $block['attrs'] ?? array();
	$own   = 'nelyqo/horizontal-scroll' === $block['blockName'];
	if ( ! $own && 'horizontal-track' !== ( $attrs['mode'] ?? '' ) ) {
		return $content;
	}
	if ( ! wp_script_is( 'nelyqo-horizontal-engine' ) ) {
		$version = (string) filemtime( get_template_directory() . '/assets/js/horizontal-engine.js' );
		wp_enqueue_script(
			'nelyqo-horizontal-engine',
			get_template_directory_uri() . '/assets/js/horizontal-engine.js',
			array(),
			$version,
			array(
				'in_footer' => true,
				'strategy'  => 'defer',
			)
		);
		$path = get_template_directory() . '/assets/css/horizontal-engine.css';
		wp_enqueue_style( 'nelyqo-horizontal-engine', get_template_directory_uri() . '/assets/css/horizontal-engine.css', array(), (string) filemtime( $path ) );
		wp_style_add_data( 'nelyqo-horizontal-engine', 'path', $path );
	}
	if ( ! $own && ! wp_style_is( 'nelyqo-scroll-section-horizontal' ) ) {
		$build = '/blocks/scroll-section/build/';
		$asset = require get_template_directory() . $build . 'view.asset.php';
		wp_enqueue_style( 'nelyqo-scroll-section-horizontal', get_template_directory_uri() . $build . 'view.css', array( 'nelyqo-scroll-section-style' ), $asset['version'] );
		wp_style_add_data( 'nelyqo-scroll-section-horizontal', 'rtl', 'replace' );
		wp_style_add_data( 'nelyqo-scroll-section-horizontal', 'path', get_template_directory() . $build . 'view.css' );
	}

	$classes = array();
	if ( ! empty( $attrs['showProgress'] ) ) {
		$classes[] = 'has-h-progress';
	}
	if ( ! empty( $attrs['settleOnCard'] ) ) {
		$classes[] = 'has-h-settle';
	}
	if ( in_array( $attrs['trackSpeed'] ?? '', array( 'slow', 'fast' ), true ) ) {
		$classes[] = 'is-h-speed-' . $attrs['trackSpeed'];
	}
	if ( in_array( $attrs['trackDirection'] ?? '', array( 'left', 'right' ), true ) ) {
		$classes[] = 'is-h-dir-' . $attrs['trackDirection'];
	}
	if ( 'stack' === ( $attrs['mobileLayout'] ?? '' ) ) {
		$classes[] = 'is-h-mobile-stack';
	}
	// Scroll Section saves its own emphasis classes; Horizontal Scroll gets them here (off by default).
	if ( $own && ! empty( $attrs['cardEmphasis'] ) ) {
		$classes[] = 'has-h-emphasis';
		if ( in_array( $attrs['motionIntensity'] ?? '', array( 'subtle', 'strong' ), true ) ) {
			$classes[] = 'is-motion-' . $attrs['motionIntensity'];
		}
	}
	$tags = new WP_HTML_Tag_Processor( $content );
	if ( ! $classes || ! $tags->next_tag() ) {
		return $content;
	}
	foreach ( $classes as $class ) {
		$tags->add_class( $class );
	}
	return $tags->get_updated_html();
}

/**
 * Tells the Scroll Section CSS how many cards it holds (--nelyqo-scroll-card-count), so the sticky
 * introduction can span every card row and hold still in the middle of the screen. Added at render
 * time: the saved markup does not change.
 *
 * @param string $content Rendered block.
 * @param array  $block   Parsed block.
 * @return string
 */
function nelyqo_scroll_section_card_count( $content, $block ) {
	$count = count( array_filter( $block['innerBlocks'] ?? array(), static fn( $inner ) => 'nelyqo/scroll-card' === $inner['blockName'] ) );
	$tags  = new WP_HTML_Tag_Processor( $content );
	if ( 0 === $count || ! $tags->next_tag() ) {
		return $content;
	}
	$style = rtrim( trim( (string) $tags->get_attribute( 'style' ) ), ';' );
	$tags->set_attribute( 'style', ( '' === $style ? '' : $style . ';' ) . '--nelyqo-scroll-card-count:' . $count );
	return $tags->get_updated_html();
}

/**
 * Registers every custom block found in blocks/.
 */
function nelyqo_register_custom_blocks() {
	foreach ( glob( get_template_directory() . '/blocks/*/block.json' ) as $block_json ) {
		register_block_type( dirname( $block_json ) );
	}
}
