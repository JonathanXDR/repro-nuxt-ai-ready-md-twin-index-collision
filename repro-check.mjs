import { existsSync, readFileSync } from 'node:fs'

const PUB = '.output/public'
const page = `${PUB}/about/index.html`
const twinInDir = `${PUB}/about/index.md`
const twinSibling = `${PUB}/about.md`

const linkMatch = existsSync(page)
  ? readFileSync(page, 'utf8').match(
      /<link[^>]+rel="alternate"[^>]+type="text\/markdown"[^>]*href="([^"]+)"/,
    )
  : null
const advertised = linkMatch ? linkMatch[1] : '(page missing)'

const tick = (p) => (existsSync(p) ? 'EXISTS' : 'missing')

console.log('\n===== nuxt-ai-ready Markdown twin path =====\n')
console.log(`  about/index.html  (the prerendered page) : ${tick(page)}`)
console.log(`  about/index.md    (twin INSIDE page dir) : ${tick(twinInDir)}   <-- collides with the page`)
console.log(`  about.md          (twin as a sibling)    : ${tick(twinSibling)}`)
console.log(`\n  The page advertises its twin at: ${advertised}`)
console.log('\nThe Markdown twin is written to about/index.md, inside the page\'s own')
console.log('directory, next to about/index.html. On any host that resolves a directory')
console.log('request to its index (Vercel, most static CDNs), a request to the canonical')
console.log('/about/ resolves to about/index.md and serves raw Markdown instead of the')
console.log('HTML page. Confirmed on Vercel: /about/ returns the Markdown twin as text/html,')
console.log('so the browser renders unstyled text. Deploy this repo to Vercel to see it.\n')
