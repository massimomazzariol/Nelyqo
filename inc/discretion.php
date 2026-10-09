<?php
/**
 * Discretion: pages say less about how the site is built and who writes it, and expose fewer doors.
 * Each switch is on by default and can be turned off in Appearance > Nelyqo > Discretion.
 *
 * - Hide versions: no generator tag, core asset versions replaced by a site-specific code (browser
 *   caches still refresh on updates), no PHP version header.
 * - Remove discovery links: the links and headers announcing the API, editing clients, shortlinks
 *   and embeds (data/discretion.json). The features themselves keep working.
 * - Turn off XML-RPC: the old remote-publishing door, a frequent target of password guessing.
 * - Hide user names: the public list of authors (API, author pages, embeds, sitemap) is closed to
 *   visitors, so login names are not handed out.
 *
 * @package Nelyqo
 */

add_action( 'init', 'nelyqo_apply_discretion' );
add_action( 'nelyqo_options_sections', 'nelyqo_discretion_options', 6 );
add_action( 'admin_post_nelyqo_discretion', 'nelyqo_save_discretion_options' );

/**
 * Discretion switches, all on by default (theme mods).
 *
 * @return array<string, bool>
 */
function nelyqo_discretion_settings() {
	return array(
		'hide_versions'   => (bool) get_theme_mod( 'nelyqo_hide_versions', true ),
		'hide_discovery'  => (bool) get_theme_mod( 'nelyqo_hide_discovery', true ),
		'disable_xmlrpc'  => (bool) get_theme_mod( 'nelyqo_disable_xmlrpc', true ),
		'hide_user_names' => (bool) get_theme_mod( 'nelyqo_hide_user_names', true ),
	);
}

/**
 * Lists for the discretion switches (data/discretion.json).
 *
 * @return array
 */
function nelyqo_discretion_data() {
	static $data = null;
	if ( null === $data ) {
		$data = json_decode( (string) file_get_contents( get_template_directory() . '/data/discretion.json' ), true );
		$data = is_array( $data ) ? $data : array();
	}
	return $data;
}

/** Applies the switches that are on. */
function nelyqo_apply_discretion() {
	$settings = nelyqo_discretion_settings();
	$data     = nelyqo_discretion_data();

	if ( $settings['hide_versions'] ) {
		remove_action( 'wp_head', 'wp_generator' );
		add_filter( 'the_generator', '__return_empty_string' );
		add_filter( 'style_loader_src', 'nelyqo_mask_core_version' );
		add_filter( 'script_loader_src', 'nelyqo_mask_core_version' );
		add_filter( 'script_module_loader_src', 'nelyqo_mask_core_version' );
	}
	if ( $settings['hide_versions'] || $settings['hide_discovery'] ) {
		add_action( 'send_headers', 'nelyqo_remove_headers' );
	}
	if ( $settings['hide_discovery'] ) {
		foreach ( (array) ( $data['remove_actions'] ?? array() ) as $action ) {
			if ( is_array( $action ) && 3 === count( $action ) ) {
				remove_action( (string) $action[0], (string) $action[1], (int) $action[2] );
			}
		}
	}
	if ( $settings['disable_xmlrpc'] ) {
		if ( defined( 'XMLRPC_REQUEST' ) && XMLRPC_REQUEST ) {
			status_header( 403 );
			exit;
		}
		add_filter( 'xmlrpc_enabled', '__return_false' );
		add_filter( 'xmlrpc_methods', '__return_empty_array' );
		add_filter( 'pings_open', '__return_false' );
	}
	if ( $settings['hide_user_names'] && ! is_user_logged_in() ) {
		add_filter( 'rest_endpoints', 'nelyqo_hide_user_routes' );
		add_filter( 'oembed_response_data', 'nelyqo_hide_oembed_author' );
		add_action( 'template_redirect', 'nelyqo_hide_author_pages', 1 ); // Before the canonical redirect, which would name the user.
		add_filter(
			'wp_sitemaps_add_provider',
			static fn( $provider, $name ) => 'users' === $name ? false : $provider,
			10,
			2
		);
	}
}

/**
 * Replaces the WordPress version in core asset URLs with a code unique to the site, so browser
 * caches still refresh after an update but the version is not readable.
 *
 * @param string $src Asset URL.
 * @return string
 */
function nelyqo_mask_core_version( $src ) {
	$version = get_bloginfo( 'version' );
	if ( ! is_string( $src ) || ! str_contains( $src, 'ver=' . $version ) ) {
		return $src;
	}
	return add_query_arg( 'ver', substr( wp_hash( $version ), 0, 8 ), $src );
}

/** Removes the headers that name the server software or the pingback endpoint (data/discretion.json). */
function nelyqo_remove_headers() {
	foreach ( (array) ( nelyqo_discretion_data()['headers'] ?? array() ) as $header ) {
		header_remove( (string) $header );
	}
}

/**
 * Closes the user list of the REST API to visitors.
 *
 * @param array $endpoints Routes.
 * @return array
 */
function nelyqo_hide_user_routes( $endpoints ) {
	foreach ( (array) ( nelyqo_discretion_data()['rest_user_routes'] ?? array() ) as $route ) {
		unset( $endpoints[ $route ] );
	}
	return $endpoints;
}

/**
 * Leaves the author out of embeds of this site's pages.
 *
 * @param array $data oEmbed response.
 * @return array
 */
function nelyqo_hide_oembed_author( $data ) {
	foreach ( (array) ( nelyqo_discretion_data()['oembed_author_fields'] ?? array() ) as $field ) {
		unset( $data[ $field ] );
	}
	return $data;
}

/** Author pages (and ?author=N, which redirects to them) answer "not found" to visitors. */
function nelyqo_hide_author_pages() {
	if ( is_author() || isset( $_GET['author'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only check.
		global $wp_query;
		$wp_query->set_404();
		status_header( 404 );
		nocache_headers();
	}
}

/** Appearance > Nelyqo > Discretion. */
function nelyqo_discretion_options() {
	$settings = nelyqo_discretion_settings();
	$switches = array(
		'hide_versions'   => array( __( 'Hide versions', 'nelyqo' ), __( 'No WordPress version in the page source or in asset addresses, no PHP version in the response headers. Browser caches still refresh after updates.', 'nelyqo' ) ),
		'hide_discovery'  => array( __( 'Remove discovery links', 'nelyqo' ), __( 'The links that announce the API, editing apps, short links and embeds. Everything keeps working; the page just stops advertising it.', 'nelyqo' ) ),
		'disable_xmlrpc'  => array( __( 'Turn off XML-RPC', 'nelyqo' ), __( 'An old door for remote publishing and pingbacks, often used to guess passwords. Turn this off only if an app or service needs it.', 'nelyqo' ) ),
		'hide_user_names' => array( __( 'Hide user names', 'nelyqo' ), __( 'Visitors can no longer list the site users through the API, author pages, embeds or the sitemap, so login names are not handed out. Turn this off if the site shows author pages.', 'nelyqo' ) ),
	);
	?>
	<h2><?php esc_html_e( 'Discretion', 'nelyqo' ); ?></h2>
	<?php if ( isset( $_GET['discretion'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Display only. ?>
		<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Discretion options saved.', 'nelyqo' ); ?></p></div>
	<?php endif; ?>
	<p><?php esc_html_e( 'Pages say less about how the site is built, and fewer doors are open to automated attacks.', 'nelyqo' ); ?></p>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="nelyqo_discretion">
		<?php wp_nonce_field( 'nelyqo_discretion' ); ?>
		<?php foreach ( $switches as $key => $switch ) : ?>
			<p>
				<label><input type="checkbox" name="nelyqo_<?php echo esc_attr( $key ); ?>" value="1" aria-describedby="nelyqo-<?php echo esc_attr( $key ); ?>-help" <?php checked( $settings[ $key ] ); ?>> <?php echo esc_html( $switch[0] ); ?></label>
			</p>
			<p class="description" id="nelyqo-<?php echo esc_attr( $key ); ?>-help"><?php echo esc_html( $switch[1] ); ?></p>
		<?php endforeach; ?>
		<?php submit_button( __( 'Save discretion options', 'nelyqo' ) ); ?>
	</form>
	<?php
}

/** Saves the discretion switches. */
function nelyqo_save_discretion_options() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		wp_die( esc_html__( 'You are not allowed to change these options.', 'nelyqo' ), 403 );
	}
	check_admin_referer( 'nelyqo_discretion' );
	foreach ( array_keys( nelyqo_discretion_settings() ) as $key ) {
		set_theme_mod( 'nelyqo_' . $key, ! empty( $_POST[ 'nelyqo_' . $key ] ) );
	}
	wp_safe_redirect( add_query_arg( 'discretion', '1', admin_url( 'themes.php?page=nelyqo' ) ) );
	exit;
}
