// Fill the empty sections of the "Ternary Marks One Year of Bangladesh Operations" press release
// (slug: one-year-in-bangladesh) to match the Figma press-release layout (node 1548-6563):
// quotes, releaseFacts, pressContact, relatedPressReleases — in both en and bn locales.
//
// Top fields, leadParagraph and content are already populated, so they are left untouched.
// Per-locale updates only (never locale:'all'); localized array items (quotes) carry stable hex
// ids reused across locales so their localized subfields line up (see memory: locale-all wipe,
// bson row-id). draft:false keeps the doc published.
//
//   DATABASE_URI=<uri> pnpm payload run ./scripts/fill-press-one-year.ts            # preview (DRY)
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/fill-press-one-year.ts # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const SLUG = 'one-year-in-bangladesh'

// Stable hex (24-char) ids for the two quote rows — reused across en/bn so localized subfields merge.
const QUOTE_ID_1 = '6a36ea0100000000000000a1'
const QUOTE_ID_2 = '6a36ea0100000000000000a2'

// Sibling press releases to surface under "Related" (both have a published version -> populate fine).
const RELATED_IDS = ['6a34eaebc3cfae4dc8fec466', '6a34eaebc3cfae4dc8fec46c']

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
const rich = (text: string) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr' as const, children: [para(text)] },
})

// afterChange fires revalidateTag(), which throws outside a Next request; the DB write commits first,
// so swallow only that specific error (same handling as seed-content.ts / seed-bn.ts).
const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

const en = {
  quotes: [
    {
      id: QUOTE_ID_1,
      quote:
        'A year ago we made a simple commitment: the people who build a system in Dhaka carry responsibility for how it runs in production. Twelve months in, that standard is holding — and it is why our clients trust us with work that matters.',
      name: 'Shadman Shakib',
      role: 'Founder · Ternary',
    },
    {
      id: QUOTE_ID_2,
      quote:
        'This milestone is not about headcount. It is proof that senior engineering delivered from Bangladesh can meet the same governance and reliability bar our clients expect anywhere in the world.',
      name: 'Sajid Islam',
      role: 'Chief Revenue Officer · Ternary',
    },
  ],
  releaseFacts: { forImmediateRelease: 'Yes', embargo: 'None', distribution: 'Global' },
  pressContact: {
    heading: 'Press & analyst contact',
    description: rich(
      "For interviews, background, or additional information, please contact Ternary's communications team.",
    ),
    press: {
      name: 'Ariba Chowdhury',
      title: 'Marketing Specialist · Ternary',
      email: 'press@ternary.solutions',
      phone: '+880 1700 000 000',
    },
    analyst: {
      name: 'Sajid Islam',
      title: 'Chief Revenue Officer · Ternary',
      email: 'analyst@ternary.solutions',
      website: 'https://ternary.solutions/newsroom',
    },
    mediaKitDescription: 'Logos, executive headshots, and brand guidelines.',
    socialLinks: {
      twitter: 'https://x.com/ternarysolutions',
      linkedin: 'https://www.linkedin.com/company/ternary-solutions',
      website: 'https://ternary.solutions',
    },
  },
  relatedPressReleases: {
    heading: 'Related press releases',
    description: rich('More on how Ternary structures and operates its dual-hub delivery model.'),
    pressReleases: RELATED_IDS,
  },
}

// bn overlays only the localized text fields; ids, emails, phone, website, socialLinks and the
// related relationship are shared (non-localized) — re-sending the same values is idempotent.
const bn = {
  quotes: [
    {
      id: QUOTE_ID_1,
      quote:
        'এক বছর আগে আমরা একটি সহজ প্রতিশ্রুতি দিয়েছিলাম: ঢাকায় যারা একটি সিস্টেম তৈরি করে, প্রোডাকশনে সেটি কীভাবে চলে তার দায়িত্বও তারাই বহন করে। বারো মাস পেরিয়ে সেই মানদণ্ড অটুট রয়েছে — আর এ কারণেই গুরুত্বপূর্ণ কাজের ভার আমাদের ক্লায়েন্টরা আমাদের ওপরই রাখেন।',
      name: 'Shadman Shakib',
      role: 'প্রতিষ্ঠাতা · Ternary',
    },
    {
      id: QUOTE_ID_2,
      quote:
        'এই মাইলফলক লোকবল নিয়ে নয়। এটি প্রমাণ করে যে বাংলাদেশ থেকে সরবরাহ করা সিনিয়র ইঞ্জিনিয়ারিং বিশ্বের যেকোনো জায়গার মতো একই গভর্নেন্স ও নির্ভরযোগ্যতার মান পূরণ করতে পারে।',
      name: 'Sajid Islam',
      role: 'চিফ রেভিনিউ অফিসার · Ternary',
    },
  ],
  releaseFacts: { forImmediateRelease: 'হ্যাঁ', embargo: 'নেই', distribution: 'বৈশ্বিক' },
  pressContact: {
    heading: 'প্রেস ও বিশ্লেষক যোগাযোগ',
    description: rich(
      'সাক্ষাৎকার, পটভূমি বা অতিরিক্ত তথ্যের জন্য অনুগ্রহ করে Ternary-র কমিউনিকেশনস টিমের সাথে যোগাযোগ করুন।',
    ),
    press: {
      name: 'Ariba Chowdhury',
      title: 'মার্কেটিং স্পেশালিস্ট · Ternary',
      email: 'press@ternary.solutions',
      phone: '+880 1700 000 000',
    },
    analyst: {
      name: 'Sajid Islam',
      title: 'চিফ রেভিনিউ অফিসার · Ternary',
      email: 'analyst@ternary.solutions',
      website: 'https://ternary.solutions/newsroom',
    },
    mediaKitDescription: 'লোগো, নির্বাহীদের ছবি এবং ব্র্যান্ড গাইডলাইন।',
    socialLinks: {
      twitter: 'https://x.com/ternarysolutions',
      linkedin: 'https://www.linkedin.com/company/ternary-solutions',
      website: 'https://ternary.solutions',
    },
  },
  relatedPressReleases: {
    heading: 'সম্পর্কিত প্রেস রিলিজ',
    description: rich('Ternary কীভাবে তার দ্বৈত-হাব ডেলিভারি মডেল গঠন ও পরিচালনা করে সে সম্পর্কে আরও।'),
    pressReleases: RELATED_IDS,
  },
}

const payload: Payload = await getPayload({ config })
payload.logger.info(`Fill press-release "${SLUG}" ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

const found = await payload.find({ collection: 'pressRelease', where: { slug: { equals: SLUG } }, depth: 0, limit: 1 })
const doc = found.docs[0]
if (!doc) {
  payload.logger.error(`No pressRelease with slug "${SLUG}" — aborting.`)
  process.exit(1)
}
const id = doc.id
payload.logger.info(
  `Target id=${id}. Filling: quotes(${en.quotes.length}), releaseFacts, pressContact, relatedPressReleases(${RELATED_IDS.length})`,
)

if (DRY) {
  payload.logger.info('DRY RUN — would update locale=en then locale=bn (draft:false). Re-run with SEED_DRY=0 to apply.')
  process.exit(0)
}

await ignoreRevalidate(() =>
  payload.update({ collection: 'pressRelease', id, locale: 'en', draft: false, data: en as any }),
)
payload.logger.info('  en updated ✓')

await ignoreRevalidate(() =>
  payload.update({ collection: 'pressRelease', id, locale: 'bn', draft: false, data: bn as any }),
)
payload.logger.info('  bn updated ✓')

payload.logger.info('Done.')
process.exit(0)
