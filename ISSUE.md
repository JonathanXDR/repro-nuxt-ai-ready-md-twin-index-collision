<!--
Title: Markdown twin written to <route>/index.md shadows the canonical HTML page
Template: .github/ISSUE_TEMPLATE/02-bug-report.yml, label: bug
-->

## 🐛 The bug

nuxt-ai-ready writes a page's Markdown twin to `<route>/index.md`, inside the
page's own prerendered directory, next to its `index.html`. For a trailing-slash
route `/about/` the build produces:

```
about/index.html   the prerendered page
about/index.md     the Markdown twin, written into the same directory
```

On any host that resolves a directory request to its index file (Vercel, and
most static CDNs), a request to the canonical `/about/` now resolves to
`about/index.md` and serves raw Markdown as the page. The browser renders it as
unstyled text in Quirks Mode with no CSS or JS.

The in-directory twin is also redundant. The page already advertises its twin at
`/about.md` via `<link rel="alternate" type="text/markdown" href="/about.md">`,
and a sibling `about.md` is written too. So `about/index.md` is a second copy at a
path that collides with the canonical page and breaks it.

Root cause in 1.5.0: the Markdown route for a trailing-slash page resolves into
the page directory.

```js
// dist/module.mjs
const mdRoute = route.endsWith("/") ? `${route}index.md` : `${route}.md`;
```

So `/about/` yields `/about/index.md` rather than `/about.md`, and Nitro writes
that file inside `about/`.

## 🛠️ To reproduce

https://stackblitz.com/github/JonathanXDR/repro-nuxt-ai-ready-md-twin-index-collision

The StackBlitz (or `npm install && npm run repro` locally) runs `nuxt generate`
and prints the colliding paths:

```
about/index.html  (the prerendered page) : EXISTS
about/index.md    (twin INSIDE page dir) : EXISTS   <-- collides with the page
about.md          (twin as a sibling)    : EXISTS
The page advertises its twin at: /about.md
```

Deploy the same repo to Vercel (button in the README) and open `/about/`. It
returns `about/index.md` as `text/html`, so the browser shows raw Markdown. The
generated `config.json` maps `about/index.html => { path: "about" }`, but the
sibling `about/index.md` shadows it. This first surfaced on a production Vercel
deployment whose output had the byte for byte same structure, where every locale
landing page served raw Markdown to visitors.

## 🌈 Expected behavior

The Markdown twin is written only as a sibling `<route>.md` (the path the page's
`<link rel="alternate">` already advertises), never as `<route>/index.md` inside
the page's directory, so it can never shadow the canonical `index.html`.

## ℹ️ Additional context

The build-time crawler that writes the twins imports the native `better-sqlite3`
package regardless of `aiReady.database.type` (`dist/module.mjs` initCrawler). To
run in StackBlitz WebContainer, which cannot build native addons, the repo ships a
tiny drop-in for `better-sqlite3` backed by Node's built-in `node:sqlite`. The
shim only touches the crawler's bookkeeping database. The Markdown twins are
written by Nitro's prerender, so neither the shim, the `sqlite` database type, nor
the `mdream` to `@mdream/js` alias touches the bug, which is purely the output path
of the twin.

<details><summary><code>nuxi info</code> (reproduction)</summary>

|                      |                              |
| -------------------- | ---------------------------- |
| **Operating system** | `macOS`                      |
| **Node.js version**  | `v24+`                       |
| **Nuxt version**     | `4.4.8`                      |
| **Builder**          | `vite`                       |
| **Config**           | `aiReady`, `site`, `nitro`   |
| **Modules**          | `nuxt-ai-ready@1.5.0`, `@nuxtjs/sitemap@8.2.1`, `@nuxtjs/robots@6.1.1` |

</details>
