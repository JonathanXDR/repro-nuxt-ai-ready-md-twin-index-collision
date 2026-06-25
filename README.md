# nuxt-ai-ready reproduction: Markdown twin shadows the canonical HTML

Minimal Nuxt 4 reproduction for a nuxt-ai-ready bug present in 1.5.0.

nuxt-ai-ready writes each page's Markdown twin to `<route>/index.md`, **inside the
page's own prerendered directory**, next to its `index.html`. On any host that
resolves a directory request to its index (Vercel, and most static CDNs), a
request to the canonical `/<route>/` resolves to `<route>/index.md` and serves
raw Markdown instead of the page's `index.html`. The browser renders unstyled
text in Quirks Mode with no CSS or JS.

See [ISSUE.md](./ISSUE.md) for the full report with code citations.

## Reproduce on StackBlitz

https://stackblitz.com/github/JonathanXDR/repro-nuxt-ai-ready-md-twin-index-collision

It runs `nuxt generate` and prints the output paths for the `/about/` page:

```
about/index.html  (the prerendered page) : EXISTS
about/index.md    (twin INSIDE page dir) : EXISTS   <-- collides with the page
about.md          (twin as a sibling)    : EXISTS
The page advertises its twin at: /about.md
```

The twin is written to `about/index.md`, sitting on top of the page's own
directory. A correct sibling `about.md` (the path the page's
`<link rel="alternate">` advertises) is written too, so the in-directory
`about/index.md` is a redundant copy that also breaks the canonical URL.

## Reproduce the actual breakage on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JonathanXDR/repro-nuxt-ai-ready-md-twin-index-collision)

Deploy this repo to Vercel and open `/about/`. It serves the Markdown twin
(`about/index.md`) as `text/html`, so you see raw Markdown instead of the page.
The generated `config.json` maps `about/index.html => { path: "about" }`, but the
sibling `about/index.md` shadows it, so the canonical URL resolves to the
Markdown. This was first observed on a production deployment with the byte for
byte same output structure, where every locale landing page served raw Markdown.

## Notes

- nuxt-ai-ready's build-time crawler imports the native `better-sqlite3` package
  to collect page data, regardless of `aiReady.database.type` (`dist/module.mjs`).
  Native addons cannot build in StackBlitz WebContainer, and WebContainer's
  built-in `node:sqlite` is non-functional there, so this repo redirects
  `better-sqlite3` to a tiny pure JS no-op stand-in at `shims/better-sqlite3`
  (via a `file:` dependency) so the build runs with no SQLite at all. The crawler
  uses the DB only to index pages for `llms.txt`. The Markdown twins are written
  by Nitro's prerender, so the no-op DB still reproduces the twin collision and
  `llms.txt` simply ends up empty.
- `aiReady.database.type` is `sqlite` and a Nitro build alias maps the native
  `mdream` engine to its pure JS twin `@mdream/js`. Neither touches the bug,
  which is purely the output path of the Markdown twin.

## Environment

See the `nuxi info` block in [ISSUE.md](./ISSUE.md).
