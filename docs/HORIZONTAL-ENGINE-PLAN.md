# One engine for horizontal scrolling (plan for 0.6.0)

Status: done on branch feat/0.6.0-plan (2026-10-16). Saved content never changes.

## Today: two engines for one effect

| | Horizontal Scroll block family | Scroll Section, horizontal track mode |
| --- | --- | --- |
| Blocks | `nelyqo/horizontal-scroll` with `-track`, `-content`, `-intro-card` children | `nelyqo/scroll-section` (`mode: horizontal-track`) |
| Saved markup | `section.nelyqo-horizontal-scroll` > `__content` (intro) + `__layout` (cards) | `section.nelyqo-scroll-section` > `__layout` (intro + cards) |
| Script | `blocks/horizontal-scroll/src/view.js`, 342 lines | horizontal part of `blocks/scroll-section/src/view.js` (566 lines in all) |
| Styles | `style.scss` 398 lines | `horizontal.scss` 321 lines |
| Pin | centred below the measured header | centred in the screen (since 0.5.0) |
| Track speed | 1:1 with the scroll, short pause at the end | 1:1 with the scroll, short pause at the end (since 0.5.0) |
| Per-card effects | none (cheap) | scale, opacity, saturation and focus classes recomputed every frame |
| Options | card width, tone | card width, tone, sticky on/off, sticky offset, motion on/off and strength, card emphasis |
| Keyboard | track not focusable | track focusable when not pinned |
| In the presentation | no | yes (section 02) |

Both engines do the same job, and 0.5.0 brought the Scroll Section mode to the behaviour the Horizontal Scroll block already had (1:1 travel, end pause, centred pin). Two engines mean every fix is made twice, and the theme ships about 700 lines of script and 700 of styles for one effect.

## Rules (from AGENTS.md)

- `nelyqo/*` block names and their saved markup are public content APIs: posts saved with either block must keep rendering, with no "This block contains unexpected content" in the editor.
- No migration that rewrites posts in the database.

## Proposal

1. **One public block: Scroll Section, horizontal track mode.** It has more options, keyboard access and is in the presentation.
2. **One small engine**, written from the Horizontal Scroll block's script (the simpler of the two: pin, 1:1 travel, end pause, header measurement), used by both blocks. The per-card emphasis of Scroll Section stays as an option, but computed only when a card changes, not every frame (the main source of slow frames left in the presentation at 4x CPU).
3. **Horizontal Scroll stays registered** so old posts keep rendering and stay editable, but leaves the inserter (`supports.inserter: false`). Its saved markup is adapted at render time (`render_block` filter adding the classes the engine reads, the same way the theme already adds the card count), so the engine reads one structure.
4. **One-click conversion in the editor**: a block transform from Horizontal Scroll to Scroll Section (horizontal track), so editors can move a post over when they open it. Nothing changes until someone saves.
5. **Checks**: `lean/horizontal-check.mjs` runs against a fixture page for each block (`lean/fixtures/`), plus `lean/journey-check.mjs` both ways; wp-lean-check confirms the script and style weight drop.

## Questions for the user

1. Keep Scroll Section as the one public block (recommended), or the other way round?
2. Hide Horizontal Scroll from the inserter in 0.6.0, or only mark it "legacy" in its description first?
3. Per-card emphasis (cards grow and brighten in the middle): keep it as an option, or drop it for a lighter track?

## Decisions (user, 2026-10-16)

- **Both blocks stay public** (Horizontal Scroll stays in the inserter): two blocks, one engine.
- **One engine moves everything**: the script measures, CSS moves (scroll-driven animations on the compositor); a small script fallback moves the track where scroll-driven animations are missing (Firefox today).
- **Card emphasis** becomes an option: on by default in Scroll Section (existing sites look the same), off by default in Horizontal Scroll; subtle / medium / strong. Implemented as one custom property per card written from the page position (no layout read, no filters, no transitions on scale or shadow): a pure-CSS version could not keep the first card lit before the travel and the last one lit in the end hold.
- **New options, on both blocks** (attributes read at render time: the saved markup does not change, so existing posts stay valid):
  1. Direction: cards travel left or right; the default follows the writing direction (left in left-to-right languages, right in right-to-left ones).
  2. Progress indicator: a thin bar under the track, CSS only.
  3. Settle on a card: when scrolling stops inside the pinned stretch, the track settles on the nearest whole card.
  4. Speed: slow / normal / fast (how much page scroll crosses the track).
  5. Phone (under 960px): swipe (cards scroll sideways with the finger, today's behaviour, default) or stack (cards one under the other).
- The presentation gets a Horizontal Scroll section showing the options.

## Engine design

- `assets/js/horizontal-engine.js`, plain script, no build, loaded only on pages that render either block (render_block filter, as the Scroll Section script today). Replaces `blocks/horizontal-scroll/src/view.js` and the horizontal part of `blocks/scroll-section/src/view.js`.
- The script, on load and on resize only: builds the runtime track around the cards (as today), measures the travel distance and sets `--nelyqo-h-travel`, `--nelyqo-h-distance`, the section height and the pin top.
- CSS: the section declares a view timeline; the track's `translate`, the progress bar and the card emphasis are animations on that timeline whose range starts when the stage pins and ends `--nelyqo-h-travel` later.
- Fallback (no `animation-timeline`): the script updates `--nelyqo-h-offset` in a passive scroll listener, as today, without card effects.
- Reduced motion: no pin; cards in a native sideways scroller (or stacked, per the phone option).
- Settle: on `scrollend` (debounced `scroll` where missing) inside the pinned stretch, smooth-scroll to the nearest card's position; never while the user is still scrolling, never outside the stretch.
