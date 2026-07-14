// Seed the /capabilities listing page — a `pages` doc rendered by the [...slug] catch-all:
//
//   storiesHero        centered heading + description
//   capabilitiesSection the 8 capability cards, copied from the home page doc so the two stay in
//                      sync visually. WITHOUT the intro media slides: on the home page that
//                      carousel is a teaser for this landing, and on the landing itself it was
//                      just decoration under the thing it was teasing. `slides: []` is all it
//                      takes — the component drops the carousel when there is nothing in it.
//   capabilityLedger   the depth this page was missing: an index of the same eight disciplines,
//                      each row opening its excerpt, practice items, headline metric and figure.
//                      Reads them off the capability docs; only the header is authored here.
//   ctaBlock           a way out of the page.
//
// Locale handling (see the seeding traps we've hit before):
//   - NEVER write with locale:'all' + draft:false — that strips the other locale.
//   - Write `en` first, read the minted block/row ids back, then write `bn` reusing THOSE ids so
//     localized subfields inside arrays don't get dropped onto new rows.
//   - A per-locale publish drops the required localized `title` unless it's passed explicitly.
//
//   pnpm payload run ./scripts/seed-capabilities-page.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const LOCALES = ['en', 'bn'] as const
const HOME_SLUG = 'home'
const PAGE_SLUG = 'capabilities'

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
    title: 'Capabilities',
    heroHeading: 'The disciplines behind every system we ship',
    heroDescription:
      'Eight standing practices — from agentic architecture and applied AI to cloud, data, platforms, and the Internet of Things. Each one carries its own stack, delivery record, and practice lead.',
    ledgerHeading: 'Inside the practice',
    ledgerDescription:
      'A capability is only as real as the way it is run. Open a discipline to see what it means to us, how we do it, and what it has shifted on a live system.',
    practiceLabel: 'How we do it',
    linkLabel: 'Explore',
    ctaHeading: 'Not sure which discipline the problem belongs to?',
    ctaDescription:
      'Most of what we ship crosses two or three of them. Describe the outcome you need and we will map the practice mix — and who would lead it.',
    ctaPrimary: 'Talk to an engineer',
    ctaSecondary: 'See the work',
  },
  bn: {
    title: 'সক্ষমতা',
    heroHeading: 'আমাদের প্রতিটি সিস্টেমের পেছনে যে দক্ষতাগুলো',
    heroDescription:
      'এজেন্টিক আর্কিটেকচার ও ফলিত কৃত্রিম বুদ্ধিমত্তা থেকে শুরু করে ক্লাউড, ডেটা, প্ল্যাটফর্ম ও ইন্টারনেট অব থিংস — আটটি স্থায়ী প্র্যাকটিস। প্রতিটির নিজস্ব স্ট্যাক, ডেলিভারি রেকর্ড ও প্র্যাকটিস লিড রয়েছে।',
    ledgerHeading: 'প্র্যাকটিসের ভেতরে',
    ledgerDescription:
      'একটি সক্ষমতা ততটাই বাস্তব, যতটা বাস্তব তার চর্চার ধরন। যেকোনো একটি দক্ষতা খুলে দেখুন — সেটি আমাদের কাছে কী অর্থ বহন করে, আমরা তা কীভাবে করি, এবং সচল সিস্টেমে তা কী বদলে দিয়েছে।',
    practiceLabel: 'আমরা যেভাবে কাজ করি',
    linkLabel: 'বিস্তারিত',
    ctaHeading: 'সমস্যাটি কোন দক্ষতার আওতায় পড়ে, নিশ্চিত নন?',
    ctaDescription:
      'আমাদের বেশিরভাগ কাজই দুই-তিনটি দক্ষতার সীমানা পেরোয়। আপনি কী ফলাফল চান তা বলুন — আমরা প্র্যাকটিসের সমন্বয় ও তার নেতৃত্ব কে দেবেন, দুটোই ঠিক করে দেব।',
    ctaPrimary: 'প্রকৌশলীর সঙ্গে কথা বলুন',
    ctaSecondary: 'আমাদের কাজ দেখুন',
  },
} as const

// Both routes are in the verified nav map (/contact and /stories are real pages).
const CTA_LINKS = { primary: '/contact', secondary: '/stories' } as const

const payload = await getPayload({ config })

// The Pages afterChange hook calls revalidateTag(), which throws outside a Next request context.
// The DB write has already committed by then, so swallow that one error and nothing else. (Left
// unswallowed it also aborts the nested-docs breadcrumb resave that runs after create.)
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

// 1) Pull the capabilitiesSection block off the home page, per locale, so the new page's section is
//    identical to the homepage's (heading, description, capability order, intro slide).
const homeSection: Record<string, any> = {}
for (const locale of LOCALES) {
  const home = await findPage(HOME_SLUG, locale)
  const block = (home?.layout ?? []).find((b: any) => b.blockType === 'capabilitiesSection')
  if (!block) throw new Error(`home page has no capabilitiesSection block in locale ${locale}`)
  homeSection[locale] = block
}
console.log(
  `home capabilitiesSection: ${homeSection.en.capability?.length ?? 0} capabilities, ${homeSection.en.slides?.length ?? 0} slide(s)`,
)

// 2) Create (or reuse) the page in `en`. Block ids are stripped so Payload mints fresh ones —
//    reusing the home page's block ids across two docs would be asking for trouble.
// The capability ids the grid is built from — the ledger indexes exactly the same eight, in the
// same order, so the two halves of the page can never disagree about what the practices are.
const capabilityIds: string[] = (homeSection.en.capability ?? []).map((c: any) => (typeof c === 'object' ? c.id : c))

const layoutEn = [
  {
    blockType: 'storiesHero',
    heading: COPY.en.heroHeading,
    description: para(COPY.en.heroDescription),
  },
  // `slides: []` — the intro carousel belongs on the home page, where it teases this one.
  { ...homeSection.en, id: undefined, slides: [] },
  {
    blockType: 'capabilityLedger',
    heading: COPY.en.ledgerHeading,
    description: para(COPY.en.ledgerDescription),
    capabilities: capabilityIds,
    practiceLabel: COPY.en.practiceLabel,
    linkLabel: COPY.en.linkLabel,
  },
  {
    blockType: 'ctaBlock',
    heading: COPY.en.ctaHeading,
    description: para(COPY.en.ctaDescription),
    button_1: { label: COPY.en.ctaPrimary, link: CTA_LINKS.primary },
    button_2: { label: COPY.en.ctaSecondary, link: CTA_LINKS.secondary },
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
  // The revalidate throw can abort create() *after* the commit, leaving us without the returned
  // doc — re-read by slug in that case.
  pageId = createdId || String((await findPage(PAGE_SLUG, 'en'))?.id ?? '')
  if (!pageId) throw new Error(`created page '${PAGE_SLUG}' but could not resolve its id`)
  console.log(`created page '${PAGE_SLUG}' (id=${pageId})`)
}

// 3) Read the minted ids back, then write `bn` onto the SAME block/row ids.
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
  if (block.blockType === 'capabilitiesSection') {
    // bn heading/description from the home page's bn block; keep the en block's id so the localized
    // subfields land on the existing block rather than a new one. No `slides` on this page.
    return { ...block, heading: homeSection.bn.heading, description: homeSection.bn.description, slides: [] }
  }
  if (block.blockType === 'capabilityLedger') {
    return {
      ...block,
      heading: COPY.bn.ledgerHeading,
      description: para(COPY.bn.ledgerDescription),
      practiceLabel: COPY.bn.practiceLabel,
      linkLabel: COPY.bn.linkLabel,
    }
  }
  if (block.blockType === 'ctaBlock') {
    return {
      ...block,
      heading: COPY.bn.ctaHeading,
      description: para(COPY.bn.ctaDescription),
      // Buttons are groups, not arrays — no row ids to preserve, but the link is unlocalized and
      // must be repeated or the per-locale write drops it.
      button_1: { label: COPY.bn.ctaPrimary, link: CTA_LINKS.primary },
      button_2: { label: COPY.bn.ctaSecondary, link: CTA_LINKS.secondary },
    }
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
  const section = byType('capabilitiesSection')
  const ledger = byType('capabilityLedger')
  const cta = byType('ctaBlock')
  const caps = (section?.capability ?? []).map((c: any) => (typeof c === 'object' ? c.slug : `UNRESOLVED:${c}`))
  const ledgerCaps = (ledger?.capabilities ?? []).map((c: any) => (typeof c === 'object' ? c.slug : `UNRESOLVED:${c}`))
  console.log(
    `verify[${locale}] status=${doc?._status} title=${doc?.title}` +
      `\n  blocks: ${(doc?.layout ?? []).map((b: any) => b.blockType).join(' → ')}` +
      `\n  hero: ${hero?.heading}` +
      `\n  section: ${section?.heading} -> ${caps.join(', ')} | slides=${(section?.slides ?? []).length}` +
      `\n  ledger: ${ledger?.heading} [${ledger?.practiceLabel} / ${ledger?.linkLabel}] -> ${ledgerCaps.join(', ')}` +
      `\n  cta: ${cta?.heading} [${cta?.button_1?.label} → ${cta?.button_1?.link}] [${cta?.button_2?.label} → ${cta?.button_2?.link}]`,
  )
}

process.exit(0)
