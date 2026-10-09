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

add_action( 'after_setup_theme', 'nelyqo_theme_setup' );
add_action( 'wp_enqueue_scripts', 'nelyqo_enqueue_styles' );
add_action( 'init', 'nelyqo_register_custom_blocks' );
add_action( 'init', 'nelyqo_register_block_styles' );
add_action( 'init', 'nelyqo_backport_lightbox' );

/**
 * Backports Gutenberg PR #79058 to the core Image lightbox: enlarged images keep their own
 * proportions instead of the gallery/thumbnail crop. The patched module replaces core's only
 * while core ships the exact file it was made from (WordPress 7.1.2); any core update turns the
 * backport off by itself, so it can never pin an outdated copy.
 */
function nelyqo_backport_lightbox() {
	// MD5 of wp-includes/js/dist/script-modules/block-library/image/view.js in WordPress 7.1.2.
	$patched_from = '62f41374a716f8279dbad485c21344a9';
	$core_file    = ABSPATH . WPINC . '/js/dist/script-modules/block-library/image/view.js';
	if ( ! is_readable( $core_file ) || md5_file( $core_file ) !== $patched_from ) {
		return;
	}

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

	// The matching styles, only on pages that actually render a lightbox (core adds it at priority 15).
	add_filter(
		'render_block_core/image',
		static function ( $content ) {
			if ( str_contains( $content, 'wp-lightbox-container' ) && ! wp_style_is( 'nelyqo-lightbox' ) ) {
				$path = get_template_directory() . '/assets/css/lightbox.css';
				wp_enqueue_style( 'nelyqo-lightbox', get_template_directory_uri() . '/assets/css/lightbox.css', array(), (string) filemtime( $path ) );
				wp_style_add_data( 'nelyqo-lightbox', 'path', $path );
			}
			return $content;
		},
		20
	);
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
	add_editor_style( 'style.css' );
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
 * Registers every custom block found in blocks/.
 */
function nelyqo_register_custom_blocks() {
	foreach ( glob( get_template_directory() . '/blocks/*/block.json' ) as $block_json ) {
		register_block_type( dirname( $block_json ) );
	}
}
