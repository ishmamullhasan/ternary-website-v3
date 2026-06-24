// WEB-458 taxonomy reconcile — make `solutions` (4) and `capabilities` (6) match the canonical set.
//
// Canonical:
//   solutions(4):   Product Development, Engineering Augmentation, Enterprise Transformation, Managed Systems
//   capabilities(6): Digital Experiences, Artificial Intelligence, Data & Analytics, Cloud Transformation,
//                    Internet of Things, Platformization
//
// On prod the `capabilities` collection wrongly holds the 4 solutions and all 6 real capabilities are
// missing. This script (idempotent):
//   1. Creates the 6 capabilities (+ the missing "Managed Systems" solution) as stubs with starter copy.
//   2. Repoints LIVE surfaces (home page solutionsSection/capabilitiesSection + footer) to the canonical set.
//   3. Strips every remaining doomed ref from all pages + globals (no dangling relationships).
//   4. Hard-deletes the 3 stray solutions + 4 mis-filed capabilities.
// Connects via mongoose directly (no Payload hooks). Revalidation self-heals (home/globals
// unstable_cache revalidate:300) or trigger sooner with an admin re-save.
//
//   DATABASE_URI='mongodb://…prod…' pnpm exec tsx scripts/web458-taxonomy-reconcile.ts        # DRY (default)
//   DRY=0 DATABASE_URI='mongodb://…prod…' pnpm exec tsx scripts/web458-taxonomy-reconcile.ts  # APPLY
import mongoose from 'mongoose'
import { writeFileSync } from 'node:fs'

const { ObjectId } = mongoose.Types
const uri = process.env.DATABASE_URI
if (!uri) throw new Error('Set DATABASE_URI inline.')
const DRY = process.env.DRY !== '0'

const txt = (v: unknown): string =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? String((v as Record<string, unknown>).en ?? (v as Record<string, unknown>).bn ?? '')
    : String(v ?? '')
const norm = (s: unknown) => txt(s).trim().toLowerCase()

// Canonical solutions in display order (titles must match existing docs to be KEPT).
const SOLUTIONS = ['Product Development', 'Engineering Augmentation', 'Enterprise Transformation', 'Managed Systems']
// New solution(s) to create when missing, with starter copy.
const NEW_SOLUTIONS: Record<string, { slug: string; excerpt: string }> = {
  'Managed Systems': {
    slug: 'managed-systems',
    excerpt:
      'We run and evolve the systems we build — ongoing reliability, security, and governance long after launch.',
  },
}
// Canonical capabilities in display order, all created fresh with starter copy.
const CAPABILITIES: { title: string; slug: string; excerpt: string }[] = [
  {
    title: 'Digital Experiences',
    slug: 'digital-experiences',
    excerpt: 'Web, mobile, and product interfaces engineered for clarity, speed, and trust.',
  },
  {
    title: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    excerpt: 'Agentic systems, LLM applications, and ML pipelines built for production accountability.',
  },
  {
    title: 'Data & Analytics',
    slug: 'data-analytics',
    excerpt: 'Pipelines, warehouses, and decision-grade analytics on a single source of truth.',
  },
  {
    title: 'Cloud Transformation',
    slug: 'cloud-transformation',
    excerpt: 'Cloud-native architecture, migration, and platform operations governed for regulated environments.',
  },
  {
    title: 'Internet of Things',
    slug: 'internet-of-things',
    excerpt: 'Connected devices, edge, and telemetry platforms — from firmware to dashboard.',
  },
  {
    title: 'Platformization',
    slug: 'platformization',
    excerpt: 'Turning bespoke builds into reusable internal platforms that compound delivery speed.',
  },
]

const SOL_SET = new Set(SOLUTIONS.map((s) => s.toLowerCase()))
const CAP_SET = new Set(CAPABILITIES.map((c) => c.title.toLowerCase()))

const log = (s: string) => console.log(s)

const run = async () => {
  log(`\n${DRY ? '🟡 DRY-RUN (no writes)' : '🔴 APPLY (writing)'}   host: ${uri.replace(/\/\/[^@]*@/, '//***@')}`)
  const conn = await mongoose.createConnection(uri).asPromise()
  const db = conn.db!
  log(`db: ${db.databaseName}`)

  const Sol = db.collection('solutions')
  const Cap = db.collection('capabilities')
  const Pages = db.collection('pages')
  const Globals = db.collection('globals')

  // ---- classify current docs ----
  const curSol = await Sol.find({}).toArray()
  const curCap = await Cap.find({}).toArray()
  const doomed = new Set<string>()
  for (const d of curSol) if (!SOL_SET.has(norm(d.title))) doomed.add(String(d._id))
  for (const d of curCap) if (!CAP_SET.has(norm(d.title))) doomed.add(String(d._id))
  log(
    `\nDoomed docs (${doomed.size}): ${[...curSol, ...curCap]
      .filter((d) => doomed.has(String(d._id)))
      .map((d) => `${txt(d.title)}`)
      .join(', ')}`,
  )

  // ---- backup before any writes ----
  if (!DRY) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const path = `scripts/web458-backup-${stamp}.json`
    writeFileSync(
      path,
      JSON.stringify(
        {
          solutions: curSol,
          capabilities: curCap,
          pages: await Pages.find({}).toArray(),
          globals: await Globals.find({}).toArray(),
        },
        null,
        2,
      ),
    )
    log(`\n💾 backup written: ${path}`)
  }

  // ---- 1. ensure canonical docs exist (create stubs w/ starter copy) ----
  const now = new Date()
  const ensure = async (coll: typeof Cap, title: string, slug: string, excerpt: string, hero: boolean) => {
    const existing = await coll.findOne({ slug })
    if (existing) return existing._id
    const doc: Record<string, unknown> = {
      _id: new ObjectId(),
      title: { en: title },
      slug,
      generateSlug: false,
      excerpts: { en: excerpt },
      ...(hero ? { heroSection: { badge: { en: title }, heading: { en: title }, description: { en: excerpt } } } : {}),
      createdAt: now,
      updatedAt: now,
      __v: 0,
    }
    log(`  + create ${coll.collectionName} "${title}" (slug=${slug})`)
    if (!DRY) await coll.insertOne(doc as never)
    return doc._id as InstanceType<typeof ObjectId>
  }

  log(`\n=== 1. ensure canonical docs ===`)
  const capIds: InstanceType<typeof ObjectId>[] = []
  for (const c of CAPABILITIES) capIds.push(await ensure(Cap, c.title, c.slug, c.excerpt, true))
  const solIdByTitle = new Map<string, InstanceType<typeof ObjectId>>()
  for (const title of SOLUTIONS) {
    const keep = curSol.find((d) => norm(d.title) === title.toLowerCase() && !doomed.has(String(d._id)))
    if (keep) solIdByTitle.set(title, keep._id as InstanceType<typeof ObjectId>)
    else if (NEW_SOLUTIONS[title])
      solIdByTitle.set(title, await ensure(Sol, title, NEW_SOLUTIONS[title].slug, NEW_SOLUTIONS[title].excerpt, false))
  }
  const solIds = SOLUTIONS.map((t) => solIdByTitle.get(t)!).filter(Boolean)
  log(`  canonical solution ids: ${solIds.length}/4   capability ids: ${capIds.length}/6`)

  // ---- 2. repoint LIVE surfaces ----
  log(`\n=== 2. repoint live surfaces ===`)
  const home = await Pages.findOne({ slug: 'home' })
  if (home) {
    const layout = (home.layout as Record<string, unknown>[]).map((b) => {
      if (b.blockType === 'solutionsSection') return { ...b, items: solIds }
      if (b.blockType === 'capabilitiesSection') return { ...b, capability: capIds }
      return b
    })
    log(`  home: solutionsSection.items→${solIds.length}, capabilitiesSection.capability→${capIds.length}`)
    if (!DRY) await Pages.updateOne({ _id: home._id }, { $set: { layout } })
  }
  const footer = await Globals.findOne({ globalType: 'footer' })
  if (footer) {
    log(`  footer: capabilities→${capIds.length}, solutions→${solIds.length}`)
    if (!DRY) await Globals.updateOne({ _id: footer._id }, { $set: { capabilities: capIds, solutions: solIds } })
  }

  // ---- 3. strip remaining doomed refs from all pages + globals ----
  const strip = (node: unknown): { v: unknown; changed: boolean } => {
    if (node == null) return { v: node, changed: false }
    if (
      node instanceof ObjectId ||
      (typeof node === 'object' && (node as { _bsontype?: string })._bsontype === 'ObjectId')
    ) {
      return doomed.has(String(node)) ? { v: null, changed: true } : { v: node, changed: false }
    }
    // Leaf for any non-plain object (Date, Buffer, other BSON types) — never rebuild these.
    if (typeof node === 'object' && !Array.isArray(node) && node.constructor !== Object)
      return { v: node, changed: false }
    if (Array.isArray(node)) {
      let changed = false
      const out: unknown[] = []
      for (const el of node) {
        // polymorphic {relationTo, value}
        if (
          el &&
          typeof el === 'object' &&
          'value' in (el as object) &&
          doomed.has(String((el as { value: unknown }).value))
        ) {
          changed = true
          continue
        }
        const r = strip(el)
        if (r.v === null && (el instanceof ObjectId || (el as { _bsontype?: string })?._bsontype === 'ObjectId')) {
          changed = true
          continue // drop doomed scalar from array
        }
        changed = changed || r.changed
        out.push(r.v)
      }
      return { v: out, changed }
    }
    if (node && typeof node === 'object') {
      let changed = false
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(node as object)) {
        const r = strip(val)
        out[k] = r.v
        changed = changed || r.changed
      }
      return { v: out, changed }
    }
    return { v: node, changed: false }
  }

  log(`\n=== 3. strip doomed refs from pages + globals ===`)
  for (const [coll, label] of [
    [Pages, 'pages'],
    [Globals, 'globals'],
  ] as const) {
    for (const doc of await coll.find({}).toArray()) {
      const r = strip(doc)
      if (r.changed) {
        const id = String(doc._id)
        log(`  strip ${label}/${id}${doc.globalType ? ` (${doc.globalType})` : doc.slug ? ` (${doc.slug})` : ''}`)
        if (!DRY) {
          const { _id, ...rest } = r.v as Record<string, unknown>
          void _id
          await coll.updateOne({ _id: doc._id }, { $set: rest })
        }
      }
    }
  }

  // ---- 4. hard-delete doomed docs ----
  log(`\n=== 4. delete doomed docs ===`)
  for (const [coll, cur] of [
    [Sol, curSol],
    [Cap, curCap],
  ] as const) {
    for (const d of cur)
      if (doomed.has(String(d._id))) {
        log(`  - delete ${coll.collectionName} "${txt(d.title)}" (${String(d._id)})`)
        if (!DRY) await coll.deleteOne({ _id: d._id })
      }
  }

  log(`\n${DRY ? '🟡 DRY-RUN complete — no changes made. Re-run with DRY=0 to apply.' : '✅ APPLY complete.'}`)
  await conn.close()
  process.exit(0)
}

run().catch((e) => {
  console.error('RECONCILE ERROR:', e)
  process.exit(1)
})
