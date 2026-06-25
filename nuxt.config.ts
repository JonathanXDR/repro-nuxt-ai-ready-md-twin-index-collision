export default defineNuxtConfig({
  modules: ['nuxt-ai-ready'],
  site: {
    url: 'https://example.com',
    name: 'AI Ready md twin collision repro',
    trailingSlash: true,
  },
  compatibilityDate: '2026-03-21',
  // nuxt-ai-ready's build-time crawler imports the native 'better-sqlite3'
  // package regardless of database.type (dist/module.mjs), and the crawler is
  // what triggers the Markdown twin writes, so the bug only appears once it runs.
  // The native addon cannot build in StackBlitz WebContainer, and WebContainer's
  // node:sqlite is non-functional, so this repo redirects 'better-sqlite3' to a
  // pure JS no-op stand-in (shims/better-sqlite3) via a file: dependency. The
  // crawler uses the DB only to index pages for llms.txt, so the no-op DB still
  // reproduces the twin collision. A Nitro build alias maps the native 'mdream'
  // engine to its pure JS twin '@mdream/js'.
  aiReady: { database: { type: 'sqlite' } },
  nitro: {
    alias: { mdream: '@mdream/js' },
    prerender: {
      crawlLinks: true,
      routes: ['/', '/about/'],
    },
  },
})
