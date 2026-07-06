// Demo seed for the redesigned Stories archive (WEB): make the /stories storiesArchive show the
// full Figma layout — 8 case-study tiles, a 4-card press-release row, and a 5-card insights bento.
// Upserts 3 extra insights (INS-003..005) + 1 extra press release (PR-003) so there are 5 insights
// and 4 press releases to fill the bands, then rewires ONLY the storiesArchive block on the already-
// published /stories page (other blocks are preserved verbatim so publish re-validation passes).
//   DATABASE_URI=<uri> pnpm payload run ./scripts/seed-newsroom-demo.ts            # preview (DRY)
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/seed-newsroom-demo.ts # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const ctx = { disableRevalidate: true }

// ---- Lexical richText helpers (same shape as scripts/seed-content.ts) ----
const txt = (text: string) => ({ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
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
type CB = { heading?: string; paras?: string[] }
const toLexical = (blocks: CB[]) => {
  const children: unknown[] = []
  for (const b of blocks || []) {
    if (b.heading) children.push(heading(b.heading))
    for (const p of b.paras || []) children.push(para(p))
  }
  if (!children.length) children.push(para(''))
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr' as const, children } }
}

const payload: Payload = await getPayload({ config })
payload.logger.info(`Newsroom demo seed ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

const findIdBySlug = async (collection: string, slug: string): Promise<string | number | null> => {
  const r = await payload.find({
    collection: collection as any,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return r.docs[0]?.id ?? null
}

const upsertBySlug = async (collection: string, slug: string, data: Record<string, unknown>): Promise<void> => {
  const existing = await findIdBySlug(collection, slug)
  if (DRY) {
    payload.logger.info(`  [dry] ${existing ? 'update' : 'create'} ${collection}/${slug}`)
    return
  }
  await ignoreRevalidate(() =>
    existing
      ? payload.update({ collection: collection as any, id: existing, data, context: ctx })
      : payload.create({ collection: collection as any, data: { slug, ...data }, context: ctx }),
  )
  payload.logger.info(`  ${existing ? 'updated' : 'created'} ${collection}/${slug}`)
}

// ---- 1) Three extra insights so the bento has five --------------------------
const INSIGHTS: Array<Record<string, any>> = [
  {
    slug: 'measuring-delivery-that-lasts',
    title: 'Measuring Delivery That Lasts, Not Just Ships',
    code: 'INS-003',
    publishedDate: '2026-06-18T00:00:00.000Z',
    readTime: '5 min',
    categoryLabel: 'Engineering Studio',
    excerpts:
      'Velocity dashboards reward shipping, not durability. The metrics that actually predict a healthy system look nothing like the ones most teams put on the wall.',
    tags: [{ name: 'Delivery' }, { name: 'Metrics' }],
    contentBlocks: [
      {
        heading: 'Ship rate is a vanity metric',
        paras: [
          'Counting merged pull requests tells you a team is busy. It says nothing about whether the thing you shipped still works under load six months later — which is the only outcome a client actually pays for.',
          'We track change-failure rate, time-to-recovery, and the age of the oldest unaddressed defect, because those numbers move with durability rather than motion.',
        ],
      },
      {
        heading: 'Instrument the boring parts',
        paras: [
          'The signals that predict trouble are unglamorous: retry storms, slow queries creeping past a threshold, a queue that never quite drains. Instrumenting them early is how a problem surfaces as a graph instead of an outage.',
        ],
      },
    ],
  },
  {
    slug: 'when-to-say-no-to-a-feature',
    title: 'When to Say No to a Feature',
    code: 'INS-004',
    publishedDate: '2026-06-25T00:00:00.000Z',
    readTime: '6 min',
    categoryLabel: 'Product Studio',
    excerpts:
      'Every added feature is a permanent liability someone has to run. Saying no is the most under-used tool in a product engineer’s kit — here is a framework for using it well.',
    tags: [{ name: 'Product' }, { name: 'Scope' }],
    contentBlocks: [
      {
        heading: 'Features are liabilities, not assets',
        paras: [
          'A shipped feature is code to maintain, a surface to secure, a path to test, and a concept a new user has to learn. Its cost is paid every day; its value is often paid once. That asymmetry should make the default answer “not yet”.',
        ],
      },
      {
        heading: 'Three questions before you build',
        paras: [
          'Does this move a metric we agreed matters? Can we remove something to make room for it? Will we still want to run it in two years? If the answer to any is no, the feature usually belongs in the backlog, not the sprint.',
        ],
      },
    ],
  },
  {
    slug: 'the-cost-of-a-second-datacenter',
    title: 'The Real Cost of a Second Data Center',
    code: 'INS-005',
    publishedDate: '2026-07-01T00:00:00.000Z',
    readTime: '8 min',
    categoryLabel: 'Platform Studio',
    excerpts:
      'Multi-region sounds like resilience. In practice it doubles your failure modes before it doubles your uptime. A grounded look at when a second region earns its keep — and when it just earns pager duty.',
    tags: [{ name: 'Platform' }, { name: 'Reliability' }, { name: 'Cost' }],
    contentBlocks: [
      {
        heading: 'Redundancy is not free resilience',
        paras: [
          'A second region adds replication lag, split-brain risk, cross-region consistency puzzles, and a data-egress bill — all of which are new ways to fail. You buy availability only if you also invest in the operational discipline to run both halves.',
        ],
      },
      {
        heading: 'Earn it with a real requirement',
        paras: [
          'Most workloads reach their availability target with one region done well: good backups, fast restores, and a tested failover runbook. Reach for a second region when a regulator, a latency SLA, or a genuine blast-radius requirement demands it — not because the architecture diagram looks braver.',
        ],
      },
    ],
  },
]

// ---- 2) One extra press release so the row has four -------------------------
const PRESS: Array<Record<string, any>> = [
  {
    slug: 'ternary-opens-global-delivery-hub-dhaka',
    title: 'Ternary Opens a Global Delivery Hub in Dhaka',
    badge: 'Company',
    code: 'PR-004',
    releaseDate: '2026-06-28T00:00:00.000Z',
    datelineLocation: 'Dhaka, Bangladesh',
    excerpts:
      'Ternary expands its Dhaka engineering hub into a full global delivery center, concentrating senior production capacity closer to the systems it runs for clients worldwide.',
    readTime: '5 min',
    categoryLabel: 'Company',
    tags: [{ name: 'Company' }, { name: 'Delivery' }],
    leadParagraph:
      'Ternary today announced the expansion of its Dhaka engineering operation into a full global delivery hub, adding senior capacity across platform, product, and applied-AI practices while keeping production responsibility for client systems close to the people who build them.',
    contentBlocks: [
      {
        heading: 'Capacity where the work happens',
        paras: [
          'The expanded hub concentrates senior engineering in one place while engagement leadership stays close to clients. The move follows sustained demand for production-grade delivery that survives past launch.',
        ],
      },
      {
        heading: 'Why it matters',
        paras: [
          'For clients, the hub means access to senior engineering at scale under one accountable standard — the same ownership and reliability bar regardless of which practice leads a workstream.',
        ],
      },
    ],
    quotes: [
      {
        quote:
          'This isn’t an offshore desk. It’s where our most senior engineers carry systems into production and keep them healthy for years.',
        name: 'Shadman Shakib',
        role: 'Founder · Ternary',
      },
    ],
    releaseFacts: { forImmediateRelease: 'Yes', embargo: 'None', distribution: 'Global' },
  },
]

for (const i of INSIGHTS) {
  const { slug, contentBlocks, ...rest } = i
  await upsertBySlug('insight', slug, { ...rest, content: toLexical(contentBlocks) })
}
for (const p of PRESS) {
  const { slug, contentBlocks, ...rest } = p
  await upsertBySlug('pressRelease', slug, { ...rest, content: toLexical(contentBlocks) })
}

// ---- 3) Rewire ONLY the storiesArchive block on the /stories page -----------
const STORY_SLUGS = [
  'counterfoil-continuum',
  'turfly',
  'alley-analytix',
  'flex5',
  'farogl-odoo-erp',
  'doyouwork',
  'hissho-sushiops360',
  'lankabangla-securities',
]
const INSIGHT_SLUGS = [
  'production-responsibility',
  'air-gapped-ai-for-regulated-industries',
  'measuring-delivery-that-lasts',
  'when-to-say-no-to-a-feature',
  'the-cost-of-a-second-datacenter',
]
const PRESS_SLUGS = [
  'dual-hub-delivery-model',
  'engagement-framework-frame-flow-orchestra',
  'one-year-in-bangladesh',
  'ternary-opens-global-delivery-hub-dhaka',
]

const idsForSlugs = async (collection: string, slugs: string[]): Promise<(string | number)[]> => {
  const out: (string | number)[] = []
  for (const s of slugs) {
    const id = await findIdBySlug(collection, s)
    if (id) out.push(id)
    else payload.logger.warn(`    ! missing ${collection}/${s}`)
  }
  return out
}

const storyIds = await idsForSlugs('story', STORY_SLUGS)
const insightIds = await idsForSlugs('insight', INSIGHT_SLUGS)
const pressIds = await idsForSlugs('pressRelease', PRESS_SLUGS)
const poly = (relationTo: string, id: string | number) => ({ relationTo, value: id })

const page = (
  await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'stories' } },
    limit: 1,
    depth: 0,
    draft: false,
    overrideAccess: true,
  })
).docs[0] as any

if (!page) {
  payload.logger.error('  /stories page not found — nothing wired')
} else {
  const layout = Array.isArray(page.layout) ? page.layout : []
  const items = [...storyIds.map((id) => poly('story', id)), ...insightIds.map((id) => poly('insight', id))]
  const newLayout = layout.map((b: any) =>
    b.blockType === 'storiesArchive' ? { ...b, items, pressRelease: pressIds } : b,
  )
  payload.logger.info(
    `  /stories wiring: items=${items.length} (stories=${storyIds.length}+insights=${insightIds.length}) press=${pressIds.length}`,
  )
  if (!DRY) {
    await ignoreRevalidate(() =>
      payload.update({
        collection: 'pages',
        id: page.id,
        data: { title: page.title || 'Stories', layout: newLayout, _status: 'published' },
        context: ctx,
      }),
    )
    payload.logger.info('  /stories updated')
  }
}

process.exit(0)
