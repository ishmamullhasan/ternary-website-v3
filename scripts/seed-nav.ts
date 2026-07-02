// Fill the Header + Footer globals with REAL navigation built from live docs — zero 404s.
//
// Every link below was verified against the running app: only routes that return 200 are used.
// Notably there is NO /capabilities, /models, /press, /insights, or /legals landing route, and no
// /scales/<slug> or /models/<slug> detail route — so capabilities live in a header dropdown +
// footer relationship column, models are represented by the "Engagement Model" link to /solutions
// (where Frame/Flow/Orchestra render), and legal docs link to their /legals/<slug> pages.
//
// Globals have no drafts, so we write BOTH locales in one shot with locale:'all' (localized fields
// given as { en, bn }); relationship fields take plain ids. menu_1 (logo/tagline/copyright) is left
// untouched. Idempotent: re-running just overwrites the same fields.
//   SEED_DRY=1 pnpm payload run ./scripts/seed-nav.ts   # preview
//   pnpm payload run ./scripts/seed-nav.ts              # write
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY === '1'
const payload: Payload = await getPayload({ config })

const tryWrite = async (fn: () => Promise<unknown>, tag: string) => {
  try {
    await fn()
    payload.logger.info(`  ${tag}: OK`)
  } catch (e: any) {
    const m = String(e?.message ?? e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) {
      payload.logger.info(`  ${tag}: committed (revalidate swallowed)`)
      return
    }
    throw e
  }
}

// Resolve ids (and localized titles) by slug, preserving the given order. Missing slugs are dropped
// with a warning so a renamed doc never injects a broken link.
async function resolve(collection: string, slugs: string[]) {
  const out: { id: string; slug: string; en: string; bn: string }[] = []
  for (const slug of slugs) {
    const en = (await payload.find({
      collection: collection as never,
      where: { slug: { equals: slug } } as never,
      locale: 'en' as never,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })) as any
    const doc = en.docs?.[0]
    if (!doc) {
      payload.logger.warn(`  !! ${collection}/${slug} not found — skipped`)
      continue
    }
    const bnRes = (await payload.find({
      collection: collection as never,
      where: { slug: { equals: slug } } as never,
      locale: 'bn' as never,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })) as any
    out.push({
      id: String(doc.id),
      slug,
      en: doc.title ?? slug,
      bn: bnRes.docs?.[0]?.title ?? doc.title ?? slug,
    })
  }
  return out
}

// Order chosen for prominence; excludes the `test` industry.
const capabilities = await resolve('capability', [
  'artificial-intelligence',
  'data-analytics',
  'cloud-transformation',
  'platformization',
  'digital-experiences',
  'internet-of-things',
])
const solutions = await resolve('solution', [
  'enterprise-transformation',
  'product-development',
  'engineering-augmentation',
  'managed-systems',
])
const industries = await resolve('industry', [
  'financial-services-insurance',
  'banking-capital-markets',
  'healthcare',
  'public-sector',
  'software-platforms',
  'technology-platforms',
  'advanced-manufacturing',
  'consumer-goods',
  'hospitality-travel',
  'sports-entertainment',
])

payload.logger.info(
  `resolved: ${capabilities.length} capabilities, ${solutions.length} solutions, ${industries.length} industries`,
)

const t = (en: string, bn: string) => ({ en, bn })

// ---- HEADER (lean): Capabilities dropdown + hub links + Contact CTA -------------------------
const headerData = {
  menu: [
    {
      label: t('Capabilities', 'ক্যাপাবিলিটিজ'),
      link: '', // no /capabilities hub route — hover reveals the dropdown; click falls back home
      subItems: capabilities.map((c) => ({ label: t(c.en, c.bn), link: `/capabilities/${c.slug}` })),
    },
    { label: t('Solutions', 'সলিউশন'), link: '/solutions' },
    { label: t('Industries', 'ইন্ডাস্ট্রিজ'), link: '/industries' },
    { label: t('Scales', 'স্কেল'), link: '/scales' },
    { label: t('Stories', 'স্টোরিজ'), link: '/stories' },
  ],
  button: { label: t('Contact us', 'যোগাযোগ করুন'), link: '/contact' },
}

// ---- FOOTER (rich): relationship columns + Company + Resources + legal bottom bar ------------
const footerData = {
  capabilities: capabilities.map((c) => c.id),
  solutions: solutions.map((s) => s.id),
  industries: industries.map((i) => i.id),
  menu_4: {
    menu: [
      { label: t('About', 'আমাদের সম্পর্কে'), link: '/about' },
      { label: t('Careers', 'ক্যারিয়ার'), link: '/careers' },
      { label: t('Contact', 'যোগাযোগ'), link: '/contact' },
      { label: t('Our Team', 'আমাদের টিম'), link: '/team' },
    ],
  },
  resources: {
    menu: [
      { label: t('Stories', 'স্টোরিজ'), link: '/stories' },
      { label: t('Newsroom', 'নিউজরুম'), link: '/press-release/one-year-in-bangladesh' },
      { label: t('Scales', 'স্কেল'), link: '/scales' },
      { label: t('Engagement Model', 'এনগেজমেন্ট মডেল'), link: '/solutions' },
      { label: t('Search', 'সার্চ'), link: '/search' },
    ],
  },
  legalLinks: [
    { label: t('Terms of Service', 'সেবার শর্তাবলি'), link: '/legals/terms-of-service' },
    { label: t('Privacy Policy', 'গোপনীয়তা নীতি'), link: '/legals/privacy-and-policy' },
    { label: t('Modern Slavery Statement', 'আধুনিক দাসত্ব বিবৃতি'), link: '/legals/modern-slavery-statement' },
  ],
}

if (DRY) {
  payload.logger.info('DRY RUN — header:\n' + JSON.stringify(headerData, null, 2))
  payload.logger.info('DRY RUN — footer:\n' + JSON.stringify(footerData, null, 2))
  process.exit(0)
}

await tryWrite(
  () => payload.updateGlobal({ slug: 'header' as never, locale: 'all' as never, data: headerData as never }),
  'header',
)

// locale:'all' mis-applies the nested `button` GROUP's localized label (only the last locale sticks),
// so normalize the CTA per-locale — a per-locale localized field takes a plain string.
for (const [locale, label] of [
  ['en', 'Contact us'],
  ['bn', 'যোগাযোগ করুন'],
] as const) {
  await tryWrite(
    () =>
      payload.updateGlobal({
        slug: 'header' as never,
        locale: locale as never,
        data: { button: { label, link: '/contact' } } as never,
      }),
    `header.button[${locale}]`,
  )
}
await tryWrite(
  () => payload.updateGlobal({ slug: 'footer' as never, locale: 'all' as never, data: footerData as never }),
  'footer',
)

// Verify: read back en, resolve the relationship link targets.
const h = (await payload.findGlobal({ slug: 'header' as never, locale: 'en' as never, depth: 0 })) as any
payload.logger.info(`verify header: ${h.menu?.length} items, button="${h.button?.label}"`)
const f = (await payload.findGlobal({ slug: 'footer' as never, locale: 'en' as never, depth: 1 })) as any
payload.logger.info(
  `verify footer: caps=${f.capabilities?.length} sols=${f.solutions?.length} inds=${f.industries?.length} company=${f.menu_4?.menu?.length} resources=${f.resources?.menu?.length} legal=${f.legalLinks?.length}`,
)

process.exit(0)
