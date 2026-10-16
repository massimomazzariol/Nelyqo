# One engine for horizontal scrolling (plan for 0.6.0)

Status: proposal, waiting for approval. Nothing here changes saved content until it is approved.

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
