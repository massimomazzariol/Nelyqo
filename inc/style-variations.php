<?php
/**
 * Appearance > Nelyqo: theme options, starting with the site style (theme.json style variations
 * from the parent and child `styles/` folders). Child themes add their own sections with the
 * `nelyqo_options_sections` action.
 *
 * The chosen style is stored where the Site Editor stores it (the user global styles), so the two
 * stay in sync; its title also becomes a body class (`nelyqo-style-{slug}`) for style-specific CSS.
 *
 * @package Nelyqo
 */

add_action( 'admin_menu', 'nelyqo_options_menu' );
add_action( 'admin_post_nelyqo_style_variation', 'nelyqo_save_style_variation' );
add_filter( 'body_class', 'nelyqo_style_body_class' );

/**
 * Slug of the active style variation, or '' for the theme's own style.
 *
 * @return string
 */
function nelyqo_style_variation() {
	$data = WP_Theme_JSON_Resolver::get_user_data()->get_raw_data();
	return sanitize_title( $data['title'] ?? '' );
}

/**
 * Adds `nelyqo-style-{slug}` to the front-end body classes.
 *
 * @param string[] $classes Body classes.
 * @return string[]
 */
function nelyqo_style_body_class( $classes ) {
	$slug = nelyqo_style_variation();
	if ( '' !== $slug ) {
		$classes[] = 'nelyqo-style-' . $slug;
	}
	return $classes;
}

/**
 * Registers Appearance > Nelyqo.
 */
function nelyqo_options_menu() {
	add_theme_page( __( 'Nelyqo options', 'nelyqo' ), __( 'Nelyqo', 'nelyqo' ), 'edit_theme_options', 'nelyqo', 'nelyqo_options_page' );
}

/**
 * The options page: the style picker, then any section a child theme adds.
 */
function nelyqo_options_page() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}
	$active = nelyqo_style_variation();
	$styles = array_merge(
		array(
			array(
				// The theme's own style: its theme.json title, else the theme name.
				'title'    => WP_Theme_JSON_Resolver::get_theme_data()->get_raw_data()['title'] ?? wp_get_theme()->get( 'Name' ),
				'slug'     => '',
				'settings' => WP_Theme_JSON_Resolver::get_theme_data()->get_settings(),
			),
		),
		array_map(
			fn( $v ) => $v + array( 'slug' => sanitize_title( $v['title'] ?? '' ) ),
			WP_Theme_JSON_Resolver::get_style_variations()
		)
	);
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Nelyqo options', 'nelyqo' ); ?></h1>
		<?php if ( isset( $_GET['updated'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Display only. ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Style applied.', 'nelyqo' ); ?></p></div>
		<?php endif; ?>

		<h2><?php esc_html_e( 'Site style', 'nelyqo' ); ?></h2>
		<p><?php esc_html_e( 'Colors and fonts for the whole site. Applying a style replaces the global styles customized in the Site Editor.', 'nelyqo' ); ?></p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="nelyqo_style_variation">
			<?php wp_nonce_field( 'nelyqo_style_variation' ); ?>
			<fieldset class="nelyqo-styles">
				<legend class="screen-reader-text"><?php esc_html_e( 'Site style', 'nelyqo' ); ?></legend>
				<?php foreach ( $styles as $style ) : ?>
					<label class="card">
						<input type="radio" name="nelyqo_style" value="<?php echo esc_attr( $style['slug'] ); ?>" <?php checked( $style['slug'], $active ); ?>>
						<span class="nelyqo-style__swatches" aria-hidden="true">
							<?php foreach ( $style['settings']['color']['palette']['theme'] ?? $style['settings']['color']['palette'] ?? array() as $color ) : ?>
								<span style="--swatch:<?php echo esc_attr( $color['color'] ?? '' ); ?>"></span>
							<?php endforeach; ?>
						</span>
						<strong><?php echo esc_html( $style['title'] ); ?></strong>
					</label>
				<?php endforeach; ?>
			</fieldset>
			<?php submit_button( __( 'Apply style', 'nelyqo' ) ); ?>
		</form>

		<?php
		/**
		 * Lets child themes add their own option sections below the style picker.
		 */
		do_action( 'nelyqo_options_sections' );
		?>
	</div>
	<?php
}

add_action( 'admin_enqueue_scripts', 'nelyqo_options_styles' );

/**
 * Loads the options page styles on that page only.
 *
 * @param string $hook Current admin page.
 */
function nelyqo_options_styles( $hook ) {
	if ( 'appearance_page_nelyqo' !== $hook ) {
		return;
	}
	$file = '/assets/css/admin-options.css';
	wp_enqueue_style( 'nelyqo-options', get_template_directory_uri() . $file, array(), (string) filemtime( get_template_directory() . $file ) );
}

/**
 * Applies the chosen style the way the Site Editor does: it becomes the user global styles.
 */
function nelyqo_save_style_variation() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		wp_die( esc_html__( 'You are not allowed to change the site style.', 'nelyqo' ), 403 );
	}
	check_admin_referer( 'nelyqo_style_variation' );

	if ( ! nelyqo_apply_style_variation( sanitize_title( wp_unslash( $_POST['nelyqo_style'] ?? '' ) ) ) ) {
		wp_die( esc_html__( 'Unknown style.', 'nelyqo' ), 400 );
	}
	wp_safe_redirect( add_query_arg( 'updated', '1', admin_url( 'themes.php?page=nelyqo' ) ) );
	exit;
}

/**
 * Makes a style variation (by slug; '' for the theme's own style) the site style, as the user
 * global styles. Also used from WP-CLI: `wp eval 'nelyqo_apply_style_variation( "slug" );'`.
 *
 * @param string $slug Variation slug (sanitized title), or '' for the theme's own style.
 * @return bool False when no variation has that slug.
 */
function nelyqo_apply_style_variation( $slug ) {
	$data = array(
		'version'                     => WP_Theme_JSON::LATEST_SCHEMA,
		'isGlobalStylesUserThemeJSON' => true,
	);
	if ( '' !== $slug ) {
		$found = null;
		foreach ( WP_Theme_JSON_Resolver::get_style_variations() as $variation ) {
			if ( sanitize_title( $variation['title'] ?? '' ) === $slug ) {
				$found = $variation;
				break;
			}
		}
		if ( ! $found ) {
			return false;
		}
		$data['title'] = $found['title'];
		foreach ( array( 'settings', 'styles' ) as $key ) {
			if ( ! empty( $found[ $key ] ) ) {
				$data[ $key ] = $found[ $key ];
			}
		}
	}

	wp_update_post(
		array(
			'ID'           => WP_Theme_JSON_Resolver::get_user_global_styles_post_id(),
			'post_content' => wp_slash( wp_json_encode( $data ) ),
		)
	);
	WP_Theme_JSON_Resolver::clean_cached_data();
	return true;
}
