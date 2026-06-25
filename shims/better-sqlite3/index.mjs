// Pure-JS in-memory stand-in for better-sqlite3, for StackBlitz WebContainer.
//
// nuxt-ai-ready's build-time crawler hard-imports 'better-sqlite3'
// (module.mjs initCrawler), a native addon that cannot build in WebContainer.
// WebContainer's built-in node:sqlite is also non-functional (its DatabaseSync
// instances have no working prepare()), so a node:sqlite-backed shim throws
// "this._db.prepare is not a function" and the crawler aborts before any twin
// is written.
//
// The crawler only uses the DB to index pages for llms.txt and search. The
// Markdown twins themselves are written by Nitro's prerender (the
// x-nitro-prerender fetch in processSitemapEntry), independent of the DB. So a
// no-op DB that never throws lets the crawl complete and the twins generate,
// faithfully reproducing the twin collision. llms.txt ends up empty, which is
// irrelevant to this bug.
class Statement {
  constructor(sql) {
    this.sql = sql
  }

  all() {
    return []
  }

  get() {
    return undefined
  }

  run() {
    return { changes: 0, lastInsertRowid: 0 }
  }

  iterate() {
    return [][Symbol.iterator]()
  }

  pluck() {
    return this
  }

  raw() {
    return this
  }

  bind() {
    return this
  }
}

export default class Database {
  constructor(path) {
    this.name = path ?? ':memory:'
    this.open = true
    this.memory = true
  }

  prepare(sql) {
    return new Statement(sql)
  }

  exec() {
    return this
  }

  pragma() {
    return []
  }

  transaction(fn) {
    const run = (...args) => fn(...args)
    run.deferred = run
    run.immediate = run
    run.exclusive = run
    return run
  }

  function() {
    return this
  }

  close() {
    this.open = false
    return this
  }
}
