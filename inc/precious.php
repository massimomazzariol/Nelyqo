<?php
/**
 * Precious metals: gem section styles (styles/sections/gem-*.json), the "Metal foil" heading
 * style and the "Sand stream" Group style. Every stylesheet loads only on pages that use it.
 *
 * @package Nelyqo
 */

add_action( 'init', 'nelyqo_register_precious_styles' );
add_filter( 'render_block_data', 'nelyqo_sand_stream_mark' );
foreach ( array( 'core/group', 'core/cover', 'core/heading', 'core/paragraph' ) as $nelyqo_block ) {
	add_filter( "render_block_{$nelyqo_block}", 'nelyqo_precious_styles' );
}
foreach ( array( 'core/group', 'core/cover' ) as $nelyqo_block ) {
	add_filter( "render_block_{$nelyqo_block}", 'nelyqo_sand_stream', 10, 2 );
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
	register_block_style(
		'core/paragraph',
		array(
			'name'  => 'eyebrow',
			'label' => __( 'Eyebrow', 'nelyqo' ),
		)
	);
}

/**
 * Loads precious.css on pages that render a gem section, a "Metal foil" heading, an "Eyebrow"
 * paragraph or a "Sand stream".
 *
 * @param string $content Rendered block.
 * @return string
 */
function nelyqo_precious_styles( $content ) {
	if ( ! wp_style_is( 'nelyqo-precious' ) && ( str_contains( $content, 'is-style-gem-' ) || str_contains( $content, 'is-style-foil' ) || str_contains( $content, 'is-style-eyebrow' ) || str_contains( $content, 'is-style-sand-stream' ) ) ) {
		$path = get_template_directory() . '/assets/css/precious.css';
		wp_enqueue_style( 'nelyqo-precious', get_template_directory_uri() . '/assets/css/precious.css', array(), (string) filemtime( $path ) );
		wp_style_add_data( 'nelyqo-precious', 'path', $path );
	}
	return $content;
}

/**
 * "Sand stream" Group style: a line of metal grains pouring down through the Group's gem sections
 * as the page scrolls. Each section gets its own stretch of the line, sized to the section, in its
 * own metal: it enters at the top centre, bends towards the side away from the text (the first
 * section's text is centred, then text alternates right and left) and leaves at the bottom centre,
 * so the stretches join into one line. The SVG is added at render time and never saved: the content
 * stays plain Core blocks.
 *
 * Only the stream's own gem sections take part: a gem nested deeper (a Cover inside a section)
 * gets no stretch and does not shift the left/right order.
 *
 * @param array $block Parsed block.
 * @return array
 */
function nelyqo_sand_stream_mark( $block ) {
	if ( 'core/group' !== $block['blockName'] || ! str_contains( $block['attrs']['className'] ?? '', 'is-style-sand-stream' ) ) {
		return $block;
	}
	$index = 0;
	foreach ( $block['innerBlocks'] as &$inner ) {
		if ( str_contains( $inner['attrs']['className'] ?? '', 'is-style-gem-' ) ) {
			$inner['attrs']['nelyqoSand'] = $index++;
		}
	}
	return $block;
}

/**
 * Draws a gem section's stretch of the sand stream, right after its opening tag.
 *
 * @param string $content Rendered block.
 * @param array  $block   Parsed block.
 * @return string
 */
function nelyqo_sand_stream( $content, $block ) {
	$index = $block['attrs']['nelyqoSand'] ?? null;
	$open  = strpos( $content, '>' );
	if ( ! is_int( $index ) || false === $open ) {
		return $content;
	}
	if ( 0 === $index ) {
		// Under the centred opening text, straight down.
		$path = 'M500 660 C 500 820, 500 880, 500 1000';
	} else {
		$side = 1 === $index % 2 ? 170 : 830;
		$path = sprintf( 'M500 0 C 500 220, %1$d 280, %1$d 500 C %1$d 720, 500 780, 500 1000', $side );
	}
	$strands = '';
	foreach ( array( 'fine', 'mid', 'coarse', 'glint' ) as $strand ) {
		$strands .= sprintf( '<path class="nelyqo-sand__%s" d="%s"/>', $strand, $path );
	}
	return substr_replace( $content, '<svg class="nelyqo-sand" aria-hidden="true" focusable="false" viewBox="0 0 1000 1000" preserveAspectRatio="none">' . $strands . '</svg>', $open + 1, 0 );
}
