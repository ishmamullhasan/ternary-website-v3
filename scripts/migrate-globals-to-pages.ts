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

/** Flatten a Lexical richText value to plain text (for string block fields); passes strings through. */
const richToText = (v: unknown): string => {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && 'root' in v) {
    const walk = (n: { text?: string; children?: unknown[] }): string =>
      typeof n.text === 'string'
        ? n.text
        : (n.children ?? []).map((c) => walk(c as { text?: string; children?: unknown[] })).join('')
    return walk((v as { root: { text?: string; children?: unknown[] } }).root)
  }
  return ''
}

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
      steps: proc.process.map((p: GlobalData) => ({ title: p.title ?? null, description: richToText(p.description) })),
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

// ---- block builders (keep the hand-crafted mappers concise) ----------------
const heroB = (s: GlobalData, imageKey?: string): Block => ({
  blockType: 'hero',
  heading: s?.heading ?? s?.title ?? null,
  description: s?.description ?? null,
  ...(imageKey && s?.[imageKey] ? { image: relId(s[imageKey]) } : {}),
})
const contentB = (richText: unknown): Block => ({ blockType: 'content', content: richText ?? null })
const ctaB = (s: GlobalData): Block => ({
  blockType: 'ctaBlock',
  heading: s?.heading ?? null,
  description: s?.description ?? null,
  backgroundImage: s?.backgroundImage ? relId(s.backgroundImage) : null,
  button_1: s?.button_1 ?? null,
  button_2: s?.button_2 ?? null,
})
const featureB = (s: GlobalData, items: GlobalData[], map: (i: GlobalData) => GlobalData, columns = '3'): Block => ({
  blockType: 'featureGrid',
  heading: s?.heading ?? null,
  description: s?.description ?? null,
  columns,
  items: (items ?? []).map(map),
})
const relGridB = (s: GlobalData, field: string, rel: string, columns = '3'): Block => ({
  blockType: 'relationGrid',
  heading: s?.heading ?? null,
  description: s?.description ?? null,
  columns,
  items: polyItems(s?.[field], rel),
})
// {title, excerpt/description, image} -> featureGrid item
const card = (titleKey: string, descKey: string, imageKey?: string) => (i: GlobalData) => ({
  title: i?.[titleKey] ?? null,
  description: richToText(i?.[descKey]),
  ...(imageKey ? { image: relId(i?.[imageKey]) } : {}),
})
const push = (layout: Block[], b: Block | null | false | undefined) => {
  if (b) layout.push(b)
}

function mapAbout(d: GlobalData): Block[] {
  const L: Block[] = []
  push(L, truthy(d?.heroSection?.heading) && heroB(d.heroSection))
  push(L, truthy(d?.fundingStory?.heading) && heroB(d.fundingStory, 'backgroundImage'))
  push(L, truthy(d?.about?.heading) && heroB(d.about))
  push(L, d?.about?.content && contentB(d.about.content))
  for (const k of ['ourThesis', 'whatWeBelieve', 'ourApproach']) {
    const s = d?.[k]
    if (s?.items?.length) push(L, featureB(s, s.items, card('title', 'excerpt', 'image')))
  }
  if (d?.proofOfScale?.items?.length) push(L, featureB(d.proofOfScale, d.proofOfScale.items, card('title', 'value')))
  if (d?.proofOfScale?.company?.items?.length)
    push(L, featureB(d.proofOfScale.company, d.proofOfScale.company.items, card('name', 'excerpt')))
  if (d?.leadership?.members?.length)
    push(L, featureB(d.leadership, d.leadership.members, card('name', 'position', 'image'), '4'))
  push(L, d?.cta && ctaB(d.cta))
  return L
}

function mapSolutions(d: GlobalData): Block[] {
  const L: Block[] = []
  push(L, truthy(d?.hero?.heading) && heroB(d.hero, 'backgroundImage'))
  if (d?.hero?.cards?.length) push(L, featureB({}, d.hero.cards, card('title', 'description')))
  for (const k of ['section_2', 'section_3', 'section_4', 'section_5']) {
    const s = d?.[k]
    if (!s) continue
    push(L, heroB({ heading: s.title, description: s.description }, undefined))
    // who/shape sub-copy preserved as a 2-up feature
    const sub = [
      { title: s.whoTitle, excerpt: s.whoDescription },
      { title: s.shapeTitle, excerpt: s.shapeDescription },
    ].filter((x) => truthy(x.title, x.excerpt))
    if (sub.length) push(L, featureB({}, sub, card('title', 'excerpt'), '2'))
  }
  if (d?.engage?.cards?.length) push(L, featureB(d.engage, d.engage.cards, card('title', 'description')))
  push(L, d?.cta && ctaB(d.cta))
  return L
}

function mapIndustries(d: GlobalData): Block[] {
  const L: Block[] = []
  push(L, truthy(d?.heroSection?.heading) && heroB(d.heroSection))
  if (truthy(d?.industryList?.industry)) push(L, relGridB(d.industryList, 'industry', 'industry', '4'))
  push(L, truthy(d?.details?.heading) && heroB(d.details))
  push(L, d?.details?.content && contentB(d.details.content))
  if (d?.perIndustryPanels?.items?.length)
    push(L, featureB(d.perIndustryPanels, d.perIndustryPanels.items, card('title', 'description', 'image')))
  if (d?.crossIndustryPatterns?.items?.length)
    push(L, featureB(d.crossIndustryPatterns, d.crossIndustryPatterns.items, card('title', 'excerpt', 'image')))
  if (d?.regulatoryPosture?.items?.length)
    push(L, featureB(d.regulatoryPosture, d.regulatoryPosture.items, card('title', 'excerpt')))
  push(L, d?.cta && ctaB(d.cta))
  return L
}

function mapScales(d: GlobalData): Block[] {
  const L: Block[] = []
  push(L, truthy(d?.heroSection?.heading) && heroB(d.heroSection))
  if (d?.heroSection?.items?.length) push(L, featureB({}, d.heroSection.items, card('title', 'title', 'image'), '4'))
  if (d?.qualityBar?.items?.length) push(L, featureB(d.qualityBar, d.qualityBar.items, card('title', 'excerpt')))
  if (truthy(d?.scale)) push(L, relGridB(d, 'scale', 'scale'))
  push(L, d?.cta && ctaB(d.cta))
  return L
}

function mapCareers(d: GlobalData): Block[] {
  const L: Block[] = []
  push(L, truthy(d?.hero?.heading) && heroB(d.hero, 'image'))
  // section_2/3/4 are item_N groups -> feature cards
  for (const k of ['section_2', 'section_3', 'section_4']) {
    const s = d?.[k]
    if (!s) continue
    const items = Object.keys(s)
      .filter((key) => /^item_\d+$/.test(key))
      .map((key) => s[key])
      .filter(Boolean)
    if (items.length) push(L, featureB(s, items, card('heading', 'description', 'image')))
  }
  if (truthy(d?.team?.members))
    push(L, {
      blockType: 'teamBlock',
      heading: d.team.heading ?? null,
      description: d.team.description ?? null,
      members: (Array.isArray(d.team.members) ? d.team.members : []).map((m: GlobalData) => relId(m)).filter(Boolean),
    })
  if (truthy(d?.jobs?.heading, d?.jobs?.description))
    push(L, { blockType: 'jobsBlock', heading: d.jobs.heading ?? null, description: d.jobs.description ?? null })
  return L
}

function mapStories(d: GlobalData): Block[] {
  const L: Block[] = []
  push(L, truthy(d?.heroSection?.heading) && heroB(d.heroSection))
  push(L, truthy(d?.featureCaseStudy?.heading) && heroB(d.featureCaseStudy))
  if (truthy(d?.featureCaseStudy?.story))
    push(L, relGridB({ ...d.featureCaseStudy, heading: null, description: null }, 'story', 'story', '2'))
  if (d?.allStoriesGrid?.items?.length)
    push(L, {
      blockType: 'relationGrid',
      heading: d.allStoriesGrid.heading ?? null,
      description: d.allStoriesGrid.description ?? null,
      columns: '3',
      items: passPolyItems(d.allStoriesGrid.items),
    })
  if (d?.categoryLanding?.categories?.length)
    push(L, featureB(d.categoryLanding, d.categoryLanding.categories, card('title', 'description', 'image')))
  push(L, truthy(d?.subscribe?.heading) && heroB(d.subscribe))
  return L
}

// (contact has no CMS source content; it is scaffolded inline at the end of this script.)

const MAPPERS: { globalSlug: string; pageSlug: string; title: string; map: (d: GlobalData) => Block[] }[] = [
  { globalSlug: 'homePage', pageSlug: 'home', title: 'Home', map: mapHome },
  { globalSlug: 'aboutPage', pageSlug: 'about', title: 'About', map: mapAbout },
  { globalSlug: 'solutionsPage', pageSlug: 'solutions', title: 'Solutions', map: mapSolutions },
  { globalSlug: 'industriesPage', pageSlug: 'industries', title: 'Industries', map: mapIndustries },
  { globalSlug: 'scalesPage', pageSlug: 'scales', title: 'Scales', map: mapScales },
  { globalSlug: 'careersPage', pageSlug: 'careers', title: 'Careers', map: mapCareers },
  { globalSlug: 'storiesPage', pageSlug: 'stories', title: 'Stories', map: mapStories },
  // contact is handled separately below (reads the deprecated `contact` global).
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

// contact: the legacy `contact`/`contactPage` globals are empty, so there is nothing to
// migrate. Scaffold a functional page — a hero + the existing Contact Form — with
// placeholder copy the team can edit in the CMS. Prefer any real values if present.
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conn = (payload.db as any).connection
  const legacy = (await conn.collection('globals').findOne({ globalType: 'contact' })) ?? {}
  const form = await conn.collection('forms').findOne({})
  const layout: Block[] = [
    {
      blockType: 'hero',
      heading: legacy?.hero?.heading || 'Contact',
      description: legacy?.hero?.description || 'Get in touch with the Ternary Solutions team.',
    },
  ]
  if (form)
    layout.push({
      blockType: 'formBlock',
      heading: legacy?.form?.heading || 'Send us a message',
      description: legacy?.form?.description || null,
      form: String(form._id),
    })
  if (truthy(legacy?.cta?.heading)) layout.push(ctaB(legacy.cta))
  const action = await upsertPage(payload, 'contact', 'Contact', layout)
  payload.logger.info(
    `  contact -> /contact: ${action} (${layout.length} blocks; scaffolded — source globals were empty, edit copy in CMS)`,
  )
} catch (e) {
  payload.logger.warn('  contact skipped: ' + (e as Error).message)
}

payload.logger.info('Migration complete.')
process.exit(0)
