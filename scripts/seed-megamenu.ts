// Fill the Header global with a rich, fully-dynamic MEGA MENU built from live docs — zero 404s.
//
// The header is now a full-screen mega menu (see src/components/nav/MegaMenuOverlay.tsx). Every
// top-level item is either a plain link or opens a panel with a featured card + icon columns +
// resource pills. This script seeds that structure from the real capability/solution/industry docs
// (titles + excerpts already bilingual in the DB), assigning lucide icons per slug.
//
// Localization: instead of `locale: 'all'` (which mis-applies nested GROUP localized fields — the
// panel eyebrow/heading/featured.* would keep only the last locale), we write PER-LOCALE and reuse
// the array row ids Payload generated on the `en` pass, so `bn` updates the same rows and both
// locales survive. Do NOT invent row ids (non-ObjectId strings crash Payload — see the
// bson-row-id-corruption note); always reuse the ids read back from `en`.
//
//   SEED_DRY=1 pnpm payload run ./scripts/seed-megamenu.ts   # preview en payload
//   pnpm payload run ./scripts/seed-megamenu.ts              # write both locales
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

type Locale = 'en' | 'bn'
type L = { en: string; bn: string }
const t = (en: string, bn: string): L => ({ en, bn })
const pick = (v: L | undefined, locale: Locale) => (v ? v[locale] : undefined)

// Trim a marketing excerpt down to a compact menu description.
const short = (s: string | undefined | null, max = 68) => {
  if (!s) return ''
  const clean = s.replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean
}

type Doc = { id: string; slug: string; title: L; excerpt: L }

// Resolve docs by slug → id + localized title + localized excerpt, preserving order. Missing slugs
// are dropped with a warning so a renamed/removed doc never injects a broken link.
async function resolve(collection: string, slugs: string[]): Promise<Doc[]> {
  const out: Doc[] = []
  for (const slug of slugs) {
    const find = (locale: Locale) =>
      payload.find({
        collection: collection as never,
        where: { slug: { equals: slug } } as never,
        locale: locale as never,
        depth: 0,
        limit: 1,
        overrideAccess: true,
      }) as Promise<any>
    const en = (await find('en')).docs?.[0]
    if (!en) {
      payload.logger.warn(`  !! ${collection}/${slug} not found — skipped`)
      continue
    }
    const bn = (await find('bn')).docs?.[0]
    out.push({
      id: String(en.id),
      slug,
      title: t(en.title ?? slug, bn?.title ?? en.title ?? slug),
      excerpt: t(en.excerpts ?? '', bn?.excerpts ?? en.excerpts ?? ''),
    })
  }
  return out
}

const ICON: Record<string, string> = {
  'artificial-intelligence': 'brain',
  'data-analytics': 'database',
  'cloud-transformation': 'cloud',
  platformization: 'layers',
  'digital-experiences': 'sparkles',
  'internet-of-things': 'cpu',
  'enterprise-transformation': 'building',
  'product-development': 'boxes',
  'engineering-augmentation': 'workflow',
  'managed-systems': 'server',
  'financial-services-insurance': 'landmark',
  'banking-capital-markets': 'line-chart',
  healthcare: 'heart-pulse',
  'public-sector': 'shield-check',
  'software-platforms': 'code',
  'technology-platforms': 'cpu',
  'advanced-manufacturing': 'factory',
  'consumer-goods': 'shopping-bag',
  'hospitality-travel': 'plane',
  'sports-entertainment': 'trophy',
}

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

const byslug = (docs: Doc[]) => Object.fromEntries(docs.map((d) => [d.slug, d]))
const caps = byslug(capabilities)
const sols = byslug(solutions)
const inds = byslug(industries)

// Build one item {icon,label,description,link} from a resolved doc, resolved for `locale`.
const item = (map: Record<string, Doc>, slug: string, base: string, locale: Locale) => {
  const d = map[slug]
  if (!d) return null
  return {
    icon: ICON[slug],
    label: pick(d.title, locale),
    description: short(pick(d.excerpt, locale)),
    link: `${base}/${slug}`,
  }
}

const column = (heading: L, map: Record<string, Doc>, base: string, slugs: string[], locale: Locale) => ({
  heading: pick(heading, locale),
  items: slugs.map((s) => item(map, s, base, locale)).filter(Boolean),
})

// ---- Build the whole header payload for one locale ----------------------------------------------
function build(locale: Locale) {
  const menu = [
    // 1) Capabilities — mega (no /capabilities hub route, so no view-all)
    {
      label: pick(t('Capabilities', 'ক্যাপাবিলিটিজ'), locale),
      type: 'mega',
      link: '',
      panel: {
        eyebrow: pick(t('Capabilities', 'ক্যাপাবিলিটিজ'), locale),
        heading: pick(
          t(
            'Engineering that creates measurable business value.',
            'পরিমাপযোগ্য ব্যবসায়িক মূল্য তৈরি করে এমন ইঞ্জিনিয়ারিং।',
          ),
          locale,
        ),
        featured: {
          enabled: true,
          badge: pick(t('Featured', 'ফিচার্ড'), locale),
          title: pick(t('Applied AI, in production', 'প্রোডাকশনে অ্যাপ্লায়েড এআই'), locale),
          description: pick(
            t(
              'Evals, guardrails and a control plane your compliance team will actually approve.',
              'ইভ্যালুয়েশন, গার্ডরেল এবং একটি কন্ট্রোল প্লেন যা আপনার কমপ্লায়েন্স টিম অনুমোদন করবে।',
            ),
            locale,
          ),
          ctaLabel: pick(t('Explore AI', 'এআই এক্সপ্লোর করুন'), locale),
          link: '/capabilities/artificial-intelligence',
        },
        columns: [
          column(
            t('Intelligence', 'ইন্টেলিজেন্স'),
            caps,
            '/capabilities',
            ['artificial-intelligence', 'data-analytics'],
            locale,
          ),
          column(
            t('Platform', 'প্ল্যাটফর্ম'),
            caps,
            '/capabilities',
            ['cloud-transformation', 'platformization'],
            locale,
          ),
          column(
            t('Product', 'প্রোডাক্ট'),
            caps,
            '/capabilities',
            ['digital-experiences', 'internet-of-things'],
            locale,
          ),
        ],
        resources: [
          { icon: 'book-marked', label: pick(t('Client stories', 'ক্লায়েন্ট স্টোরিজ'), locale), link: '/stories' },
          { icon: 'compass', label: pick(t('How we engage', 'আমরা যেভাবে কাজ করি'), locale), link: '/solutions' },
        ],
      },
    },
    // 2) Solutions — mega, view-all → /solutions
    {
      label: pick(t('Solutions', 'সলিউশন'), locale),
      type: 'mega',
      link: '/solutions',
      panel: {
        eyebrow: pick(t('Solutions', 'সলিউশন'), locale),
        heading: pick(
          t('Ways we partner to move your roadmap forward.', 'আপনার রোডম্যাপ এগিয়ে নিতে আমরা যেভাবে পার্টনার হই।'),
          locale,
        ),
        viewAllLabel: pick(t('View all', 'সব দেখুন'), locale),
        viewAllLink: '/solutions',
        featured: {
          enabled: true,
          badge: pick(t('Engagement', 'এনগেজমেন্ট'), locale),
          title: pick(t('Frame, Flow & Orchestra', 'ফ্রেম, ফ্লো ও অর্কেস্ট্রা'), locale),
          description: pick(
            t(
              'Three engagement models that flex from a focused sprint to a fully managed program.',
              'তিনটি এনগেজমেন্ট মডেল — একটি ফোকাসড স্প্রিন্ট থেকে সম্পূর্ণ ম্যানেজড প্রোগ্রাম পর্যন্ত।',
            ),
            locale,
          ),
          ctaLabel: pick(t('See how we engage', 'কীভাবে কাজ করি দেখুন'), locale),
          link: '/solutions',
        },
        columns: [
          column(
            t('Transform', 'ট্রান্সফর্ম'),
            sols,
            '/solutions',
            ['enterprise-transformation', 'product-development'],
            locale,
          ),
          column(t('Operate', 'অপারেট'), sols, '/solutions', ['engineering-augmentation', 'managed-systems'], locale),
        ],
      },
    },
    // 3) Industries — mega, view-all → /industries
    {
      label: pick(t('Industries', 'ইন্ডাস্ট্রিজ'), locale),
      type: 'mega',
      link: '/industries',
      panel: {
        eyebrow: pick(t('Industries', 'ইন্ডাস্ট্রিজ'), locale),
        heading: pick(
          t('Deep expertise across the sectors we serve.', 'আমরা যে খাতগুলোতে কাজ করি সেখানে গভীর দক্ষতা।'),
          locale,
        ),
        viewAllLabel: pick(t('View all', 'সব দেখুন'), locale),
        viewAllLink: '/industries',
        featured: { enabled: false },
        columns: [
          column(
            t('Finance', 'ফিন্যান্স'),
            inds,
            '/industries',
            ['financial-services-insurance', 'banking-capital-markets', 'public-sector'],
            locale,
          ),
          column(
            t('Technology', 'টেকনোলজি'),
            inds,
            '/industries',
            ['software-platforms', 'technology-platforms', 'healthcare'],
            locale,
          ),
          column(
            t('Sectors', 'সেক্টর'),
            inds,
            '/industries',
            ['advanced-manufacturing', 'consumer-goods', 'hospitality-travel', 'sports-entertainment'],
            locale,
          ),
        ],
      },
    },
    // 4) Scales — plain link
    { label: pick(t('Scales', 'স্কেল'), locale), type: 'link', link: '/scales' },
    // 5) Stories — plain link
    { label: pick(t('Stories', 'স্টোরিজ'), locale), type: 'link', link: '/stories' },
  ]

  const secondaryLinks = [
    { icon: 'globe', label: pick(t('About Ternary', 'টারনারি সম্পর্কে'), locale), link: '/about' },
    { icon: 'briefcase', label: pick(t('Careers', 'ক্যারিয়ার'), locale), link: '/careers' },
    { icon: 'users', label: pick(t('Our Team', 'আমাদের টিম'), locale), link: '/team' },
  ]

  return {
    exploreLabel: pick(t('Explore', 'এক্সপ্লোর'), locale),
    menu,
    secondaryLinks,
    button: { label: pick(t('Contact us', 'যোগাযোগ করুন'), locale), link: '/contact' },
  }
}

// Copy the row ids Payload generated (read from the `en` pass) into the `bn` payload, matched by
// position, at every nested array level — so the `bn` write updates the same rows instead of
// replacing them (which would drop the `en` localized values).
function injectIds(target: any, source: any) {
  target.menu?.forEach((row: any, i: number) => {
    const s = source.menu?.[i]
    if (!s) return
    row.id = s.id
    if (row.panel && s.panel) {
      row.panel.columns?.forEach((c: any, j: number) => {
        const sc = s.panel.columns?.[j]
        if (!sc) return
        c.id = sc.id
        c.items?.forEach((it: any, k: number) => {
          if (sc.items?.[k]) it.id = sc.items[k].id
        })
      })
      row.panel.resources?.forEach((r: any, j: number) => {
        if (s.panel.resources?.[j]) r.id = s.panel.resources[j].id
      })
    }
  })
  target.secondaryLinks?.forEach((row: any, i: number) => {
    if (source.secondaryLinks?.[i]) row.id = source.secondaryLinks[i].id
  })
}

if (DRY) {
  payload.logger.info('DRY RUN — header (en):\n' + JSON.stringify(build('en'), null, 2))
  process.exit(0)
}

// 1) Write en (creates array rows + ids).
await tryWrite(
  () => payload.updateGlobal({ slug: 'header' as never, locale: 'en' as never, data: build('en') as never }),
  'header[en]',
)

// 2) Read back en ids, inject into bn payload, write bn onto the same rows.
const base = (await payload.findGlobal({ slug: 'header' as never, locale: 'en' as never, depth: 0 })) as any
const bn = build('bn')
injectIds(bn, base)
await tryWrite(
  () => payload.updateGlobal({ slug: 'header' as never, locale: 'bn' as never, data: bn as never }),
  'header[bn]',
)

// 3) Verify both locales read back intact.
for (const locale of ['en', 'bn'] as const) {
  const h = (await payload.findGlobal({ slug: 'header' as never, locale: locale as never, depth: 0 })) as any
  const mega = h.menu?.filter((m: any) => m.type === 'mega').length ?? 0
  const cols = h.menu?.[0]?.panel?.columns?.length ?? 0
  const firstItem = h.menu?.[0]?.panel?.columns?.[0]?.items?.[0]?.label ?? '—'
  payload.logger.info(
    `verify header[${locale}]: ${h.menu?.length} items (${mega} mega), explore="${h.exploreLabel}", ` +
      `caps cols=${cols}, first item="${firstItem}", secondary=${h.secondaryLinks?.length}, button="${h.button?.label}"`,
  )
}

process.exit(0)
