// Seed the /insights listing page — a `pages` doc rendered by the [...slug] catch-all:
//
//   storiesHero    centered page title + intro (the page's single <h1>)
//   insightsList   the signature insights bento grid, referencing every published insight doc.
//                  Same card path as the stories archive's insights band, minus the filter bar.
//
// Locale handling (see the seeding traps we've hit before):
//   - NEVER write with locale:'all' + draft:false — that strips the other locale.
//   - Write `en` first, read the minted block ids back, then write `bn` reusing THOSE ids so
//     localized subfields land on the existing blocks rather than new ones.
//   - A per-locale publish drops the required localized `title` unless it's passed explicitly.
//   - The `items` relationship is unlocalized: spreading the read-back `en` block into the `bn`
//     write carries the ids over, so we don't drop them.
//
//   pnpm payload run ./scripts/seed-insights-page.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const LOCALES = ['en', 'bn'] as const
const PAGE_SLUG = 'insights'

// Lexical richText with a single paragraph — the shape every other seeded description uses.
const para = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr',
        children: [{ type: 'text', version: 1, text, format: 0, style: '', detail: 0 }],
      },
    ],
  },
})

const COPY = {
  en: {
    title: 'Insights',
    heroHeading: 'Insights from the people who ship the systems',
    heroDescription:
      'Field notes, engineering deep-dives and points of view from our practice leads — written on the way out of a live delivery, not from the sidelines.',
    listHeading: 'Latest insights',
    listDescription: 'The newest thinking across our disciplines. Open a piece to read it in full.',
  },
  bn: {
    title: 'অন্তর্দৃষ্টি',
    heroHeading: 'যাঁরা সিস্টেম তৈরি করেন, তাঁদের অন্তর্দৃষ্টি',
    heroDescription:
      'আমাদের প্র্যাকটিস লিডদের মাঠপর্যায়ের নোট, প্রকৌশলগত গভীর বিশ্লেষণ ও দৃষ্টিভঙ্গি — সচল ডেলিভারির ভেতর থেকে লেখা, বাইরে থেকে নয়।',
    listHeading: 'সাম্প্রতিক অন্তর্দৃষ্টি',
    listDescription: 'আমাদের সব শাখার নতুন ভাবনা। পুরোটা পড়তে যেকোনো একটি লেখা খুলুন।',
  },
} as const

const payload = await getPayload({ config })

// The Pages afterChange hook calls revalidateTag(), which throws outside a Next request context.
// The DB write has already committed by then, so swallow that one error and nothing else.
const ignoreRevalidate = async (fn: () => Promise<unknown>, tag: string) => {
  try {
    await fn()
    console.log(`  ${tag}: OK`)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (message.includes('revalidateTag') || message.includes('static generation store')) {
      console.log(`  ${tag}: OK (post-commit revalidate throw swallowed)`)
      return
    }
    throw e
  }
}

const findPage = async (slug: string, locale: (typeof LOCALES)[number]) => {
  const res = (await payload.find({
    collection: 'pages' as never,
    where: { slug: { equals: slug } } as never,
    locale: locale as never,
    draft: true,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })) as any
  return res.docs?.[0]
}

// 1) Pull the published insight ids (newest first) to fill the grid. The block renders them in the
//    given order; every fifth card widens to a two-column accent.
const insightsRes = (await payload.find({
  collection: 'insight' as never,
  locale: 'en' as never,
  draft: false,
  depth: 0,
  limit: 100,
  sort: '-publishedDate',
  overrideAccess: true,
})) as any
const insightIds: string[] = (insightsRes.docs ?? []).map((d: any) => String(d.id))
console.log(`found ${insightIds.length} published insight(s)`)
if (insightIds.length === 0) {
  console.warn('WARNING: no insights found — the grid will render its empty state.')
}

// 2) Create (or reuse) the page in `en`. Block ids are omitted so Payload mints fresh ones.
const layoutEn = [
  {
    blockType: 'hero',
    heading: COPY.en.heroHeading,
    description: para(COPY.en.heroDescription),
  },
  {
    blockType: 'insightsList',
    heading: COPY.en.listHeading,
    description: para(COPY.en.listDescription),
    items: insightIds,
  },
]

const existing = await findPage(PAGE_SLUG, 'en')
let pageId: string

if (existing) {
  console.log(`page '${PAGE_SLUG}' exists (id=${existing.id}) — updating in place`)
  pageId = String(existing.id)
  await ignoreRevalidate(
    () =>
      payload.update({
        collection: 'pages' as never,
        id: pageId,
        locale: 'en' as never,
        draft: false,
        overrideAccess: true,
        data: { title: COPY.en.title, layout: layoutEn, _status: 'published' } as never,
      }),
    'page[en]',
  )
} else {
  let createdId = ''
  await ignoreRevalidate(
    () =>
      payload
        .create({
          collection: 'pages' as never,
          locale: 'en' as never,
          draft: false,
          overrideAccess: true,
          data: { title: COPY.en.title, slug: PAGE_SLUG, layout: layoutEn, _status: 'published' } as never,
        })
        .then((doc: any) => {
          createdId = String(doc.id)
        }),
    'page[en] create',
  )
  // The revalidate throw can abort create() after the commit — re-read by slug in that case.
  pageId = createdId || String((await findPage(PAGE_SLUG, 'en'))?.id ?? '')
  if (!pageId) throw new Error(`created page '${PAGE_SLUG}' but could not resolve its id`)
  console.log(`created page '${PAGE_SLUG}' (id=${pageId})`)
}

// 3) Read the minted ids back, then write `bn` onto the SAME block ids. Spreading each block carries
//    the unlocalized `items` relationship over so the per-locale write can't drop it.
const enDoc = (await payload.findByID({
  collection: 'pages' as never,
  id: pageId,
  locale: 'en' as never,
  draft: true,
  depth: 0,
  overrideAccess: true,
})) as any

const layoutBn = (enDoc.layout ?? []).map((block: any) => {
  if (block.blockType === 'storiesHero') {
    return { ...block, heading: COPY.bn.heroHeading, description: para(COPY.bn.heroDescription) }
  }
  if (block.blockType === 'insightsList') {
    return { ...block, heading: COPY.bn.listHeading, description: para(COPY.bn.listDescription) }
  }
  return block
})

await ignoreRevalidate(
  () =>
    payload.update({
      collection: 'pages' as never,
      id: pageId,
      locale: 'bn' as never,
      draft: false,
      overrideAccess: true,
      // `title` is localized + required: a per-locale publish drops it unless passed explicitly.
      data: { title: COPY.bn.title, layout: layoutBn, _status: 'published' } as never,
    }),
  'page[bn]',
)

// 4) Verify from published reads, per locale, with the fallback off so a missing bn can't hide
//    behind the en string.
for (const locale of LOCALES) {
  const res = (await payload.find({
    collection: 'pages' as never,
    where: { slug: { equals: PAGE_SLUG } } as never,
    locale: locale as never,
    fallbackLocale: false as never,
    draft: false,
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })) as any
  const doc = res.docs?.[0]
  const byType = (type: string) => (doc?.layout ?? []).find((b: any) => b.blockType === type)
  const hero = byType('storiesHero')
  const list = byType('insightsList')
  console.log(
    `verify[${locale}] status=${doc?._status} title=${doc?.title}` +
      `\n  blocks: ${(doc?.layout ?? []).map((b: any) => b.blockType).join(' → ')}` +
      `\n  hero: ${hero?.heading}` +
      `\n  list: ${list?.heading} -> ${(list?.items ?? []).length} insight(s)`,
  )
}

process.exit(0)
