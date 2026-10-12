== Nelyqo ==

Contributors: Massimo Mazzariol
Requires at least: 6.9
Tested up to: 7.1
Requires PHP: 8.2
Stable tag: 0.4.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Nelyqo is a standalone WordPress block theme. It provides reusable interactive sections, scroll-driven layouts, patterns, semantic design tokens, custom blocks, and selectable style variations.

Nelyqo itself sets no cookies, uses no browser storage, does no tracking and makes no third-party requests on the public site: fonts are self-hosted and scroll effects are done in CSS.

== Changelog ==

= 0.4.0 =
* Performance defaults: the woff2 files of every theme.json fontFace (child included) are preloaded, the emoji polyfill is removed, and autoplay videos load and play only near the viewport (paused on their first frame with reduced motion). Filters: nelyqo_preload_fonts, nelyqo_disable_emoji, nelyqo_lazy_video, nelyqo_lazy_video_margin (how early videos start loading, default 200px).
* Appearance > Nelyqo > Performance: three switches, all on by default: remove the emoji script, turn off plugin signature comments through each plugin's own switch (list in data/clean-html.json), and remove HTML comments from pages as they are sent (never inside scripts, styles or preformatted text; the files and the saved content are not changed).
* Appearance > Nelyqo > Discretion: four switches, all on by default: hide versions (generator, core asset versions, PHP header), remove discovery links (API, editing apps, short links, embeds), turn off XML-RPC, hide user names from visitors (API, author pages, embeds, sitemap). Lists in data/discretion.json.
* Image and gallery blocks keep their size and crop when an image plugin wraps the image in <picture> (WebP/AVIF).

= 0.3.1 =
* nelyqo_apply_style_variation( $slug ) applies a style from code or WP-CLI (the options page uses it too).

= 0.3.0 =
* Appearance > Nelyqo: pick the site style (theme.json style variations from the theme and its child) with palette previews; applied the way the Site Editor does.
* The active style is a body class (nelyqo-style-{slug}) for style-specific CSS, and child themes can add their own option sections (nelyqo_options_sections).

= 0.2.1 =
* Image lightbox shows the whole photo in its own proportions, not the gallery or thumbnail crop, and zooms out of the crop (backport of Gutenberg PR #79058 for WordPress 7.1.2; switches itself off when core changes).

= 0.2.0 =
* New default design: ivory, ink and terracotta palette with Fraunces and Instrument Sans (self-hosted); style guide in docs/STYLE-GUIDE.md.
* Style variations: Modern clean and Night (Ceramic and Midnight removed).
* Added the "Reveal on scroll" Group style.
* Added the Hero with side card, Intro with coded list, and Steps and FAQ patterns.
* Fixed the mobile menu overlay being clipped to the header bar by its backdrop blur.
* Fixed the tablet header (600 to 899px) showing the hamburger and the full menu together.
* The front-page header now starts transparent and fills in while scrolling.
* Child themes no longer need to enqueue the parent stylesheet.
* The Details block is styled as a FAQ accordion.
* Fixed right-aligned menus running off the screen in the mobile overlay.
* Removed client-specific leftovers; all class names now use the nelyqo- prefix (no migration: pre-1.0).
* The repository root is now the theme directory.

= 0.1.0 =
* Established the Nelyqo design token system.
* Added the Ceramic style variation.
* Added and migrated the custom block collection.
* Removed legacy client-specific font and color dependencies.


== Resources ==

* Fraunces, (C) The Fraunces Project Authors, SIL Open Font License 1.1, https://github.com/undercasetype/Fraunces
* Instrument Sans, (C) The Instrument Sans Project Authors, SIL Open Font License 1.1, https://github.com/Instrument/instrument-sans
* Instrument Serif, (C) The Instrument Serif Project Authors, SIL Open Font License 1.1, https://github.com/Instrument/instrument-serif
* Inter, (C) The Inter Project Authors, SIL Open Font License 1.1, https://github.com/rsms/inter
* DM Serif Display, (C) The DM Serif Display Project Authors, SIL Open Font License 1.1, https://github.com/googlefonts/dm-fonts
* DM Sans, (C) The DM Sans Project Authors, SIL Open Font License 1.1, https://github.com/googlefonts/dm-fonts

== Copyright ==

Nelyqo WordPress Theme, (C) 2026 Massimo Mazzariol - https://github.com/massimomazzariol/Nelyqo
Nelyqo is distributed under the terms of the GNU GPL.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
