# monarchprimelabs.github.io

Public website for Monarch Prime Labs: one page per app, plus the privacy
policy and support page each App Store / Google Play listing links to.

Served by GitHub Pages from the `main` branch root at
<https://monarchprimelabs.github.io/>.

## Layout

```
site-data.json          every app's facts (name, status, features, pricing, data points…)
content/privacy/*.html  full privacy-policy text, ported verbatim from the app repos
content/support/*.html  full support-page text (optional; FAQ from site-data otherwise)
tools/build.js          generator — writes index.html, apps/<key>/{index,privacy,support}.html,
                        privacy/, support/, 404.html, sitemap.xml, robots.txt
assets/                 stylesheet + 512px app icons + site mark
```

## Editing

1. Change `site-data.json` (or a fragment under `content/`).
2. `node tools/build.js`
3. Commit the source **and** the generated HTML — Pages serves the committed files, there is no build step on GitHub.

Adding an app: add an entry to `site-data.json`, drop its 512px icon in
`assets/icons/<key>.png`, optionally add `content/privacy/<key>.html`, rebuild.

## Rules

- Never publish a feature or data-handling claim that isn't true in the shipped app.
  Privacy pages are ported from the drafted policies in each app repo; keep them in sync.
- No external scripts, fonts, analytics, or trackers on this site. It is static HTML + one stylesheet.
