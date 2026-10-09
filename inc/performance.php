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
add_action( 'nelyqo_options_sections', 'nelyqo_performance_options', 5 );
add_action( 'admin_post_nelyqo_performance', 'nelyqo_save_performance_options' );

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
 * emoji natively. On by default; Appearance > Nelyqo > Performance turns it off, and the
 * 'nelyqo_disable_emoji' filter has the last word.
 */
function nelyqo_disable_emoji() {
	if ( ! apply_filters( 'nelyqo_disable_emoji', (bool) get_theme_mod( 'nelyqo_remove_emoji', true ) ) ) {
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
 * preload="none", and assets/js/lazy-video.js plays each one when it nears the viewport (within the
 * 'nelyqo_lazy_video_margin' filter value, an IntersectionObserver rootMargin).
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
		if ( ! wp_script_is( 'nelyqo-lazy-video' ) ) {
			wp_enqueue_script( 'nelyqo-lazy-video', get_template_directory_uri() . '/assets/js/lazy-video.js', array(), (string) filemtime( $path ), array( 'strategy' => 'defer' ) );
			wp_add_inline_script( 'nelyqo-lazy-video', 'window.nelyqoLazyVideo = ' . wp_json_encode( array( 'rootMargin' => apply_filters( 'nelyqo_lazy_video_margin', '200px 0px' ) ) ) . ';', 'before' );
		}
	}
	return $tags->get_updated_html();
}

/**
 * Appearance > Nelyqo > Performance: whether the emoji polyfill is removed.
 */
function nelyqo_performance_options() {
	?>
	<h2><?php esc_html_e( 'Performance', 'nelyqo' ); ?></h2>
	<?php if ( isset( $_GET['performance'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Display only. ?>
		<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Performance options saved.', 'nelyqo' ); ?></p></div>
	<?php endif; ?>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="nelyqo_performance">
		<?php wp_nonce_field( 'nelyqo_performance' ); ?>
		<p>
			<label><input type="checkbox" name="nelyqo_remove_emoji" value="1" aria-describedby="nelyqo-emoji-help" <?php checked( (bool) get_theme_mod( 'nelyqo_remove_emoji', true ) ); ?>> <?php esc_html_e( 'Remove the WordPress emoji script', 'nelyqo' ); ?></label>
		</p>
		<p class="description" id="nelyqo-emoji-help"><?php esc_html_e( 'Recommended: current browsers draw emoji themselves, and the script adds a request and inline code to every page. Turn it off only if visitors on very old devices see empty boxes instead of emoji.', 'nelyqo' ); ?></p>
		<?php submit_button( __( 'Save performance options', 'nelyqo' ) ); ?>
	</form>
	<?php
}

/**
 * Saves the performance options.
 */
function nelyqo_save_performance_options() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		wp_die( esc_html__( 'You are not allowed to change these options.', 'nelyqo' ), 403 );
	}
	check_admin_referer( 'nelyqo_performance' );
	set_theme_mod( 'nelyqo_remove_emoji', ! empty( $_POST['nelyqo_remove_emoji'] ) );
	wp_safe_redirect( add_query_arg( 'performance', '1', admin_url( 'themes.php?page=nelyqo' ) ) );
	exit;
}
