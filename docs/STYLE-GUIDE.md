# Nelyqo style guide

Direction: **warm editorial**. Ivory paper, ink text, one terracotta voice. Calm, trustworthy, a little literary. Built for small local businesses that sell on trust: the page should feel like a well-made printed brochure, not an app.

Everything below lives in `theme.json`; change it there, never in CSS.

## Typography

| Role | Font | Slug | Use |
| --- | --- | --- | --- |
| Headings | Fraunces (300-700, roman and italic) | `heading` | Titles, FAQ questions, big numbers and codes |
| Body | Instrument Sans (400-700) | `system-sans` | Everything else: text, buttons, navigation, captions |

- Both fonts are self-hosted (latin subset, about 110 KB in total) and licensed under the SIL Open Font License.
- Headings: weight 400-500, tight line height (1.02-1.1). Use italic for one emphasized phrase per heading, never a whole heading.
- Body: 1rem to 1.075rem, line height 1.7.
- Small caps labels (eyebrows): 0.7-0.72rem, uppercase, letter spacing 0.16-0.2em.
- The `system-sans` slug name is historical; it is a stable API, so it stays.

## Color

| Slug | Hex | Role |
| --- | --- | --- |
| `background` | `#F7F3EC` | Page (ivory) |
| `surface` | `#EFE8DC` | Cards, alternating sections |
| `surface-alt` | `#E8DFD1` | Pressed and hover surfaces |
| `foreground` | `#1F1B16` | Text; dark sections, header and footer |
| `foreground-muted` | `#6B6259` | Secondary text |
| `primary` | `#A94D29` | Buttons, eyebrows, the one accent of the page (terracotta) |
| `primary-strong` | `#8E3F20` | Links, hover states |
| `on-primary` | `#FFFFFF` | Text on `primary` and on `foreground` sections |
| `accent` | `#AC7D2F` | Large display text only: step numbers, codes (ochre) |
| `on-accent` | `#1F1B16` | Text on `accent` |
| `line` | `#E3DBCF` | Rules and borders |

Contrast (WCAG 2.2):

- Text on `background`: foreground 15.5:1, muted 5.4:1, primary 5.0:1, primary-strong 6.6:1.
- White on `primary`: 5.6:1.
- `accent` passes only for large text (3.3:1 on ivory, 4.7:1 on ink). Never use it for body text or small labels on ivory.

Rules: one terracotta element per view is plenty. Dark sections use `foreground` as the background with `on-primary` text.

## Style variations

Each variation swaps the palette and the two fonts and keeps every slug, so patterns and child themes work unchanged. Fonts of a variation load only when it is active.

| Variation | Headings / body | background | foreground | primary | accent |
| --- | --- | --- | --- | --- | --- |
| Default (warm editorial) | Fraunces / Instrument Sans | `#F7F3EC` | `#1F1B16` | `#A94D29` | `#AC7D2F` |
| Modern clean | Instrument Serif / Inter | `#FFFFFF` | `#15201C` | `#1F5C4A` | `#B08D57` |
| Night | DM Serif Display / DM Sans | `#0F1420` | `#F1EEE7` | `#D4A657` | `#5F87AD` |

In Night `foreground` is light, so the "dark" sections (header, hero, footer) turn into light ivory bands on a midnight page; `on-primary` is ink so gold buttons stay readable. All three pass WCAG AA for text; `accent` is for large display text only.

## Spacing and layout

- Content width 645px for reading, wide 1340px for sections.
- Section padding: `clamp(4rem, 8vw, 7rem)` top and bottom, `clamp(1.5rem, 7vw, 6.875rem)` at the sides.
- Lists and steps are separated by 1px `line` rules, not by cards or shadows.

## Motion

- Tokens: `duration-fast` 120ms, `duration-standard` 200ms, `duration-slow` 360ms, easing `cubic-bezier(0.2, 0, 0, 1)`.
- Text may rise into view ("Reveal on scroll"); images stay still.
- Every animation is CSS-only, skipped without browser support and with `prefers-reduced-motion`.

## Components

- **Buttons**: primary fill for the main action, outline for the secondary one. One primary button per view.
- **Header**: ink bar with white text; transparent over the front-page hero until the first scroll.
- **Mobile menu**: full-screen ink overlay, large Fraunces items, centered.
- **FAQ**: Details blocks with a plus sign that turns into a cross.
