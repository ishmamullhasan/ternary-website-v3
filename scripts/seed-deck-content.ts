// Seed the site's CMS content from the pitch-deck-derived JSON in scripts/deck-content/.
// Idempotent: upserts collection records by slug (team by name) and updates page globals;
// NO deletes. Relationship references are authored as slug markers and resolved here to ids.
// richText is authored as { contentBlocks:[{heading?,paras:[]}] } and converted to Lexical.
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
type Lookups = Record<string, Map<string, string | number>>
const lookups: Lookups = {}

const resolveOne = (collection: string, key: string): string | number | null => {
  const m = lookups[collection]
  const id = m?.get(key) ?? m?.get(key.toLowerCase())
  if (id == null) console.warn(`  ⚠ unresolved ${collection} ref "${key}"`)
  return id ?? null
}

// Recursively convert { contentBlocks } -> Lexical and { _ref/_refs/_refsPoly } -> ids.
const transform = (val: any): any => {
  if (Array.isArray(val)) return val.map(transform)
  if (val && typeof val === 'object') {
    if (Array.isArray(val.contentBlocks)) return toLexical(val.contentBlocks)
    if (val._ref) return resolveOne(val._ref.collection, val._ref.slug)
    if (val._refs) {
      return (val._refs.slugs as string[]).map((s) => resolveOne(val._refs.collection, s)).filter((x) => x != null)
    }
    if (val._refsPoly) {
      return (val._refsPoly as { collection: string; slug: string }[])
        .map((r) => {
          const id = resolveOne(r.collection, r.slug)
          return id == null ? null : { relationTo: r.collection, value: id }
        })
        .filter(Boolean)
    }
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(val)) out[k] = transform(v)
    return out
  }
  return val
}

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

// 4b) Preload externally-referenced docs (e.g. the home "top 8 cards" — pre-existing client
// showcase docs this seed does not author) so their slug refs resolve too.
const collectRefs = (val: any, acc: [string, string][]) => {
  if (Array.isArray(val)) val.forEach((v) => collectRefs(v, acc))
  else if (val && typeof val === 'object') {
    if (val._ref) acc.push([val._ref.collection, val._ref.slug])
    else if (val._refs) (val._refs.slugs as string[]).forEach((s) => acc.push([val._refs.collection, s]))
    else if (val._refsPoly) (val._refsPoly as any[]).forEach((r) => acc.push([r.collection, r.slug]))
    else Object.values(val).forEach((v) => collectRefs(v, acc))
  }
}
const allRefs: [string, string][] = []
for (const g of [
  'global-home.json',
  'global-about.json',
  'global-solutions.json',
  'global-industries.json',
  'global-scales.json',
  'global-contact.json',
  'global-careers.json',
  'global-stories.json',
]) {
  const raw = read(g)
  if (raw) collectRefs(raw, allRefs)
}
for (const [collection, slug] of allRefs) {
  if (collection === 'team') continue // team resolved by name above
  if (lookups[collection]?.has(slug)) continue
  const found = await payload.find({ collection: collection as any, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  if (found.docs[0]) lookups[collection].set(slug, found.docs[0].id)
}

// 5) Page globals — resolve refs + richText, then updateGlobal.
const GLOBALS: { file: string; slug: string }[] = [
  { file: 'global-home.json', slug: 'homePage' },
  { file: 'global-about.json', slug: 'aboutPage' },
  { file: 'global-solutions.json', slug: 'solutionsPage' },
  { file: 'global-industries.json', slug: 'industriesPage' },
  { file: 'global-scales.json', slug: 'scalesPage' },
  { file: 'global-contact.json', slug: 'contactPage' },
  { file: 'global-careers.json', slug: 'careersPage' },
  { file: 'global-stories.json', slug: 'storiesPage' },
]
for (const g of GLOBALS) {
  const raw = read(g.file)
  if (!raw) {
    payload.logger.warn(`  ${g.slug}: ${g.file} missing — skipped`)
    continue
  }
  const data = transform(raw)
  if (!DRY) await ignoreRevalidate(() => payload.updateGlobal({ slug: g.slug as any, data, context: ctx }))
  payload.logger.info(`  ${g.slug}: updated (${Object.keys(data).length} top-level fields)`)
}

payload.logger.info('Seed deck content complete.')
process.exit(0)
