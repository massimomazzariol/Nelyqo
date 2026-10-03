# Nelyqo Project Principles

Nelyqo is a standalone WordPress-native block theme. It extends WordPress; it does not replace WordPress.

## Architectural boundary

Use Core blocks, `theme.json`, Global Styles, the Site Editor, template parts, block templates, patterns, standard hooks, and WordPress APIs whenever they adequately solve the problem. Theme responsibilities are presentation, layout, styling, theme-owned visual interactions, reusable visual patterns, and design-system behavior.

Nelyqo must not become a proprietary page builder, parallel visual editor, custom administration framework, shortcode ecosystem, proprietary content store, bundle of unrelated site functionality, or all-in-one commercial-theme framework. Basic theme functionality must not require a plugin.

SEO engines, backups, analytics, SMTP, caching engines, malware scanners, WAF services, forms, redirects, database optimization, image-CDN services, and unrelated business behavior belong to WordPress Core, hosting, services, or optional plugins.

## Engineering principles

1. **WordPress first.** Prefer stable Core architecture and native block markup over custom abstractions.
2. **No lock-in.** Do not add proprietary shortcodes, hidden configuration stores, unnecessary post meta, or custom content formats where blocks work.
3. **Performance by design.** Keep dependencies and frontend JavaScript minimal; use block-specific assets, local resources, semantic tokens, efficient media, native browser capabilities, and Core performance features. Do not disable useful WordPress behavior for synthetic scores or add unmeasured micro-optimizations.
4. **Safe by default.** Use WordPress APIs. Validate, sanitize, escape, check capabilities, and use nonces whenever privileged or user-controlled PHP data requires them. Do not add telemetry or external requests without approval.
5. **Plugin friendly.** Avoid broad CSS and JavaScript overrides and never assume a particular plugin exists.
6. **Hosting friendly.** Support conventional WordPress hosting; deployment-specific optimization must not become a runtime requirement.
7. **Accessibility is correctness.** Require semantic landmarks, keyboard operation, visible focus, usable contrast, reduced motion, and assistive-technology compatibility.
8. **Compatibility before novelty.** Stable WordPress and browser APIs come first; experimental behavior requires a safe production fallback.
9. **Public project quality.** Keep architecture explicit, tooling reproducible, documentation understandable, and the repository free of secrets, personal paths, client residue, and development junk.

## Privacy and cookie-less architecture

Nelyqo must be cookie-less and storage-free by design for anonymous frontend visitors.

The theme itself must not:

- set cookies;
- use `document.cookie`;
- use `localStorage`;
- use `sessionStorage`;
- use IndexedDB;
- register service workers for theme functionality;
- implement telemetry;
- implement analytics or tracking;
- load tracking pixels;
- make unnecessary third-party network requests;
- load remote fonts;
- depend on third-party CSS or JavaScript CDNs; or
- automatically load third-party embeds.

Prefer local theme assets. Theme interactions and CSS/JavaScript enhancements must not require persistent browser storage.

WordPress Core authentication cookies for logged-in administrators and users are outside the theme's responsibility and must not be altered or disabled by Nelyqo. Nelyqo must not attempt unsafe modifications to WordPress Core merely to claim that an entire WordPress installation is cookie-free.

Plugins and site-specific functionality may introduce cookies or browser storage; that is outside the theme's guarantee.

The correct project claim is:

> Nelyqo itself does not set cookies, use persistent browser storage, perform tracking, or make unnecessary third-party requests on the anonymous frontend.

Where third-party embeds are later required, prefer privacy-preserving or explicit click-to-load approaches rather than automatic third-party requests.

This privacy architecture must remain compatible with the existing principles: WordPress Core first, no lock-in, plugin-friendly, safe by default, performance by design, and progressive enhancement.

## Motion direction

Motion is CSS-first, progressively enhanced, and controlled by semantic duration and easing tokens. Reduced-motion preferences must be respected. No animation library is used by default, and experimental effects require fallbacks. Hero entrances, pill interactions, card reveals, subtle scroll effects, and state transitions may be explored later only when they improve usability rather than distract.

## Compatibility policy

Block names, serialized attributes, saved markup, and compatibility classes are content-facing APIs. The `nelyqo/*` namespace may change only through a dedicated backup, deterministic migration, and validation process that proves existing content remains valid.
