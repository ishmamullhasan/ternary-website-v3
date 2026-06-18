// Phase 3 of the block redesign: decompose each page's monolith block in the `pages` collection
// into the new granular section blocks, in place. Idempotent (skips a page whose source monolith
// block is already gone). Relationships/uploads are read at depth 0 (ids) and written back as ids.
//   MIGRATE_DRY=1 pnpm payload run ./scripts/migrate-blocks-v2.ts   # preview
//   pnpm payload run ./scripts/migrate-blocks-v2.ts                 # write
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.MIGRATE_DRY === '1'
const ctx = { disableRevalidate: true }
const payload: Payload = await getPayload({ config })

const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

const stripIds = (v: any): any => {
  if (Array.isArray(v)) return v.map(stripIds)
  if (v && typeof v === 'object') {
    const o: Record<string, unknown> = {}
    for (const [k, val] of Object.entries(v)) if (k !== 'id') o[k] = stripIds(val)
    return o
  }
  return v
}

type B = Record<string, any>
const arr = (v: any): B[] => (Array.isArray(v) ? v : [])
const cardsMedia = (items: any) => arr(items).map((i) => stripIds({ title: i.title, excerpt: i.excerpt, media: i.image }))

// Resolve team docs by name -> ids (for About leadership, which becomes team refs).
const resolveTeam = async (names: string[]): Promise<(string | number)[]> => {
  const ids: (string | number)[] = []
  for (const name of names) {
    if (!name) continue
    const f = await payload.find({ collection: 'team', where: { name: { equals: name } }, limit: 1, depth: 0 })
    if (f.docs[0]) ids.push(f.docs[0].id)
    else payload.logger.warn(`    team "${name}" not found — leadership ref skipped`)
  }
  return ids
}

const SOURCE: Record<string, string> = {
  scales: 'scalesPageSection',
  contact: 'contactPageSection',
  stories: 'storiesPageSection',
  industries: 'industriesPageSection',
  solutions: 'solutionsPageSection',
  about: 'aboutPageSection',
  careers: 'careersPageSection',
}

const MAPPERS: Record<string, (s: B) => Promise<B[]>> = {
  scales: async (s) => [
    {
      blockType: 'scalesHero',
      heading: s.heroSection?.heading ?? null,
      description: s.heroSection?.description ?? null,
      items: arr(s.heroSection?.items).map((i) => stripIds({ title: i.title, media: i.image })),
    },
    {
      blockType: 'qualityBar',
      heading: s.qualityBar?.heading ?? null,
      description: s.qualityBar?.description ?? null,
      items: arr(s.qualityBar?.items).map(stripIds),
    },
    { blockType: 'scaleShowcase', scales: s.scale ?? [] },
    {
      blockType: 'ctaBlock',
      heading: s.cta?.heading ?? null,
      description: s.cta?.description ?? null,
      backgroundImage: s.cta?.backgroundImage ?? null,
      button_1: stripIds(s.cta?.button_1) ?? null,
      button_2: stripIds(s.cta?.button_2) ?? null,
    },
  ],

  contact: async (s) => [
    {
      blockType: 'contactHero',
      heading: s.hero?.heading ?? null,
      description: s.hero?.description ?? null,
      buttons: [
        { label: s.hero?.button_1?.label, url: s.hero?.button_1?.link, variant: 'primary' },
        { label: s.hero?.button_2?.label, url: s.hero?.button_2?.link, variant: 'secondary' },
      ].filter((b) => b.label || b.url),
    },
    { blockType: 'contactStats', stats: arr(s.stats).map(stripIds) },
    {
      blockType: 'contactRoutes',
      heading: s.routes?.heading ?? null,
      description: s.routes?.description ?? null,
      items: arr(s.routes?.items).map(stripIds),
    },
    {
      blockType: 'contactOffices',
      heading: s.offices?.heading ?? null,
      description: s.offices?.description ?? null,
      items: arr(s.offices?.items).map(stripIds),
    },
    { blockType: 'contactForm', heading: s.form?.heading ?? null, description: s.form?.description ?? null, form: s.form?.form ?? null },
    {
      blockType: 'ctaBlock',
      heading: s.cta?.heading ?? null,
      description: s.cta?.description ?? null,
      backgroundImage: s.cta?.backgroundImage ?? null,
      button_1: stripIds(s.cta?.button_1) ?? null,
      button_2: stripIds(s.cta?.button_2) ?? null,
    },
  ],

  stories: async (s) => [
    { blockType: 'storiesHero', heading: s.heroSection?.heading ?? null, description: s.heroSection?.description ?? null },
    {
      blockType: 'featureCaseStudy',
      heading: s.featureCaseStudy?.heading ?? null,
      description: s.featureCaseStudy?.description ?? null,
      story: s.featureCaseStudy?.story ?? null,
      stats: arr(s.featureCaseStudy?.stats).map(stripIds),
      highlights: arr(s.featureCaseStudy?.highlights).map(stripIds),
      readTime: s.featureCaseStudy?.readTime ?? null,
      categoryLabel: s.featureCaseStudy?.categoryLabel ?? null,
      buttonLabel: s.featureCaseStudy?.buttonLabel ?? null,
    },
    {
      blockType: 'storiesArchive',
      heading: s.allStoriesGrid?.heading ?? null,
      description: s.allStoriesGrid?.description ?? null,
      items: s.allStoriesGrid?.items ?? [],
      pressRelease: s.allStoriesGrid?.pressRelease ?? [],
    },
    {
      blockType: 'categoryLanding',
      heading: s.categoryLanding?.heading ?? null,
      description: s.categoryLanding?.description ?? null,
      categories: arr(s.categoryLanding?.categories).map(stripIds),
    },
    {
      blockType: 'subscribe',
      heading: s.subscribe?.heading ?? null,
      description: s.subscribe?.description ?? null,
      followHint: s.subscribe?.followHint ?? null,
      followOptions: arr(s.subscribe?.followOptions).map(stripIds),
      emailPlaceholder: s.subscribe?.emailPlaceholder ?? null,
      buttonLabel: s.subscribe?.buttonLabel ?? null,
      disclaimer: s.subscribe?.disclaimer ?? null,
      preview: stripIds(s.subscribe?.preview) ?? null,
    },
  ],

  industries: async (s) => [
    { blockType: 'industriesHero', heading: s.heroSection?.heading ?? null, description: s.heroSection?.description ?? null },
    {
      blockType: 'industryList',
      heading: s.industryList?.heading ?? null,
      description: s.industryList?.description ?? null,
      industry: s.industryList?.industry ?? [],
    },
    {
      blockType: 'industriesDetails',
      heading: s.details?.heading ?? null,
      description: s.details?.description ?? null,
      content: s.details?.content ?? null,
    },
    {
      blockType: 'industryPanels',
      heading: s.perIndustryPanels?.heading ?? null,
      description: s.perIndustryPanels?.description ?? null,
      items: arr(s.perIndustryPanels?.items).map(stripIds), // keeps `image` (not renamed)
    },
    {
      blockType: 'crossIndustryPatterns',
      heading: s.crossIndustryPatterns?.heading ?? null,
      description: s.crossIndustryPatterns?.description ?? null,
      items: cardsMedia(s.crossIndustryPatterns?.items), // image -> media
    },
    {
      blockType: 'regulatoryPosture',
      heading: s.regulatoryPosture?.heading ?? null,
      description: s.regulatoryPosture?.description ?? null,
      items: arr(s.regulatoryPosture?.items).map(stripIds),
    },
    {
      blockType: 'ctaBlock',
      heading: s.cta?.heading ?? null,
      description: s.cta?.description ?? null,
      backgroundImage: s.cta?.backgroundImage ?? null,
      button_1: stripIds(s.cta?.button_1) ?? null,
      button_2: stripIds(s.cta?.button_2) ?? null,
    },
  ],

  solutions: async (s) => {
    const detail = (sec: B) => [
      { label: sec?.whoTitle, value: sec?.whoDescription },
      { label: sec?.shapeTitle, value: sec?.shapeDescription },
    ]
    const feature = (sec: B, mainSide: string, widget: string, detailStyle: string, extra: B) => ({
      blockType: 'solutionFeature',
      eyebrow: sec?.badge ?? null,
      heading: sec?.title ?? null,
      description: sec?.description ?? null,
      image: sec?.image ?? null,
      mainSide,
      widget,
      detailStyle,
      detail: detail(sec),
      ...extra,
    })
    return [
      {
        blockType: 'solutionsHero',
        heading: s.hero?.heading ?? null,
        description: s.hero?.description ?? null,
        backgroundImage: s.hero?.backgroundImage ?? null,
        cards: arr(s.hero?.cards).map((c) => stripIds({ title: c.title, excerpt: c.description })),
      },
      feature(s.section_2, 'left', 'trajectory', 'bigPanel', { trajectory: stripIds(s.section_2?.trajectory) ?? null }),
      feature(s.section_3, 'right', 'none', 'largeStacked', {}),
      feature(s.section_4, 'left', 'techStack', 'compactGrid', { techStack: stripIds(s.section_4?.techStack) ?? null }),
      feature(s.section_5, 'right', 'incident', 'compactGrid', { incident: stripIds(s.section_5?.incident) ?? null }),
      {
        blockType: 'solutionsEngage',
        heading: s.engage?.heading ?? null,
        description: s.engage?.description ?? null,
        cards: arr(s.engage?.cards).map(stripIds),
      },
      {
        blockType: 'ctaBlock',
        heading: s.cta?.heading ?? null,
        description: s.cta?.description ?? null,
        backgroundImage: s.cta?.backgroundImage ?? null,
        button_1: stripIds(s.cta?.button_1) ?? null,
        button_2: stripIds(s.cta?.button_2) ?? null,
      },
    ]
  },

  about: async (s) => {
    const leaderNames = arr(s.leadership?.members).map((m) => m.name as string)
    const members = await resolveTeam(leaderNames)
    return [
      { blockType: 'aboutHero', heading: s.heroSection?.heading ?? null, description: s.heroSection?.description ?? null },
      {
        blockType: 'aboutFundingStory',
        heading: s.fundingStory?.heading ?? null,
        description: s.fundingStory?.description ?? null,
        backgroundImage: s.fundingStory?.backgroundImage ?? null,
      },
      { blockType: 'aboutIntro', heading: s.about?.heading ?? null, description: s.about?.description ?? null, content: s.about?.content ?? null },
      { blockType: 'aboutThesis', heading: s.ourThesis?.heading ?? null, description: s.ourThesis?.description ?? null, items: cardsMedia(s.ourThesis?.items) },
      { blockType: 'aboutBeliefs', heading: s.whatWeBelieve?.heading ?? null, description: s.whatWeBelieve?.description ?? null, items: cardsMedia(s.whatWeBelieve?.items) },
      { blockType: 'aboutApproach', heading: s.ourApproach?.heading ?? null, description: s.ourApproach?.description ?? null, items: cardsMedia(s.ourApproach?.items) },
      {
        blockType: 'aboutProofOfScale',
        heading: s.proofOfScale?.heading ?? null,
        description: s.proofOfScale?.description ?? null,
        stats: arr(s.proofOfScale?.items).map((i) => stripIds({ value: i.value, label: i.title })),
        company: stripIds(s.proofOfScale?.company) ?? null,
      },
      { blockType: 'aboutLeadership', heading: s.leadership?.heading ?? null, description: s.leadership?.description ?? null, members },
      {
        blockType: 'ctaBlock',
        heading: s.cta?.heading ?? null,
        description: s.cta?.description ?? null,
        backgroundImage: s.cta?.backgroundImage ?? null,
        button_1: stripIds(s.cta?.button_1) ?? null,
        button_2: stripIds(s.cta?.button_2) ?? null,
      },
    ]
  },

  careers: async (s) => {
    const grid = (sec: B, n: number) => {
      const items: B[] = []
      for (let k = 1; k <= n; k++) {
        const it = sec?.[`item_${k}`]
        if (it) items.push(stripIds({ title: it.heading, excerpt: it.description, media: it.image }))
      }
      return items
    }
    return [
      {
        blockType: 'careersHero',
        heading: s.hero?.heading ?? null,
        description: s.hero?.description ?? null,
        image: s.hero?.image ?? null,
        buttons: s.hero?.button?.label || s.hero?.button?.url ? [{ label: s.hero?.button?.label, url: s.hero?.button?.url, variant: 'primary' }] : [],
      },
      { blockType: 'careersGridOne', heading: s.section_2?.heading ?? null, description: s.section_2?.description ?? null, items: grid(s.section_2, 6) },
      { blockType: 'careersGridTwo', heading: s.section_3?.heading ?? null, description: s.section_3?.description ?? null, items: grid(s.section_3, 4) },
      {
        blockType: 'careersGrowth',
        heading: s.section_4?.heading ?? null,
        description: s.section_4?.description ?? null,
        featured: stripIds({ title: s.section_4?.item_1?.heading, excerpt: s.section_4?.item_1?.description, levels: arr(s.section_4?.item_1?.levels) }),
        items: [2, 3, 4, 5].map((k) => stripIds({ title: s.section_4?.[`item_${k}`]?.heading, excerpt: s.section_4?.[`item_${k}`]?.description, media: s.section_4?.[`item_${k}`]?.image })),
      },
      { blockType: 'careersTeam', heading: s.team?.heading ?? null, description: s.team?.description ?? null, members: s.team?.members ?? [] },
      { blockType: 'jobsBlock', heading: s.jobs?.heading ?? null, description: s.jobs?.description ?? null },
    ]
  },
}

const ONLY = process.env.MIGRATE_ONLY // optional comma list of page slugs to limit
const slugs = ONLY ? ONLY.split(',').map((x) => x.trim()) : Object.keys(MAPPERS)

payload.logger.info(`migrate-blocks-v2 ${DRY ? '(DRY RUN)' : '(WRITING)'} — pages: ${slugs.join(', ')}`)
for (const slug of slugs) {
  const mapper = MAPPERS[slug]
  if (!mapper) {
    payload.logger.warn(`  ${slug}: no mapper — skipped`)
    continue
  }
  const found = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  const page = found.docs[0]
  if (!page) {
    payload.logger.warn(`  ${slug}: page not found — skipped`)
    continue
  }
  const layout = Array.isArray((page as any).layout) ? ((page as any).layout as B[]) : []
  const src = layout.find((b) => b.blockType === SOURCE[slug])
  if (!src) {
    payload.logger.info(`  ${slug}: no ${SOURCE[slug]} block (already migrated?) — skipped`)
    continue
  }
  const newLayout = await mapper(src)
  payload.logger.info(`  ${slug}: ${SOURCE[slug]} -> [${newLayout.map((b) => b.blockType).join(', ')}]`)
  if (!DRY) {
    await ignoreRevalidate(() =>
      payload.update({ collection: 'pages', id: page.id, data: { layout: newLayout } as any, context: ctx }),
    )
  }
}
payload.logger.info('migrate-blocks-v2 complete.')
process.exit(0)
