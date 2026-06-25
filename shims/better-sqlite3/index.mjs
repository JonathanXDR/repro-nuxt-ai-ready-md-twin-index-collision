// WebContainer-compatible drop-in for better-sqlite3, backed by Node's built-in
// node:sqlite (Node 22.5+). nuxt-ai-ready's build-time crawler hard-imports
// 'better-sqlite3' (module.mjs initCrawler), which is a native addon and cannot
// build in StackBlitz WebContainer. This wraps node:sqlite's DatabaseSync to the
// small subset of the better-sqlite3 API the crawler uses (new Database(path),
// db.prepare(sql).all/get/run(...params), db.close()), so the build runs with no
// native addon. The DB is only used to collect page data for llms.txt; the
// Markdown twins themselves are written by Nitro's prerender, so this does not
// affect the bug.
import { DatabaseSync } from 'node:sqlite'

export default class Database {
  constructor(path, options = {}) {
    this._db = new DatabaseSync(path ?? ':memory:', {
      readOnly: Boolean(options.readonly ?? options.readOnly ?? false),
    })
  }

  prepare(sql) {
    return this._db.prepare(sql)
  }

  exec(sql) {
    this._db.exec(sql)
    return this
  }

  pragma(source) {
    this._db.exec(`PRAGMA ${source}`)
    return []
  }

  close() {
    this._db.close()
  }
}
