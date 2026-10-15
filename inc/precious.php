<?php
/**
 * Precious metals: gem section styles (styles/sections/gem-*.json), the "Metal foil" heading
 * style and the "Sand stream" Group style. Every stylesheet loads only on pages that use it.
 *
 * @package Nelyqo
 */

add_action( 'init', 'nelyqo_register_precious_styles' );
add_filter( 'render_block_core/group', 'nelyqo_sand_stream', 10, 2 );
foreach ( array( 'core/group', 'core/cover', 'core/heading' ) as $nelyqo_block ) {
	add_filter( "render_block_{$nelyqo_block}", 'nelyqo_precious_styles' );
}

/**
 * Registers the "Metal foil" heading style and the "Sand stream" Group style. The gems register
 * themselves from their theme.json partials.
 */
function nelyqo_register_precious_styles() {
	register_block_style(
		'core/heading',
		array(
			'name'  => 'foil',
			'label' => __( 'Metal foil', 'nelyqo' ),
		)
	);
	register_block_style(
		'core/group',
		array(
			'name'  => 'sand-stream',
			'label' => __( 'Sand stream', 'nelyqo' ),
		)
	);
}

/**
 * Loads precious.css on pages that render a gem section, a "Metal foil" heading or a "Sand stream".
 *
 * @param string $content Rendered block.
 * @return string
 */
function nelyqo_precious_styles( $content ) {
	if ( ! wp_style_is( 'nelyqo-precious' ) && ( str_contains( $content, 'is-style-gem-' ) || str_contains( $content, 'is-style-foil' ) || str_contains( $content, 'is-style-sand-stream' ) ) ) {
		$path = get_template_directory() . '/assets/css/precious.css';
		wp_enqueue_style( 'nelyqo-precious', get_template_directory_uri() . '/assets/css/precious.css', array(), (string) filemtime( $path ) );
		wp_style_add_data( 'nelyqo-precious', 'path', $path );
	}
	return $content;
}

/**
 * Gem colours by slug, read from styles/sections/gem-*.json.
 *
 * @return array<string, array<string, string>> Slug => CSS custom properties without the --nelyqo- prefix.
 */
function nelyqo_gems() {
	static $gems = null;
	if ( null === $gems ) {
		$gems = array();
		foreach ( glob( get_template_directory() . '/styles/sections/gem-*.json' ) as $file ) {
			$gem = json_decode( (string) file_get_contents( $file ), true );
			if ( empty( $gem['slug'] ) || empty( $gem['styles']['css'] ) ) {
				continue;
			}
			preg_match_all( '/--nelyqo-([\w-]+):\s*(#[0-9a-f]{6})/i', $gem['styles']['css'], $vars, PREG_SET_ORDER );
			$gems[ $gem['slug'] ] = array_column( $vars, 2, 1 );
		}
	}
	return $gems;
}

/**
 * "Sand stream" Group style: a line of metal grains that pours down through the Group's sections
 * as the page scrolls. The SVG is added at render time and never saved, so the content stays plain
 * Core blocks. Its colours follow the gem of each inner section, in order; the path meanders from
 * side to side, one bend per section.
 *
 * @param string $content Rendered block.
 * @param array  $block   Parsed block.
 * @return string
 */
function nelyqo_sand_stream( $content, $block ) {
	if ( ! str_contains( $block['attrs']['className'] ?? '', 'is-style-sand-stream' ) ) {
		return $content;
	}
	$end = strpos( $content, '>' );
	if ( false === $end ) {
		return $content;
	}

	// One colour per inner section: its gem's mid metal, or the theme's gold when it has none.
	$gems   = nelyqo_gems();
	$colors = array();
	foreach ( $block['innerBlocks'] as $inner ) {
		$color = '#e2b04a';
		if ( preg_match( '/\bis-style-(gem-[\w-]+)/', $inner['attrs']['className'] ?? '', $match ) && isset( $gems[ $match[1] ]['m2'] ) ) {
			$color = $gems[ $match[1] ]['m2'];
		}
		$colors[] = $color;
	}
	$count = max( 1, count( $colors ) );

	// A meander in a 1000 x (1000 per section) box. At mid-height of each section it runs along the
	// side opposite the text (sections alternate left and right, the first on the left), with vertical
	// tangents so every bend is smooth.
	$side  = static fn( $i ) => 0 === $i % 2 ? 830 : 170;
	$path  = sprintf( 'M500 120 C 500 320, %1$d 300, %1$d 500', $side( 0 ) );
	for ( $i = 1; $i < $count; $i++ ) {
		// Both control points sit on the boundary between the two sections.
		$path .= sprintf( ' C %1$d %2$d, %3$d %2$d, %3$d %4$d', $side( $i - 1 ), $i * 1000, $side( $i ), $i * 1000 + 500 );
	}
	$path .= sprintf( ' C %1$d %2$d, 500 %3$d, 500 %4$d', $side( $count - 1 ), $count * 1000 - 200, $count * 1000 - 300, $count * 1000 );

	$id    = wp_unique_id( 'nelyqo-sand-' );
	$stops = '';
	foreach ( $colors as $i => $color ) {
		$stops .= sprintf( '<stop offset="%s" stop-color="%s"/>', esc_attr( (string) round( ( $i + 0.5 ) / $count, 3 ) ), esc_attr( $color ) );
	}
	$strands = '';
	foreach ( array( 'fine', 'mid', 'coarse', 'glint' ) as $strand ) {
		$strands .= sprintf( '<path class="nelyqo-sand__%s" d="%s"/>', $strand, esc_attr( $path ) );
	}
	$svg = sprintf(
		'<svg class="nelyqo-sand" aria-hidden="true" focusable="false" viewBox="0 0 1000 %1$d" preserveAspectRatio="none"><defs><linearGradient id="%2$s" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="%1$d">%3$s</linearGradient></defs><g stroke="url(#%2$s)">%4$s</g></svg>',
		$count * 1000,
		esc_attr( $id ),
		$stops,
		$strands
	);
	return substr( $content, 0, $end + 1 ) . $svg . substr( $content, $end + 1 );
}
