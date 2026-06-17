/**
 * Content-preserving migration: page globals -> Pages collection (blocks).
 *
 * Reads each legacy page global and upserts a Page (by slug) whose `layout` is the same
 * content expressed as blocks. Idempotent (re-runnable). Run with:
 *
 *   MIGRATE_DRY=1 pnpm payload run ./scripts/migrate-globals-to-pages.ts   # preview only
 *   pnpm payload run ./scripts/migrate-globals-to-pages.ts                 # write
 *
 * IMPORTANT: validate the mapping against real content on staging before prod — the
 * sandbox DB is empty, so this has only been run dry against empty globals. The `home`
 * mapper is complete and demonstrates every block type + relationship-normalisation
 * helper; the remaining globals follow the exact same pattern (fill the stubs).
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.MIGRATE_DRY === '1'

// ---- relationship helpers -------------------------------------------------
type RelInput = number | string | { id?: number | string } | { relationTo: string; value: unknown } | null | undefined

/** Extract a relationship id from an id, a populated doc, or a {relationTo,value} pair. */
const relId = (item: RelInput): number | string | null => {
  if (item == null) return null
  if (typeof item === 'number' || typeof item === 'string') return item
  if ('value' in item) return relId(item.value as RelInput)
  if ('id' in item && item.id != null) return item.id
  return null
}

/** Normalise a single-relationTo array into RelationGrid's polymorphic {relationTo,value} items. */
const polyItems = (arr: unknown, relationTo: string) =>
  (Array.isArray(arr) ? arr : [])
    .map((v) => ({ relationTo, value: relId(v as RelInput) }))
    .filter((i) => i.value != null)

/** Pass through items that are already polymorphic ({relationTo,value}); normalise value to id. */
const passPolyItems = (arr: unknown) =>
  (Array.isArray(arr) ? arr : [])
    .map((v) => {
      const o = v as { relationTo?: string; value?: unknown }
      return o?.relationTo ? { relationTo: o.relationTo, value: relId(o.value as RelInput) } : null
    })
    .filter((i): i is { relationTo: string; value: number | string } => Boolean(i && i.value != null))

type Block = Record<string, unknown> & { blockType: string }
const truthy = (...vals: unknown[]) => vals.some((v) => v != null && v !== '')

// ---- per-global mappers ---------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobalData = any

function mapHome(d: GlobalData): Block[] {
  const layout: Block[] = []
  const about = d?.about
  if (truthy(about?.heading, about?.description))
    layout.push({ blockType: 'hero', heading: about.heading ?? null, description: about.description ?? null })
  if (about?.items?.length)
    layout.push({
      blockType: 'relationGrid',
      heading: null,
      description: null,
      columns: '4',
      items: passPolyItems(about.items),
    })
  if (about?.organizations?.organization?.length)
    layout.push({
      blockType: 'logos',
      heading: about.organizations.heading ?? null,
      logos: about.organizations.organization.map((o: GlobalData) => ({
        icon: relId(o.icon),
        name: o.name ?? null,
        link: o.link ?? null,
      })),
    })
  const grid = (sec: GlobalData, field: string, rel: string, columns = '3') =>
    sec &&
    layout.push({
      blockType: 'relationGrid',
      heading: sec.heading ?? null,
      description: sec.description ?? null,
      columns,
      items: polyItems(sec[field], rel),
    })
  grid(d?.solutions, 'items', 'solution')
  grid(d?.capabilities, 'capability', 'capability')
  grid(d?.industries, 'industry', 'industry', '4')
  grid(d?.scales, 'scale', 'scale')
  grid(d?.engagement, 'model', 'model')
  const gd = d?.globalDelivery
  if (truthy(gd?.heading, gd?.title))
    layout.push({
      blockType: 'featureGrid',
      heading: gd.heading ?? null,
      description: gd.description ?? null,
      columns: '2',
      items: [{ title: gd.title ?? null, description: gd.excerpt ?? null, image: relId(gd.image) }],
    })
  const proc = d?.processes
  if (proc?.process?.length)
    layout.push({
      blockType: 'steps',
      heading: proc.heading ?? null,
      description: proc.description ?? null,
      steps: proc.process.map((p: GlobalData) => ({ title: p.title ?? null, description: p.description ?? null })),
    })
  const team = d?.team
  if (team?.members?.length)
    layout.push({
      blockType: 'teamBlock',
      heading: team.heading ?? null,
      description: team.description ?? null,
      members: (team.members as unknown[]).map((m) => relId(m as RelInput)).filter(Boolean),
    })
  const opp = d?.opportunities
  if (truthy(opp?.heading))
    layout.push({ blockType: 'jobsBlock', heading: opp.heading ?? null, description: opp.description ?? null })
  return layout
}

// Stubs — follow the mapHome pattern (read each global's sections, push blocks).
const notImplemented = (): Block[] => []

const MAPPERS: { globalSlug: string; pageSlug: string; title: string; map: (d: GlobalData) => Block[] }[] = [
  { globalSlug: 'homePage', pageSlug: 'home', title: 'Home', map: mapHome },
  { globalSlug: 'aboutPage', pageSlug: 'about', title: 'About', map: notImplemented },
  { globalSlug: 'solutionsPage', pageSlug: 'solutions', title: 'Solutions', map: notImplemented },
  { globalSlug: 'industriesPage', pageSlug: 'industries', title: 'Industries', map: notImplemented },
  { globalSlug: 'scalesPage', pageSlug: 'scales', title: 'Scales', map: notImplemented },
  { globalSlug: 'careersPage', pageSlug: 'careers', title: 'Careers', map: notImplemented },
  { globalSlug: 'contactPage', pageSlug: 'contact', title: 'Contact', map: notImplemented },
  { globalSlug: 'storiesPage', pageSlug: 'stories', title: 'Stories', map: notImplemented },
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

for (const { globalSlug, pageSlug, title, map } of MAPPERS) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await payload.findGlobal({ slug: globalSlug as any, depth: 1 })
  const layout = map(data)
  if (!layout.length) {
    payload.logger.warn(`  ${globalSlug} -> ${pageSlug}: no blocks (mapper not implemented or empty) — skipped`)
    continue
  }
  const action = await upsertPage(payload, pageSlug, title, layout)
  payload.logger.info(
    `  ${globalSlug} -> /${pageSlug}: ${action} (${layout.length} blocks: ${layout.map((b) => b.blockType).join(', ')})`,
  )
}

payload.logger.info('Migration complete.')
process.exit(0)
