== Nelyqo ==

Contributors: Massimo Mazzariol
Requires at least: 6.9
Tested up to: 7.1
Requires PHP: 8.2
Stable tag: 0.2.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Nelyqo is a standalone WordPress block theme. It provides reusable interactive sections, scroll-driven layouts, patterns, semantic design tokens, custom blocks, and selectable style variations.

== Changelog ==

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
