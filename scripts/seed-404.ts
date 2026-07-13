// Fill the `notFound` global (404 page) with the launch copy, both locales in one shot.
//
// Globals have no drafts, so locale:'all' + { en, bn } per localized field is safe here — the known
// locale:'all' quirk only bites nested *groups*, and this global is flat fields + one array.
//
// Links are stored LOCALE-LESS; the component adds the /bn prefix. Every href below was picked
// because it actually resolves 200: there is no /capabilities or /case-studies landing route (only
// their /<slug> detail pages), so the cards point at /solutions, /stories, and /contact.
//
// Idempotent — re-running overwrites the same fields.
//   SEED_DRY=1 pnpm payload run ./scripts/seed-404.ts   # preview
//   pnpm payload run ./scripts/seed-404.ts              # write
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY === '1'
const payload: Payload = await getPayload({ config })

const data = {
  statusLabel: {
    en: 'route.status: unresolved',
    bn: 'route.status: unresolved',
  },
  headline: {
    en: 'UNORCHESTRATED',
    bn: 'UNORCHESTRATED',
  },
  probingText: {
    en: 'Searching orchestration graph for this route…',
    bn: 'এই রুটের জন্য অর্কেস্ট্রেশন গ্রাফ খোঁজা হচ্ছে…',
  },
  title: {
    en: "This route didn't ship.",
    bn: 'এই রুটটি কখনও শিপ হয়নি।',
  },
  description: {
    en: "The page you're looking for was either never deployed, deprecated, or the URL took a wrong turn somewhere upstream.",
    bn: 'আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি হয় কখনও ডিপ্লয় করা হয়নি, বাতিল করা হয়েছে, অথবা URL-টি কোথাও ভুল পথে চলে গেছে।',
  },
  primaryLabel: { en: 'Return home', bn: 'হোমে ফিরুন' },
  primaryLink: '/',
  secondaryLabel: { en: 'View recent work', bn: 'সাম্প্রতিক কাজ দেখুন' },
  secondaryLink: '/stories',
  cards: [
    {
      eyebrow: { en: 'solutions', bn: 'solutions' },
      title: { en: 'Explore Solutions', bn: 'সলিউশন দেখুন' },
      link: '/solutions',
    },
    {
      eyebrow: { en: 'stories', bn: 'stories' },
      title: { en: 'Read Case Studies', bn: 'কেস স্টাডি পড়ুন' },
      link: '/stories',
    },
    {
      eyebrow: { en: 'contact', bn: 'contact' },
      title: { en: 'Contact Engineering', bn: 'ইঞ্জিনিয়ারিং টিমে যোগাযোগ' },
      link: '/contact',
    },
  ],
}

if (DRY) {
  payload.logger.info(`DRY RUN — would write:\n${JSON.stringify(data, null, 2)}`)
} else {
  try {
    await payload.updateGlobal({ slug: 'notFound', locale: 'all' as never, data: data as never })
    payload.logger.info('notFound: written')
  } catch (e: unknown) {
    // Writing from a script means there is no Next request scope, so the global's afterChange
    // revalidateTag() throws. The DB write has already committed at that point.
    const m = String((e as Error)?.message ?? e)
    if (!m.includes('revalidateTag') && !m.includes('static generation store')) throw e
    payload.logger.info('notFound: committed (revalidate swallowed — bust the `not-found` tag)')
  }

  // Read back per locale so a silently-dropped bn value can't pass unnoticed.
  for (const locale of ['en', 'bn'] as const) {
    const doc = await payload.findGlobal({ slug: 'notFound', locale, depth: 0 })
    payload.logger.info(
      `  ${locale}: title=${JSON.stringify(doc.title)} primary=${JSON.stringify(doc.primaryLabel)} cards=${doc.cards?.length ?? 0} card1=${JSON.stringify(doc.cards?.[0]?.title)}`,
    )
  }
}

process.exit(0)
