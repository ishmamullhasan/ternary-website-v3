// Seed the site's CMS content from the pitch-deck-derived JSON in scripts/deck-content/.
// Idempotent: upserts collection records by slug (team by name); NO deletes. (Page globals were
// retired in WEB-404 — landing pages now come from the Pages collection — so this no longer
// writes any page global.) richText is authored as { contentBlocks:[{heading?,paras:[]}] } and
// converted to Lexical.
//
//   pnpm payload run ./scripts/seed-deck-content.ts            # write to DATABASE_URI
//   SEED_DRY=1 pnpm payload run ./scripts/seed-deck-content.ts # preview (no writes)
import config from '@payload-config'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY === '1'
const DIR = join(dirname(fileURLToPath(import.meta.url)), 'deck-content')
const ctx = { disableRevalidate: true }

const read = (file: string): any => {
  try {
    return JSON.parse(readFileSync(join(DIR, file), 'utf8'))
  } catch {
    return null
  }
}

// ---- Lexical richText ----------------------------------------------------
const txt = (text: string) => ({
  type: 'text',
  text,
  format: 0,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})
const para = (text: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  textFormat: 0,
  textStyle: '',
  children: [txt(text)],
})
const heading = (text: string) => ({
  type: 'heading',
  tag: 'h3',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  children: [txt(text)],
})
type Block = { heading?: string; paras?: string[] }
const toLexical = (blocks: Block[]) => {
  const children: unknown[] = []
  for (const b of blocks || []) {
    if (b.heading) children.push(heading(b.heading))
    for (const p of b.paras || []) children.push(para(p))
  }
  if (!children.length) children.push(para(''))
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr' as const, children } }
}

// ---- Reference resolution -------------------------------------------------
// Lookup maps slug/name -> id, populated as each collection is upserted below so later
// records can reference earlier ones by slug.
type Lookups = Record<string, Map<string, string | number>>
const lookups: Lookups = {}

// ---- Upsert helpers -------------------------------------------------------
const payload: Payload = await getPayload({ config })
payload.logger.info(`Seed deck content ${DRY ? '(DRY RUN)' : '(WRITING)'} — dir ${DIR}`)

// The makeContentCollection/global afterChange hooks call Next's revalidateTag(), which throws
// outside a request context. The DB write commits before the hook runs, so this is non-fatal for
// seeding (same handling as scripts/ci-seed.ts). Swallow only that specific error.
const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

const upsertBySlug = async (collection: any, slug: string, data: Record<string, unknown>) => {
  const existing = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  if (DRY) return existing.docs[0]?.id ?? `dry-${slug}`
  await ignoreRevalidate(() =>
    existing.docs[0]
      ? payload.update({ collection, id: existing.docs[0].id, data, context: ctx })
      : payload.create({ collection, data: { slug, ...data }, context: ctx }),
  )
  // Re-query for the id: if afterChange threw on revalidate, create()'s return value is lost.
  const after = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return after.docs[0]?.id ?? null
}

// Base content collections (story/industry/solution/model): contentBlocks -> `content` richText.
const seedBase = async (file: string, collection: string) => {
  const recs: any[] = read(file) || []
  for (const r of recs) {
    const data = { title: r.title, slug: r.slug, excerpts: r.excerpts, content: toLexical(r.contentBlocks || []) }
    const id = await upsertBySlug(collection, r.slug, data)
    lookups[collection].set(r.slug, id)
  }
  payload.logger.info(`  ${collection}: ${recs.length} records`)
}

// Init lookup maps
for (const c of ['story', 'industry', 'solution', 'model', 'capability', 'scale', 'team']) lookups[c] = new Map()

// 1) Base collections
await seedBase('stories.json', 'story')
await seedBase('industries.json', 'industry')
await seedBase('solutions.json', 'solution')
await seedBase('models.json', 'model')

// 2) Capability (rich schema, no richText fields — author output maps 1:1)
for (const r of (read('capabilities.json') as any[]) || []) {
  const { slug, ...rest } = r
  const id = await upsertBySlug('capability', slug, rest)
  lookups['capability'].set(slug, id)
}
payload.logger.info(`  capability: ${((read('capabilities.json') as any[]) || []).length} records`)

// 3) Scale (no richText)
for (const r of (read('scales.json') as any[]) || []) {
  const { slug, ...rest } = r
  const id = await upsertBySlug('scale', slug, rest)
  lookups['scale'].set(slug, id)
}
payload.logger.info(`  scale: ${((read('scales.json') as any[]) || []).length} records`)

// 4) Team (upsert by name; slug auto-derives). Register both name and slug in the lookup.
for (const r of (read('team.json') as any[]) || []) {
  const existing = await payload.find({ collection: 'team', where: { name: { equals: r.name } }, limit: 1, depth: 0 })
  if (DRY) {
    lookups['team'].set(r.name, existing.docs[0]?.id ?? `dry-${r.name}`)
    continue
  }
  await ignoreRevalidate(() =>
    existing.docs[0]
      ? payload.update({ collection: 'team', id: existing.docs[0].id, data: r, context: ctx })
      : payload.create({ collection: 'team', data: r, context: ctx }),
  )
  const after = await payload.find({ collection: 'team', where: { name: { equals: r.name } }, limit: 1, depth: 0 })
  if (after.docs[0]) lookups['team'].set(r.name, after.docs[0].id)
}
payload.logger.info(`  team: ${((read('team.json') as any[]) || []).length} records`)

// Page globals were retired (WEB-404): landing pages now render from the Pages collection
// (blocks), not per-page globals. The block that upserted the homePage/aboutPage/…/storiesPage
// globals from global-*.json — and the preload loop that only resolved refs for it — were
// removed here as part of WEB-442. Their global-*.json source files were deleted too.

payload.logger.info('Seed deck content complete.')
process.exit(0)
