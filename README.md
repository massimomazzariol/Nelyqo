# Nelyqo

[![CI](https://github.com/massimomazzariol/Nelyqo/actions/workflows/ci.yml/badge.svg)](https://github.com/massimomazzariol/Nelyqo/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/massimomazzariol/Nelyqo)](https://github.com/massimomazzariol/Nelyqo/releases/latest)
[![WordPress 6.9+](https://img.shields.io/badge/WordPress-6.9%2B-21759b?logo=wordpress)](https://wordpress.org)
[![PHP 8.2+](https://img.shields.io/badge/PHP-8.2%2B-777bb4?logo=php&logoColor=white)](https://www.php.net)
[![License: GPL v2+](https://img.shields.io/badge/license-GPL--2.0--or--later-blue)](LICENSE)
[![Try in Playground](https://img.shields.io/badge/demo-WordPress%20Playground-a94d29)](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/massimomazzariol/Nelyqo/master/blueprint.json)

A WordPress block theme for scroll-driven storytelling: sections that hold still while you scroll, horizontal tracks, full-page sections and gentle reveals, built on Core blocks and `theme.json` with no page builder and almost no JavaScript.

Made for small local businesses that sell on trust and booking requests (private drivers, guides, studios, B&Bs): one strong hero with a request card, clear lists, a short process and a FAQ.

**[Try the live demo in WordPress Playground](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/massimomazzariol/Nelyqo/master/blueprint.json)**: it runs in your browser, nothing to install.

![The three Nelyqo patterns on the front page](docs/screenshots/patterns.png)

Pre-1.0 and in active use on client sites. Block names (`nelyqo/*`) are stable; CSS class names may still change before 1.0.

## What you get

**Block styles for Core blocks** (CSS only, content stays plain Core markup):

- **Group > Sticky section**: the Group's content holds still for a stretch of scrolling, then moves on. Good for heroes.
- **Group > Reveal on scroll**: headings, text, buttons and accordions inside the Group rise gently into view. Images stay still. Uses scroll-driven animations where the browser supports them, does nothing otherwise, and respects `prefers-reduced-motion`.

**Patterns** (Inserter > Patterns):

- **Hero with side card**: full-height cover with the pitch on the left and a call-to-action card on the right, using the Sticky section style.
- **Intro with coded list**: section intro next to a ruled list of rows with a short code, a name and a link (airports, branches, services).
- **Steps and FAQ**: a numbered three-step process next to a FAQ accordion on the Details block.

**Header**:

- On the front page the header floats over the first section, starts transparent and fills in during the first 140px of scrolling.
- Below 900px the menu collapses to a full-screen overlay with large heading-font items.
- Child themes can change the fill with one custom property: `--nelyqo-header-fill`.

<img src="docs/screenshots/mobile-menu.png" alt="Mobile menu overlay" width="260">

**Custom blocks**: Hero, Pills, Scroll section and Scroll card, Horizontal scroll (with track, content and intro card), Full-page section.

**Accordion**: the Details block becomes a FAQ accordion with a plus sign that turns into a cross.

**Design system**: semantic color slugs, self-hosted fonts and motion tokens, documented in the [style guide](docs/STYLE-GUIDE.md). Three looks, switchable in **Appearance > Editor > Styles**:

| Default: warm editorial | Modern clean | Night |
| --- | --- | --- |
| Ivory, ink, terracotta. Fraunces + Instrument Sans | White, forest green, brass. Instrument Serif + Inter | Midnight blue, gold. DM Serif Display + DM Sans |
| <img src="docs/screenshots/patterns.png" alt="Default style" width="260"> | <img src="docs/screenshots/variation-modern-clean.png" alt="Modern clean style" width="260"> | <img src="docs/screenshots/variation-night.png" alt="Night style" width="260"> |

## Requirements

- WordPress 6.9 or later (tested up to 7.0)
- PHP 8.2 or later

## Install

Download `nelyqo-x.y.z.zip` from the [latest release](https://github.com/massimomazzariol/Nelyqo/releases/latest) and upload it in **Appearance > Themes > Add New > Upload Theme**, or clone it into `wp-content/themes/nelyqo`. Block builds are committed, so no Node.js is needed to run the theme.

## Child themes

Nelyqo loads its own stylesheets from the parent directory, so a child theme only enqueues what it adds. Override the header fill, palette and fonts in the child's `theme.json` and CSS; keep the parent's class names (`nelyqo-site-header`, `nelyqo-site-header__main`) in custom header parts to inherit the header behavior.

## Development

Requires Node.js 22 and pnpm 10. Point any local WordPress at the repository (WordPress Studio, `wp-env` with the included `.wp-env.json`, or a symlink).

```sh
pnpm install
pnpm build   # build all blocks
pnpm check   # lint JS and CSS, then build
```

CI runs the same checks, lints the PHP files and rejects uncommitted build output.

Read [AGENTS.md](AGENTS.md) and the [project principles](docs/PROJECT-PRINCIPLES.md) before architectural changes.

## License

GPL-2.0-or-later.
