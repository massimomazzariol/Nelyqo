# Discretion audit

What a visitor or a scanner can still learn about a Nelyqo site, with all four Discretion switches on (Appearance > Nelyqo > Discretion). Measured on 2026-10-16 on the wp-env site (WordPress 7.1.3, Apache, Nelyqo 0.5.0, no plugins), front page and common WordPress addresses.

## The honest limit

A block theme cannot make a WordPress site look like something else. The block markup itself (`wp-block-*` classes, `--wp--preset--*` custom properties, `is-layout-*`, `wp-container-*`) is how core styles the page; the presentation front page carries 586 `wp-block-` classes and 288 `--wp--` properties. Removing them breaks the layout, and tools like Wappalyzer recognise the platform from them anyway.

So the goal of Discretion stays what it is today: **say nothing more than the platform** (no versions, no user names, no announcements of doors) and **close the doors that are not needed**. Hiding the platform itself is out of scope.

## Already handled by the theme

| Signal | Before | With Discretion |
| --- | --- | --- |
| Generator meta tag and feed generator | WordPress version | removed |
| Core asset `?ver=` | WordPress version | site-specific code |
| `X-Powered-By`, `X-Pingback` headers | PHP version, pingback URL | removed |
| RSD, WLW manifest, shortlink, REST and oEmbed discovery links and headers | in every page | removed (the features keep working) |
| `xmlrpc.php` | open | 403 |
| `/wp-json/wp/v2/users`, `?author=N`, author pages, user sitemap, oEmbed author | login names | 404 / removed for visitors |
| HTML comments (Performance switch) | plugin signatures | removed |

## Still visible

| Signal | Seen | Who can fix it | Proposal |
| --- | --- | --- | --- |
| `X-Redirect-By: WordPress` header on redirects (`/wp-admin/`, `?p=1`) | yes | theme (`x_redirect_by` filter) | add to "Hide versions"; safe, one filter |
| Feed links in `<head>` (posts and comments feeds) | yes | theme (`feed_links` actions) | new switch, **off by default**: feed readers find feeds through these links |
| Comments feed link | yes | theme | remove it with "Remove discovery links" while new posts take no comments |
| `readme.html`, `license.txt` in the site root | 200 | server | advice: delete them or deny them in `.htaccess` (they return after core updates) |
| `wp-links-opml.php` | 200 | server | advice: deny in `.htaccess` (old link manager, unused by block themes) |
| `wp-login.php`, `/wp-admin/` redirect | reachable | plugin or server | advice: rate limiting and two-factor login; a custom login address is plugin territory |
| `/wp-json/` index | 200, lists every route | theme could restrict it | **no**: the editor, embeds and many plugins use it; closing it breaks sites |
| `/wp-content/`, `/wp-includes/` paths in the HTML | 20 and 15 | companion plugin | path masking (roadmap): mod_rewrite plus URL filters, with a loopback self-test before switching |
| Theme files (`/wp-content/themes/nelyqo/readme.txt`, `style.css`) | 200, name and version | server | advice: deny `readme.txt` of themes and plugins in `.htaccess` |
| `Server: Apache/2.4.68 (Debian)` | full version | server | advice: `ServerTokens Prod` (server configuration, not `.htaccess`) |
| `wp-sitemap.xml`, `robots.txt` | WordPress paths | keep | needed for search engines |
| `wp-cron.php` | 200 | server | advice for busy sites: real cron and `DISABLE_WP_CRON`; not a discretion issue |
| Dotfiles (`/.git/HEAD` answered 200 on this dev site) | dev only | server | advice: deny dotfiles; never deploy `.git` |

## Done in 0.6.0 (items 1-3) and proposed

1. **Hide versions** also removes `X-Redirect-By` (filter `x_redirect_by`, list in `data/discretion.json`).
2. **New switch "Remove feed links"**, off by default; the feeds keep working at their addresses.
3. **Comments feed link** goes away with "Remove discovery links" while new posts take no comments (`default_comment_status` closed).
4. **Server advice** (the "Still visible" rows marked server) goes to the read-only Nelyqo Checkup page on Site Health (Phase 2), with copyable `.htaccess` snippets for Apache and LiteSpeed and the Nginx equivalents as text. The theme never writes `.htaccess`.
5. **Path masking** stays in the companion plugin plan (not the theme).

Each new item ships with a check in `lean/` that requests the page and fails if the signal comes back.
