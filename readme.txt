== Nelyqo ==

Contributors: Massimo Mazzariol
Requires at least: 6.9
Tested up to: 7.1
Requires PHP: 8.2
Stable tag: 0.5.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Nelyqo is a standalone WordPress block theme. It provides reusable interactive sections, scroll-driven layouts, patterns, semantic design tokens, custom blocks, and selectable style variations.

Nelyqo itself sets no cookies, uses no browser storage, does no tracking and makes no third-party requests on the public site: fonts are self-hosted and scroll effects are done in CSS.

== Changelog ==

= 0.5.0 =
* Precious metals: nine gem section styles for Group and Cover (gold, rose gold, amethyst, sapphire, blue gold, emerald, imperial topaz, pearl, gold on ivory). Each sets its ground, text and a five-tone metal, and every gem passes WCAG AA contrast (checked in CI). Native theme.json section styles: their CSS loads only on pages that use them.
* Gem sections that follow each other blend with a long gradient instead of a hard edge.
* "Metal foil" heading style, and emphasis inside gem headings in the gem's metal, with a light that slides across as the heading crosses the screen. Plain text in Windows high contrast mode.
* "Sand stream" Group style: a line of metal grains pours down through its gem sections as the page scrolls, with gold dust drifting at two depths. Drawn at render time, never saved in the content; CSS only. With reduced motion the line and the dust stay still.
* "Eyebrow" paragraph style for the small label above a heading.
* Sand stream: the line carries a gradient through each gem's metals, picking up where the stretch above ends so the grains never jump colour at a section edge, and light keeps running down its grains (moved by the graphics card: no repainting, nearly no cost at rest). The sand pours from one point of the screen, so a stretch is complete when the next one starts: one unbroken line, also when the page ends with the stream. Browsers without scroll-driven animations show the whole line; with reduced motion the line stays still and unlit. The first stretch pours in on load instead of waiting for a scroll. A gem section that follows one of the same gem continues the line straight down the middle, so the curve stays beside the heading and wide blocks get a clear lane.
* Buttons in gem sections: on hover and keyboard focus the light runs across the metal and the button lifts. Pills in gem sections wear the gem's metal.
* Scroll Section, vertical sticky mode: the introduction now spans every card row and holds still in the middle of the screen, out of reach of a sticky header (it used to stop near the top). With only a few cards it stays as tall as they are, so they keep their spacing.
* Scroll Section, horizontal track: the pinned track holds in the middle of the screen instead of near the top, with the introduction and the cards centred in it, and it moves as far as the page scrolls (it used to rush ahead, at up to twice the scroll speed). The track starts moving when the stage stops and the last card arrives before the stage moves on, with a short pause on it.
* Full-page section: the slides now dock below the theme's sticky header instead of under it. A long scroll step that carries the page past the slides on the way in no longer skips them, the wheel works with the pointer anywhere on the page while they are on screen, and the arrow keys and Page Up/Down page them without focusing them first. On touch screens a swipe that starts above the slides, or carries the page past them, docks them too.
* The live demo is now a presentation of the theme: every feature in one scroll from night to ivory.

= 0.4.1 =
* Font preloads skip italic faces: they rarely set text in the first screen, and every preload competes with the hero image for bandwidth. The nelyqo_preload_fonts filter can add them back.
* The emoji option also removes the emoji script and styles from embeds of the site's pages.
* Scroll Section: the vertical modes now animate with CSS alone (scroll-driven animations), so pages that use only them load no script for the block (7.9 KB less, one request fewer). Browsers without scroll-driven animations, and visitors who prefer reduced motion, see the cards still. The script now loads only for the horizontal track mode.
* Scroll Section, horizontal track: the sideways-scrolling track can be reached with the keyboard.
* Scroll Section: the horizontal track styles load only on pages that use that mode, so the block's stylesheet drops from 19.8 KB to 8.3 KB elsewhere.
* Autoplay videos: the first one of the page (usually the hero background) starts downloading at once (preload="auto"), so it plays as soon as the small script runs; the others still load only near the viewport. Playback stays with the script, so with reduced motion no video ever moves.
* Full-page section: one wheel or trackpad gesture moves one slide at most. Before, the inertia that trackpads keep sending after a swipe could skip a slide; tiny nudges no longer move either. Slides change only while they fill the screen: scrolling towards them first brings them to fill it (on the first slide from above, on the last from below), and scrolling away from them is ordinary page scrolling.
* Image lightbox backport: still applied on WordPress 7.1.3 (same core file as 7.1.2), and on sites where the core file was saved with Windows line endings. The core file is checked only on pages that show a lightbox, no longer on every request.

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
