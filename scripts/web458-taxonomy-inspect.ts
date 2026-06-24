// WEB-458 taxonomy reconciliation — READ-ONLY inspection (writes nothing).
//
// Canonical taxonomy (per product):
//   solutions   (4): Product Development, Engineering Augmentation, Enterprise Transformation, Managed Systems
//   capabilities(6): Digital Experiences, Artificial Intelligence, Data & Analytics, Cloud Transformation,
//                    Internet of Things, Platformization
//
// Dumps both collections, flags keep vs deletion-candidate by canonical title, and scans EVERY
// collection for references (by ObjectId hex) to each candidate so deletes can be made reference-safe.
// Connects via mongoose directly (no Payload boot → no index side-effects). Prints the DB host first.
//
//   DATABASE_URI='mongodb://…prod…' pnpm exec tsx scripts/web458-taxonomy-inspect.ts
import mongoose from 'mongoose'

const uri = process.env.DATABASE_URI
if (!uri) throw new Error('Set DATABASE_URI inline (do not commit it).')

// Localized fields are stored as { en, bn }; collapse to the en value for display/matching.
const txt = (v: unknown): string =>
  v && typeof v === 'object'
    ? String((v as Record<string, unknown>).en ?? (v as Record<string, unknown>).bn ?? '')
    : String(v ?? '')

const norm = (s: unknown) => txt(s).trim().toLowerCase()

const CANON = {
  solutions: ['product development', 'engineering augmentation', 'enterprise transformation', 'managed systems'],
  capabilities: [
    'digital experiences',
    'artificial intelligence',
    'data & analytics',
    'cloud transformation',
    'internet of things',
    'platformization',
  ],
}

type Doc = { _id: unknown; title?: string; slug?: string; _status?: string }

const run = async () => {
  console.log(`\nDATABASE_URI host: ${uri.replace(/\/\/[^@]*@/, '//***@')}`)
  const conn = await mongoose.createConnection(uri).asPromise()
  const db = conn.db!
  console.log(`Connected db name: ${db.databaseName}`)

  const collNames = (await db.listCollections().toArray()).map((c) => c.name).sort()

  const doomed: { coll: string; doc: Doc }[] = []
  for (const coll of ['solutions', 'capabilities'] as const) {
    const docs = (await db.collection(coll).find({}).toArray()) as unknown as Doc[]
    const canon = CANON[coll]
    console.log(`\n=== ${coll} (${docs.length}) — canonical wants ${canon.length} ===`)
    for (const d of docs) {
      const keep = canon.includes(norm(d.title))
      console.log(
        `  ${keep ? '✅ KEEP   ' : '🗑  DELETE?'} ${String(d._id)} | ${(txt(d.title) || '∅').padEnd(28)} | slug=${txt(d.slug) || '∅'} | ${d._status ?? '?'}`,
      )
      if (!keep) doomed.push({ coll, doc: d })
    }
    const present = new Set(docs.map((d) => norm(d.title)))
    const missing = canon.filter((c) => !present.has(c))
    if (missing.length) console.log(`  ⚠️  MISSING canonical: ${missing.join(', ')}`)
  }

  // Reference scan: for each doomed _id, find every doc (any collection) whose JSON contains the hex.
  console.log(
    `\n=== reference scan for ${doomed.length} deletion candidates across ${collNames.length} collections ===`,
  )
  for (const { coll, doc } of doomed) {
    const hex = String(doc._id)
    const refs: string[] = []
    for (const cn of collNames) {
      const all = await db.collection(cn).find({}).toArray()
      for (const d of all) {
        if (String(d._id) === hex) continue
        if (JSON.stringify(d).includes(hex)) refs.push(`${cn}/${String(d._id)}`)
      }
    }
    console.log(`\n  🗑  ${coll} "${txt(doc.title)}" (${hex})`)
    console.log(
      refs.length ? refs.map((r) => `       ↳ ref by ${r}`).join('\n') : '       (no references — safe to delete)',
    )
  }

  await conn.close()
  process.exit(0)
}

run().catch((e) => {
  console.error('INSPECT ERROR:', e)
  process.exit(1)
})
