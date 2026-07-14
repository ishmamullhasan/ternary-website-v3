// Assign each capability its card animation, and create the two disciplines the grid was drawn for
// but that never had a document (Agentic Architecture, DevOps & Automation).
//
// The animation is picked per-capability off the collection's `animation` select, the same way a
// SolutionFeature block picks its aside panel off `widget`. Eight figures, eight disciplines:
//
//   agentic    → Agentic Architecture      (a reticle that reasons, then acquires)
//   neuralNet  → Artificial Intelligence   (activation propagating through layers)
//   platform   → Platformization           (modules slotting onto a foundation)
//   dataLanes  → Data & Analytics          (two lanes under a fixed read head)
//   pipeline   → DevOps & Automation       (a pipeline whose gates fire as the node crosses them)
//   surfaces   → Digital Experiences       (layered panels, and someone using them)
//   telemetry  → Internet of Things        (packets riding a mesh toward one gateway)
//   migration  → Cloud Transformation      (mass crossing the boundary, arriving distributed)
//
// ATTRIBUTION. Every write passes `user`, so the activityLog plugin's actorOf() reads a real
// req.user and the rows land against ashemul@ternary.solutions with source `api`, instead of the
// anonymous `system` every other script in this repo produces. See plugins/activityLog.ts.
//
// ORDER. The card's index badge (01…08) is its position in the home block's `capability` list, so
// the list is rewritten to the canonical order above — otherwise the numbering and the figures would
// disagree.
//
// The `animation` field is NOT localized, so it needs one write, not one per locale. The two new
// documents do need both: created in `en`, then translated in a second `bn` pass.
//
// DRY by default; set SEED_DRY=0 to apply.
//   pnpm payload run ./scripts/seed-capability-animations.ts            # preview
//   SEED_DRY=0 pnpm payload run ./scripts/seed-capability-animations.ts # apply
//
// Writes go out with revalidation disabled (revalidateTag throws outside a Next request), so bust
// the cache afterwards: GET /next/revalidate?secret=$CRON_SECRET&tag=capability
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const ACTOR_EMAIL = 'ashemul@ternary.solutions'

type Locale = 'en' | 'bn'

// --- Lexical richText (same shape as scripts/seed-content.ts) -------------------------------------

const para = (text: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  textFormat: 0,
  textStyle: '',
  children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
})

const richText = (text: string) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr' as const, children: [para(text)] },
})

// --- The mapping ----------------------------------------------------------------------------------

type Translated = { title: string; excerpts: string; badge: string; description: string; button: string }

type Spec = {
  slug: string
  animation: string
  /** Absent for the six that already exist — those get an animation and nothing else. */
  create?: Record<Locale, Translated>
}

// In display order: this array IS the home grid's order, and therefore the 01…08 numbering.
const CAPABILITIES: Spec[] = [
  {
    slug: 'agentic-architecture',
    animation: 'agentic',
    create: {
      en: {
        title: 'Agentic Architecture',
        excerpts:
          'We design multi-agent systems that reason before they act — planning, tool use, and verification built into the architecture rather than bolted on afterwards. We stay accountable for what the agents do in production, not merely for whether they run.',
        badge: 'Capability',
        description:
          'Autonomy is an architectural property, not a prompt. We build agent systems with explicit planning, bounded tool access, and verification at every step where a wrong answer would be expensive — then we carry production responsibility for the result.',
        button: 'Talk to us',
      },
      bn: {
        title: 'এজেন্টিক আর্কিটেকচার',
        excerpts:
          'আমরা এমন মাল্টি-এজেন্ট সিস্টেম ডিজাইন করি যা কাজ করার আগে যুক্তি সাজায় — পরিকল্পনা, টুল ব্যবহার ও যাচাই আর্কিটেকচারেই গাঁথা থাকে, পরে জুড়ে দেওয়া নয়। এজেন্ট প্রোডাকশনে কী করছে তার দায়িত্ব আমরা নিই, শুধু সেটি চলছে কিনা তা নয়।',
        badge: 'ক্যাপাবিলিটি',
        description:
          'স্বায়ত্তশাসন একটি আর্কিটেকচারাল বৈশিষ্ট্য, কোনো প্রম্পট নয়। আমরা সুস্পষ্ট পরিকল্পনা, সীমিত টুল অ্যাক্সেস এবং প্রতিটি ব্যয়বহুল ধাপে যাচাই সহ এজেন্ট সিস্টেম তৈরি করি — এবং ফলাফলের প্রোডাকশন দায়িত্ব বহন করি।',
        button: 'আমাদের সাথে কথা বলুন',
      },
    },
  },
  { slug: 'artificial-intelligence', animation: 'neuralNet' },
  { slug: 'platformization', animation: 'platform' },
  { slug: 'data-analytics', animation: 'dataLanes' },
  {
    slug: 'devops-automation',
    animation: 'pipeline',
    create: {
      en: {
        title: 'DevOps & Automation',
        excerpts:
          'We take the delivery path — build, test, release, observe — and make it boring. Ship more, break less, and stop paying an on-call tax on work that should have been automated years ago.',
        badge: 'Capability',
        description:
          'A delivery pipeline is infrastructure, and it deserves the same rigour as the product it ships. We automate the path to production end to end, instrument what happens after, and hand back a team that deploys on a Friday without flinching.',
        button: 'Talk to us',
      },
      bn: {
        title: 'ডেভঅপস ও অটোমেশন',
        excerpts:
          'বিল্ড, টেস্ট, রিলিজ, পর্যবেক্ষণ — ডেলিভারির পুরো পথটিকে আমরা নিরুত্তেজ করে তুলি। বেশি ডেলিভারি, কম ভাঙন, এবং যে কাজ বহু আগেই স্বয়ংক্রিয় হওয়ার কথা তার জন্য আর অন-কল কর নয়।',
        badge: 'ক্যাপাবিলিটি',
        description:
          'ডেলিভারি পাইপলাইন একধরনের অবকাঠামো, এবং যে পণ্য এটি পাঠায় তার সমান কঠোরতা এর প্রাপ্য। আমরা প্রোডাকশন পর্যন্ত পুরো পথ স্বয়ংক্রিয় করি, পরবর্তী ঘটনাগুলো পরিমাপ করি, এবং এমন একটি দলকে ফিরিয়ে দিই যারা শুক্রবারেও নির্দ্বিধায় ডিপ্লয় করে।',
        button: 'আমাদের সাথে কথা বলুন',
      },
    },
  },
  { slug: 'digital-experiences', animation: 'surfaces' },
  { slug: 'internet-of-things', animation: 'telemetry' },
  { slug: 'cloud-transformation', animation: 'migration' },
]

// --- Machinery ------------------------------------------------------------------------------------

const payload: Payload = await getPayload({ config })
payload.logger.info(`Seed capability animations ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

// afterChange hooks call revalidateTag(), which throws outside a request context; the DB write
// commits first, so swallow only that specific error (same handling as seed-solution-panels.ts).
const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

const actorResult = await payload.find({
  collection: 'users',
  where: { email: { equals: ACTOR_EMAIL } },
  limit: 1,
  depth: 0,
  overrideAccess: true,
})
const actor = actorResult.docs[0]
if (!actor) throw new Error(`No user ${ACTOR_EMAIL} — refusing to write an unattributed audit trail.`)
payload.logger.info(`  attributing every write to ${actor.email} (${String(actor.id)})`)

/** Every write in this script goes through here, so none of them can be left unattributed. */
const asActor = { user: actor, overrideAccess: true, context: { disableRevalidate: true } } as const

const findBySlug = async (slug: string, locale: Locale) => {
  const r = await payload.find({
    collection: 'capability',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    locale,
    fallbackLocale: false, // never materialise the en fallback into bn
    overrideAccess: true,
  })
  return r.docs[0] ?? null
}

const heroFor = (t: Translated) => ({
  badge: t.badge,
  heading: t.title,
  description: richText(t.description),
  button: { label: t.button, link: '/contact' },
})

// --- 1) The two missing documents -----------------------------------------------------------------

for (const spec of CAPABILITIES) {
  if (!spec.create) continue

  const en = spec.create.en
  const existing = await findBySlug(spec.slug, 'en')

  if (existing) {
    payload.logger.info(`  ${spec.slug}: already exists — not recreating`)
  } else {
    payload.logger.info(`  ${spec.slug}: CREATE "${en.title}"`)
    if (!DRY) {
      // The collection's afterChange hook calls revalidateTag() unconditionally — it does not honour
      // context.disableRevalidate — so the create must be swallowed too, not just the updates. The
      // row commits before the hook throws, so the id is re-read below rather than taken from the
      // return value (which never arrives).
      await ignoreRevalidate(() =>
        payload.create({
          collection: 'capability',
          locale: 'en',
          data: {
            slug: spec.slug,
            title: en.title,
            excerpts: en.excerpts,
            animation: spec.animation,
            heroSection: heroFor(en),
          } as never,
          ...asActor,
        }),
      )
    }
  }

  if (DRY) continue

  const doc = await findBySlug(spec.slug, 'en')
  if (!doc) throw new Error(`${spec.slug}: create reported success but the document is not there.`)

  // The bn pass is keyed off whether bn is actually set, NOT off whether we just created the doc.
  // Those came apart once already: an early run threw inside the create's revalidate hook after the
  // row had committed, so the document existed with no translation and the retry skipped it as
  // "already exists". Read bn with fallbackLocale:false — with the fallback on, the unset bn title
  // would come back as the English string and this would look done when it is not.
  const bnDoc = await findBySlug(spec.slug, 'bn')
  if (bnDoc?.title) {
    payload.logger.info(`  ${spec.slug}: bn already translated ("${bnDoc.title}")`)
    continue
  }

  const bn = spec.create.bn
  payload.logger.info(`  ${spec.slug}: bn missing → translating`)
  await ignoreRevalidate(() =>
    payload.update({
      collection: 'capability',
      id: doc.id,
      locale: 'bn',
      data: { title: bn.title, excerpts: bn.excerpts, heroSection: heroFor(bn) } as never,
      ...asActor,
    }),
  )
}

// --- 2) The animation on all eight ----------------------------------------------------------------

const ids = new Map<string, string | number>()

for (const spec of CAPABILITIES) {
  const doc = await findBySlug(spec.slug, 'en')
  if (!doc) {
    payload.logger.warn(`  ${spec.slug}: NOT FOUND — skipped (it will be missing from the grid)`)
    continue
  }
  ids.set(spec.slug, doc.id)

  const current = (doc as Record<string, unknown>).animation
  if (current === spec.animation) {
    payload.logger.info(`  ${spec.slug}: animation already "${spec.animation}"`)
    continue
  }

  payload.logger.info(`  ${spec.slug}: animation ${String(current ?? '—')} → ${spec.animation}`)
  if (DRY) continue

  // `animation` is not localized: one write sets it for both locales.
  await ignoreRevalidate(() =>
    payload.update({
      collection: 'capability',
      id: doc.id,
      data: { animation: spec.animation } as never,
      ...asActor,
    }),
  )
}

// --- 3) Home grid: the canonical eight, in the order the numbering assumes -------------------------

const ordered = CAPABILITIES.map((c) => ids.get(c.slug)).filter((id): id is string | number => id != null)

const homes = await payload.db.connection
  .collection('pages')
  .find({ 'layout.blockType': 'capabilitiesSection' })
  .toArray()

for (const raw of homes) {
  const id = String(raw._id)

  for (const locale of ['en', 'bn'] as Locale[]) {
    const page = (await payload.findByID({
      collection: 'pages',
      id,
      depth: 0,
      locale,
      fallbackLocale: false,
      draft: false,
      overrideAccess: true,
    })) as unknown as Record<string, unknown>

    const layout = (page.layout ?? []) as Record<string, unknown>[]
    const before = layout.find((b) => b.blockType === 'capabilitiesSection')?.capability
    const beforeIds = (Array.isArray(before) ? before : []).map(String)

    if (locale === 'en') {
      payload.logger.info(
        `  page ${String(page.slug)}: capabilitiesSection ${beforeIds.length} → ${ordered.length} cards, reordered to match the 01–08 numbering`,
      )
    }
    if (DRY) continue

    // Spread each block rather than rebuilding it: the block row ids must survive, or Payload treats
    // every block as new and the page's other content is re-minted along with it.
    const next = layout.map((b) => (b.blockType === 'capabilitiesSection' ? { ...b, capability: ordered } : b))

    await ignoreRevalidate(() =>
      payload.update({
        collection: 'pages',
        id,
        locale,
        // Pages.title is required + localized; omitting it fails re-validation on a per-locale write.
        data: { title: page.title, layout: next, _status: 'published' } as never,
        ...asActor,
      }),
    )
  }
}

payload.logger.info(
  DRY
    ? 'DRY RUN complete — re-run with SEED_DRY=0 to apply.'
    : 'Done. Bust the cache: GET /next/revalidate?secret=$CRON_SECRET&tag=capability',
)
process.exit(0)
