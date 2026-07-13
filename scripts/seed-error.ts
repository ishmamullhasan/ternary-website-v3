// Fill the `errorPage` global (unknown-error screen) with the launch copy, both locales in one shot.
//
// Same shape and constraints as scripts/seed-404.ts: globals have no drafts, and this global is flat
// fields + one array (no nested group), so locale:'all' with { en, bn } is safe. Links are stored
// LOCALE-LESS; the component adds the /bn prefix. Only routes that resolve 200 are used.
//
// Idempotent — re-running overwrites the same fields.
//   SEED_DRY=1 pnpm payload run ./scripts/seed-error.ts   # preview
//   pnpm payload run ./scripts/seed-error.ts              # write
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY === '1'
const payload: Payload = await getPayload({ config })

const data = {
  statusLabel: {
    en: 'runtime.status: exception',
    bn: 'runtime.status: exception',
  },
  headline: {
    en: 'UNHANDLED',
    bn: 'UNHANDLED',
  },
  probingText: {
    en: 'Capturing stack trace and notifying the on-call engineer…',
    bn: 'স্ট্যাক ট্রেস সংগ্রহ করে অন-কল ইঞ্জিনিয়ারকে জানানো হচ্ছে…',
  },
  title: {
    en: 'Something broke on our side.',
    bn: 'আমাদের দিকে কিছু একটা ভেঙেছে।',
  },
  description: {
    en: 'This one is on us, not you. The failure has been logged. Retrying often works — the fault may have been momentary.',
    bn: 'দোষটি আপনার নয়, আমাদের। ত্রুটিটি লগ করা হয়েছে। আবার চেষ্টা করলে প্রায়ই কাজ হয় — সমস্যাটি ক্ষণস্থায়ী হতে পারে।',
  },
  retryLabel: { en: 'Try again', bn: 'আবার চেষ্টা করুন' },
  secondaryLabel: { en: 'Return home', bn: 'হোমে ফিরুন' },
  secondaryLink: '/',
  digestLabel: { en: 'Reference', bn: 'রেফারেন্স' },
  cards: [
    {
      eyebrow: { en: 'contact', bn: 'contact' },
      title: { en: 'Report This to Engineering', bn: 'ইঞ্জিনিয়ারিং টিমকে জানান' },
      link: '/contact',
    },
    {
      eyebrow: { en: 'stories', bn: 'stories' },
      title: { en: 'Read Case Studies', bn: 'কেস স্টাডি পড়ুন' },
      link: '/stories',
    },
    {
      eyebrow: { en: 'solutions', bn: 'solutions' },
      title: { en: 'Explore Solutions', bn: 'সলিউশন দেখুন' },
      link: '/solutions',
    },
  ],
}

if (DRY) {
  payload.logger.info(`DRY RUN — would write:\n${JSON.stringify(data, null, 2)}`)
} else {
  try {
    await payload.updateGlobal({ slug: 'errorPage', locale: 'all' as never, data: data as never })
    payload.logger.info('errorPage: written')
  } catch (e: unknown) {
    // No Next request scope in a script, so the global's afterChange revalidateTag() throws. The DB
    // write has already committed at that point.
    const m = String((e as Error)?.message ?? e)
    if (!m.includes('revalidateTag') && !m.includes('static generation store')) throw e
    payload.logger.info('errorPage: committed (revalidate swallowed — bust the `error-page` tag)')
  }

  // Read back per locale so a silently-dropped bn value can't pass unnoticed.
  for (const locale of ['en', 'bn'] as const) {
    const doc = await payload.findGlobal({ slug: 'errorPage', locale, depth: 0 })
    payload.logger.info(
      `  ${locale}: title=${JSON.stringify(doc.title)} retry=${JSON.stringify(doc.retryLabel)} cards=${doc.cards?.length ?? 0} card1=${JSON.stringify(doc.cards?.[0]?.title)}`,
    )
  }
}

process.exit(0)
