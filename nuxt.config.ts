export default defineNuxtConfig({
  modules: ['nuxt-ai-ready'],
  site: {
    url: 'https://example.com',
    name: 'AI Ready md twin collision repro',
    trailingSlash: true,
  },
  compatibilityDate: '2026-03-21',
  // nuxt-ai-ready's build-time crawler imports the native 'better-sqlite3'
  // package regardless of database.type (dist/module.mjs), so this repo installs
  // it and uses the default 'sqlite' driver. The crawler is what writes the
  // Markdown twins, so the bug only appears once it runs. A Nitro build alias
  // maps the native 'mdream' engine to its pure JS twin '@mdream/js' to keep the
  // native footprint small. Run locally or deploy to Vercel. StackBlitz
  // WebContainer cannot build the native 'better-sqlite3', so it cannot run this.
  aiReady: { database: { type: 'sqlite' } },
  nitro: {
    alias: { mdream: '@mdream/js' },
    prerender: {
      crawlLinks: true,
      routes: ['/', '/about/'],
    },
  },
})
