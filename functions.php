<?php
/**
 * Nelyqo theme functions.
 *
 * @package Nelyqo
 * @copyright 2026 Massimo Mazzariol - https://github.com/massimomazzariol/Nelyqo
 */

add_action( 'after_setup_theme', 'nelyqo_theme_setup' );
add_action( 'wp_enqueue_scripts', 'nelyqo_enqueue_styles' );
add_action( 'init', 'nelyqo_register_custom_blocks' );
add_action( 'init', 'nelyqo_register_block_styles' );

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
