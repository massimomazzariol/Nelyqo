# Performance baseline

Measured on 2026-10-15, theme at the 0.4.1 fixes (branch `fix/quick-wins`).

## How

- Site: `wp-env` on Windows (Docker Desktop, WSL2), WordPress 7.1.3, PHP 8.2, Nelyqo active, no plugins.
- Pages: `lean/lighthouse.json` (home, sample page, Full-page section fixture, Image lightbox page).
- Tool: `lean/lighthouse.mjs`, Lighthouse 13.5 performance category, 5 runs per page and preset, headless Chromium.
- Run: `CHROME_PATH=<chrome> node lean/lighthouse.mjs` with the site running (`pnpm run wp-env start`).
- Values: median, range in brackets. FCP and LCP are Lighthouse's simulated (throttled) values.
- TTFB is not representative here: Docker on Windows serves WordPress from a bind-mounted folder, so server time swings between 0.4 and 3.4 s. Compare TTFB only on real hosting.

## Mobile

| Page | Score | FCP ms | LCP ms | TBT ms | CLS | TTFB ms | Bytes KB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 100 (97-100) | 791 (787-798) | 1541 (1537-1548) | 0 (0-0) | 0 (0-0) | 1213 (1095-2941) | 114 (114-114) |
| `/sample-page/` | 100 (98-100) | 789 (788-792) | 1539 (1538-1542) | 0 (0-0) | 0 (0-0.001) | 1204 (1081-2264) | 115 (115-115) |
| `/fullpage/` | 98 (97-100) | 795 (794-800) | 1545 (1544-1550) | 0 (0-0) | 0 (0-0) | 2263 (411-2533) | 118 (118-118) |
| `/lightbox/` | 99 (97-99) | 935 (934-936) | 2135 (2134-2136) | 0 (0-0) | 0 (0-0) | 1125 (1091-2225) | 195 (195-195) |

## Desktop

| Page | Score | FCP ms | LCP ms | TBT ms | CLS | TTFB ms | Bytes KB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 100 (98-100) | 241 (240-244) | 361 (360-375) | 0 (0-0) | 0 (0-0) | 1081 (447-2190) | 114 (114-114) |
| `/sample-page/` | 99 (98-100) | 239 (238-240) | 359 (358-360) | 0 (0-0) | 0 (0-0) | 2089 (1055-2171) | 115 (115-115) |
| `/fullpage/` | 100 (95-100) | 243 (242-278) | 403 (374-413) | 0 (0-0) | 0 (0-0) | 1109 (413-3237) | 118 (118-118) |
| `/lightbox/` | 97 (95-99) | 301 (291-319) | 541 (531-559) | 0 (0-0) | 0 (0-0) | 2605 (1773-3416) | 195 (195-195) |

## Reading it

- No blocking time and no layout shift on any page.
- The lightbox page is the heaviest (195 KB): the image itself (the theme screenshot used as test image) plus the Interactivity API modules that core loads for the lightbox.
- Script and stylesheet sizes per page (with and without the theme) are tracked separately with wp-lean-check: `node <wp-lean-check>/cli.js --dir . --config lean/scroll.json`.
