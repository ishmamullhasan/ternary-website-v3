/**
 * Content-preserving migration: page globals -> Pages collection (blocks).
 *
 * Reads each legacy page global and upserts a Page (by slug) whose `layout` is the same
 * content expressed as blocks. Idempotent (re-runnable). Run with:
 *
 *   MIGRATE_DRY=1 pnpm payload run ./scripts/migrate-globals-to-pages.ts   # preview only
 *   pnpm payload run ./scripts/migrate-globals-to-pages.ts                 # write
 *
 * Home is mapped onto the granular design-faithful section blocks (aboutSection, …). Every
 * other marketing page is ported as ONE composite design-faithful block whose fields mirror
 * the page global 1:1 — so the global's content drops straight into the block. To target a
 * specific DB without editing .env:  DATABASE_URI=<uri> pnpm payload run ./scripts/...
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.MIGRATE_DRY === '1'

// ---- relationship helpers (home mapper) -----------------------------------
type RelInput = number | string | { id?: number | string } | { relationTo: string; value: unknown } | null | undefined

/** Extract a relationship id from an id, a populated doc, or a {relationTo,value} pair. */
const relId = (item: RelInput): number | string | null => {
  if (item == null) return null
  if (typeof item === 'number' || typeof item === 'string') return item
  if ('value' in item) return relId(item.value as RelInput)
  if ('id' in item && item.id != null) return item.id
  return null
}

/** Pass through items that are already polymorphic ({relationTo,value}); normalise value to id. */
const passPolyItems = (arr: unknown) =>
  (Array.isArray(arr) ? arr : [])
    .map((v) => {
      const o = v as { relationTo?: string; value?: unknown }
      return o?.relationTo ? { relationTo: o.relationTo, value: relId(o.value as RelInput) } : null
    })
    .filter((i): i is { relationTo: string; value: number | string } => Boolean(i && i.value != null))

type Block = Record<string, unknown> & { blockType: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobalData = any

/** Normalise a single-relationTo array of ids/docs to a flat id list. */
const ids = (arr: unknown): (number | string)[] =>
  Array.isArray(arr) ? arr.map((v) => relId(v as RelInput)).filter((x): x is number | string => x != null) : []

// Map the home global onto the DESIGN-FAITHFUL section blocks (each renders the real
// hand-built component), preserving the exact homepage design.
function mapHome(d: GlobalData): Block[] {
  const L: Block[] = []
  const a = d?.about
  if (a)
    L.push({
      blockType: 'aboutSection',
      heading: a.heading ?? null,
      description: a.description ?? null,
      items: passPolyItems(a.items),
      organizations: a.organizations
        ? {
            heading: a.organizations.heading ?? null,
            organization: (a.organizations.organization ?? []).map((o: GlobalData) => ({
              icon: relId(o.icon),
              name: o.name ?? null,
              link: o.link ?? null,
            })),
          }
        : null,
      bottomDescription: a.bottomDescription ?? null,
    })
  const s = d?.solutions
  if (s)
    L.push({
      blockType: 'solutionsSection',
      heading: s.heading ?? null,
      description: s.description ?? null,
      image: relId(s.image),
      items: ids(s.items),
    })
  const cap = d?.capabilities
  if (cap)
    L.push({
      blockType: 'capabilitiesSection',
      heading: cap.heading ?? null,
      description: cap.description ?? null,
      capability: ids(cap.capability),
      heading_2: cap.heading_2 ?? null,
      description_2: cap.description_2 ?? null,
      image: relId(cap.image),
    })
  const ind = d?.industries
  if (ind)
    L.push({
      blockType: 'industriesSection',
      heading: ind.heading ?? null,
      description: ind.description ?? null,
      industries: ids(ind.industry),
    })
  const sc = d?.scales
  if (sc)
    L.push({
      blockType: 'scalesSection',
      heading: sc.heading ?? null,
      description: sc.description ?? null,
      scales: ids(sc.scale),
    })
  const en = d?.engagement
  if (en)
    L.push({
      blockType: 'engagementSection',
      heading: en.heading ?? null,
      description: en.description ?? null,
      model: ids(en.model),
    })
  const gd = d?.globalDelivery
  if (gd)
    L.push({
      blockType: 'globalDeliverySection',
      heading: gd.heading ?? null,
      description: gd.description ?? null,
      image: relId(gd.image),
      title: gd.title ?? null,
      excerpt: gd.excerpt ?? null,
    })
  const pr = d?.processes
  if (pr)
    L.push({
      blockType: 'processSection',
      heading: pr.heading ?? null,
      description: pr.description ?? null,
      process: (pr.process ?? []).map((p: GlobalData) => ({
        title: p.title ?? null,
        description: p.description ?? null,
      })),
    })
  const tm = d?.team
  if (tm)
    L.push({
      blockType: 'teamSection',
      heading: tm.heading ?? null,
      description: tm.description ?? null,
      members: ids(tm.members),
    })
  const op = d?.opportunities
  if (op)
    L.push({
      blockType: 'opportunitiesSection',
      heading: op.heading ?? null,
      description: op.description ?? null,
      opportunity: ids(op.opportunity),
    })
  return L
}

// ---- composite design-faithful mapper -------------------------------------
// Each non-home marketing page is ported as ONE composite block whose fields mirror the page
// global 1:1. Fetched at depth 0, every relationship/upload is already an id (or
// {relationTo,value} for polymorphic) — Payload's write format — so the global's content drops
// straight into the block once the top-level global meta keys are stripped.
const META_KEYS = new Set(['id', '_id', 'globalType', 'createdAt', 'updatedAt'])
const stripMeta = (d: GlobalData): GlobalData => {
  if (!d || typeof d !== 'object') return {}
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(d)) if (!META_KEYS.has(k)) out[k] = v
  return out
}
const composite =
  (blockType: string) =>
  (d: GlobalData): Block[] =>
    d ? [{ blockType, ...stripMeta(d) }] : []

// ---- mapper registry ------------------------------------------------------
type MapperEntry = {
  globalSlug: string
  pageSlug: string
  title: string
  depth: number
  map: (d: GlobalData) => Block[]
}

const MAPPERS: MapperEntry[] = [
  { globalSlug: 'homePage', pageSlug: 'home', title: 'Home', depth: 1, map: mapHome },
  { globalSlug: 'aboutPage', pageSlug: 'about', title: 'About', depth: 0, map: composite('aboutPageSection') },
  { globalSlug: 'solutionsPage', pageSlug: 'solutions', title: 'Solutions', depth: 0, map: composite('solutionsPageSection') }, // prettier-ignore
  { globalSlug: 'industriesPage', pageSlug: 'industries', title: 'Industries', depth: 0, map: composite('industriesPageSection') }, // prettier-ignore
  { globalSlug: 'scalesPage', pageSlug: 'scales', title: 'Scales', depth: 0, map: composite('scalesPageSection') },
  { globalSlug: 'contactPage', pageSlug: 'contact', title: 'Contact', depth: 0, map: composite('contactPageSection') },
  { globalSlug: 'careersPage', pageSlug: 'careers', title: 'Careers', depth: 0, map: composite('careersPageSection') },
  { globalSlug: 'storiesPage', pageSlug: 'stories', title: 'Stories', depth: 0, map: composite('storiesPageSection') },
]

async function upsertPage(payload: Payload, pageSlug: string, title: string, layout: Block[]) {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: pageSlug } },
    limit: 1,
    depth: 0,
  })
  // Blocks are built dynamically, so the data shape is cast to Payload's create/update input.
  const data = { title, slug: pageSlug, layout, _status: 'published' } as never
  if (existing.docs[0]) {
    if (!DRY) await payload.update({ collection: 'pages', id: existing.docs[0].id, data })
    return 'updated'
  }
  if (!DRY) await payload.create({ collection: 'pages', data })
  return 'created'
}

const payload = await getPayload({ config })
payload.logger.info(`Migration ${DRY ? '(DRY RUN)' : '(WRITING)'} — globals -> pages`)

for (const { globalSlug, pageSlug, title, depth, map } of MAPPERS) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await payload.findGlobal({ slug: globalSlug as any, depth })
  const layout = map(data)
  if (!layout.length) {
    payload.logger.warn(`  ${globalSlug} -> ${pageSlug}: no blocks (empty global) — skipped`)
    continue
  }
  const action = await upsertPage(payload, pageSlug, title, layout)
  payload.logger.info(
    `  ${globalSlug} -> /${pageSlug}: ${action} (${layout.length} block${layout.length > 1 ? 's' : ''}: ${layout
      .map((b) => b.blockType)
      .join(', ')})`,
  )
}

payload.logger.info('Migration complete.')
process.exit(0)
