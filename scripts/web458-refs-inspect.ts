// WEB-458 — READ-ONLY: map exactly where solution/capability ids appear in the LIVE home page and
// the globals, with field paths + keep/doomed classification, so the reconcile can repoint precisely.
//   DATABASE_URI='mongodb://…prod…' pnpm exec tsx scripts/web458-refs-inspect.ts
import mongoose from 'mongoose'

const uri = process.env.DATABASE_URI
if (!uri) throw new Error('Set DATABASE_URI inline.')

const txt = (v: unknown): string =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? String((v as Record<string, unknown>).en ?? (v as Record<string, unknown>).bn ?? '')
    : String(v ?? '')
const norm = (s: unknown) => txt(s).trim().toLowerCase()

const CANON_SOL = ['product development', 'engineering augmentation', 'enterprise transformation', 'managed systems']
const CANON_CAP = [
  'digital experiences',
  'artificial intelligence',
  'data & analytics',
  'cloud transformation',
  'internet of things',
  'platformization',
]

const run = async () => {
  const conn = await mongoose.createConnection(uri).asPromise()
  const db = conn.db!

  // Build id → {coll, title, keep} map for solutions + capabilities.
  const meta = new Map<string, { coll: string; title: string; keep: boolean }>()
  for (const [coll, canon] of [
    ['solutions', CANON_SOL],
    ['capabilities', CANON_CAP],
  ] as const) {
    for (const d of await db.collection(coll).find({}).toArray()) {
      meta.set(String(d._id), { coll, title: txt(d.title), keep: canon.includes(norm(d.title)) })
    }
  }

  const hits: { path: string; hex: string }[] = []
  const walk = (node: unknown, path: string) => {
    if (node == null) return
    if (node instanceof mongoose.Types.ObjectId || (typeof node === 'object' && (node as { _bsontype?: string })._bsontype === 'ObjectId')) {
      const hex = String(node)
      if (meta.has(hex)) hits.push({ path, hex })
      return
    }
    if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`))
    if (typeof node === 'object') for (const [k, v] of Object.entries(node as object)) walk(v, path ? `${path}.${k}` : k)
  }

  const report = (label: string) => {
    if (!hits.length) return console.log('   (none)')
    for (const h of hits) {
      const m = meta.get(h.hex)!
      console.log(`   ${m.keep ? '✅keep ' : '🗑doomed'} ${m.coll} "${m.title}"  @ ${h.path}`)
    }
  }

  // Live home page.
  const home = await db.collection('pages').findOne({ slug: 'home' })
  console.log(`\n=== pages/home (${home?._id}) ===`)
  hits.length = 0
  walk(home?.layout, 'layout')
  report('home')

  // Globals (header/footer/nav etc.) — one doc per globalType.
  for (const g of await db.collection('globals').find({}).toArray()) {
    console.log(`\n=== global "${g.globalType}" (${g._id}) ===`)
    hits.length = 0
    walk(g, '')
    report('global')
  }

  await conn.close()
  process.exit(0)
}

run().catch((e) => {
  console.error('REFS ERROR:', e)
  process.exit(1)
})
