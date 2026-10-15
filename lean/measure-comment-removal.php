<?php
/**
 * Measures nelyqo_remove_comments() on saved pages (fetched with the option off): bytes removed,
 * bytes removed after gzip, and time per page.
 * Usage (wp-env): wp eval-file wp-content/themes/nelyqo/lean/measure-comment-removal.php <html file> [...]
 *
 * @package Nelyqo
 */

foreach ( $args as $file ) {
	$html = (string) file_get_contents( $file );
	$runs = 200;
	$t    = hrtime( true );
	for ( $i = 0; $i < $runs; $i++ ) {
		$clean = nelyqo_remove_comments( $html );
	}
	$ms = ( hrtime( true ) - $t ) / 1e6 / $runs;
	printf(
		"%-16s %7d B, -%5d B (%4.1f%%), gzip -%4d B, %.3f ms/page\n",
		basename( $file ),
		strlen( $html ),
		strlen( $html ) - strlen( $clean ),
		100 * ( strlen( $html ) - strlen( $clean ) ) / max( 1, strlen( $html ) ),
		strlen( gzencode( $html, 6 ) ) - strlen( gzencode( $clean, 6 ) ),
		$ms
	);
}
