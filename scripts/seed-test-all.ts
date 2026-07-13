// Fill every content collection with one realistic-but-fake `test` document so the CMS-driven
// front end can be eyeballed end-to-end.
//
// Idempotent: for each collection it upserts ONLY the doc whose slug is `test` (create if absent,
// else update in place). No other row is ever written, reordered, or deleted.
//
// Images are NOT uploaded — every upload field is pointed at a RANDOM existing `media` doc, so the
// script needs no filesystem access and the library stays clean.
//
// Locale: writes `en` only. Payload's localization has `fallback: true`, so /bn renders the same
// copy rather than going blank. (Seeding bn per-locale is deliberately out of scope — see the
// locale:'all' group quirk noted in the repo's other seeders.)
//
// The `industry` collection has its own richer, Figma-accurate seeder — run that one too:
//   pnpm payload run ./scripts/seed-test-industry.ts
//
// Collections with no detail route of their own (scale, model, team) are surfaced by the `test`
// PAGE this script also seeds, at /test — it embeds them via their relationship blocks.
//
//   SEED_DRY=1 pnpm payload run ./scripts/seed-test-all.ts   # preview, no writes
//   pnpm payload run ./scripts/seed-test-all.ts              # write
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY === '1'
const SLUG = 'test'
const ctx = { disableRevalidate: true }

const payload: Payload = await getPayload({ config })
payload.logger.info(`Seed "${SLUG}" docs across all collections ${DRY ? '(DRY RUN)' : '(WRITING)'}`)

// ---- Lexical richText helpers (same shape as scripts/seed-test-industry.ts) ------------------
const txt = (text: string) => ({
  type: 'text',
  text,
  format: 0,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})
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
const heading = (text: string, tag: 'h2' | 'h3' = 'h2') => ({
  type: 'heading',
  tag,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  children: [txt(text)],
})
type Node = ReturnType<typeof para> | ReturnType<typeof heading>
const doc = (nodes: Node[]) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr' as const, children: nodes },
})
/** Shorthand: a richText value from plain paragraphs. */
const rt = (...paragraphs: string[]) => doc(paragraphs.map(para))

// The collections' afterChange hooks call Next's revalidateTag(), which throws outside a request
// scope. The DB write has already committed by then, so swallow ONLY that error.
const ignoreRevalidate = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
  try {
    return await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return undefined
    throw e
  }
}

// Loosely-typed handle so block `layout` arrays (whose `blockType` widens to `string`) and the
// per-collection data shapes are accepted without a cast at every call site.
type Id = string | number
const db = payload as unknown as {
  find: (args: Record<string, unknown>) => Promise<{ docs: { id: Id }[] }>
  create: (args: Record<string, unknown>) => Promise<{ id: Id }>
  update: (args: Record<string, unknown>) => Promise<{ id: Id }>
}

/**
 * Create-or-update the `test`-slugged doc of a collection. `slugField` is the field the slug lives
 * on (always `slug`); `extra` is merged into the create payload only.
 */
const upsert = async (collection: string, data: Record<string, unknown>): Promise<Id | undefined> => {
  const found = await db.find({ collection, where: { slug: { equals: SLUG } }, limit: 1, depth: 0 })
  const existing = found.docs[0]

  if (DRY) {
    payload.logger.info(`  ${existing ? 'UPDATE' : 'CREATE'} ${collection}/${SLUG}`)
    return existing?.id
  }

  const res = await ignoreRevalidate(() =>
    existing
      ? db.update({ collection, id: existing.id, data, context: ctx })
      : db.create({ collection, data: { slug: SLUG, ...data }, context: ctx }),
  )
  // When the revalidate hook threw, the write still committed — re-read to recover the id.
  const id =
    res?.id ?? (await db.find({ collection, where: { slug: { equals: SLUG } }, limit: 1, depth: 0 })).docs[0]?.id
  payload.logger.info(`  ${existing ? 'updated' : 'created'} ${collection}/${SLUG} (id ${id})`)
  return id
}

// ---- Random media --------------------------------------------------------------------------
// The library is large; pull a page of it and hand out random ids to every upload field.
const media = await db.find({ collection: 'media', limit: 100, depth: 0 })
const mediaIds = media.docs.map((d) => d.id)
if (!mediaIds.length) payload.logger.warn('  no media docs found — upload fields will be left empty')
let cursor = 0
/** Deterministic-per-run but arbitrary: walks the shuffled-by-nature list so fields differ. */
const img = (): Id | undefined => {
  if (!mediaIds.length) return undefined
  const pick = mediaIds[(cursor * 7 + 3) % mediaIds.length]
  cursor += 1
  return pick
}
payload.logger.info(`  media pool: ${mediaIds.length} images`)

// ---- Existing rows used for the "related" relationships (never mutated) ----------------------
const otherIds = async (collection: string, limit = 3): Promise<Id[]> => {
  const res = await db.find({ collection, where: { slug: { not_equals: SLUG } }, limit, depth: 0 })
  return res.docs.map((d) => d.id)
}
const [relCapabilities, relInsights, relPress, relIndustries] = await Promise.all([
  otherIds('capability'),
  otherIds('insight'),
  otherIds('pressRelease'),
  otherIds('industry', 8),
])

// A shared CTA block, reused by the collections that embed one.
const cta = (headingText: string) => ({
  heading: headingText,
  description: rt('Talk to the engineers who would actually run the build — not a sales layer in front of them.'),
  backgroundImage: img(),
  button_1: { label: 'Book a discovery call', link: '/contact' },
  button_2: { label: 'See our work', link: '/stories' },
})

// =============================================================================================
// 1. team — seeded first: capability.practiceLead and insight.author point at it.
// =============================================================================================
const teamId = await upsert('team', {
  name: 'Test Rahman',
  memberId: 'TRN-000',
  category: 'leader',
  position: 'Principal Engineer, Platform',
  excerpt: 'Fifteen years turning brittle monoliths into systems that survive their own success.',
  description: rt(
    'Test Rahman leads platform engagements at Ternary — the ones where the architecture has to hold up under regulatory audit and a traffic spike in the same quarter.',
    'Before Ternary he spent eight years in payments infrastructure, where an outage is measured in lost revenue per second, and four building trading systems where it is measured in microseconds.',
  ),
  image: img(),
  linkedin: 'https://www.linkedin.com/in/test-rahman',
  x: 'https://x.com/test_rahman',
  github: 'https://github.com/test-rahman',
  website: 'https://example.com',
})

// =============================================================================================
// 2. capability — /capabilities/test
// =============================================================================================
await upsert('capability', {
  title: 'Test Capability — Platform Engineering',
  excerpts:
    'Test fixture. Distributed platforms that stay observable, auditable, and fast under load — built by pods that stay on after launch.',
  thumbnail: img(),
  heroSection: {
    badge: 'Platform Engineering',
    heading: 'Systems that survive their own success.',
    description: rt(
      'Most platforms fail not at launch but at scale, when the shortcuts taken in month two become the incidents of year two. We build for the second year first.',
    ),
    heroImage: img(),
    button: { label: 'Talk to a platform lead', link: '/contact' },
  },
  whatThisMeansToUs: {
    sectionLabel: 'Section 01',
    heading: 'What this means to us',
    description: rt('Three commitments we make on every platform engagement, written down so you can hold us to them.'),
    items: [
      {
        title: 'Observability is not a phase',
        excerpt:
          'Traces, metrics, and structured logs land in the first sprint — not after the first outage teaches us we needed them.',
      },
      {
        title: 'The audit trail is the architecture',
        excerpt:
          'Immutability and traceability are design constraints from commit one, so a regulator request is a query rather than a project.',
      },
      {
        title: 'We leave the team stronger',
        excerpt:
          'Every pod pairs with your engineers. If we walk out and delivery slows down, we did the engagement wrong.',
      },
    ],
  },
  howWeDoIt: {
    sectionLabel: 'Section 02',
    heading: 'How we do it',
    description: rt('A practice, not a toolchain. The tools change; the sequence does not.'),
    items: [
      {
        title: 'Strangle, never rewrite',
        excerpt:
          'We route traffic away from the monolith one bounded context at a time, so there is never a big-bang cutover weekend.',
        stack: [{ name: 'Kubernetes' }, { name: 'Envoy' }, { name: 'Terraform' }],
      },
      {
        title: 'Event-driven by default',
        excerpt:
          'Services publish facts, not commands. Consumers can be added, replayed, or removed without renegotiating the contract.',
        stack: [{ name: 'Kafka' }, { name: 'Go' }, { name: 'Postgres' }],
      },
      {
        title: 'Paved paths, not policies',
        excerpt:
          'The compliant way to ship becomes the easiest way to ship, so adherence stops depending on anyone remembering.',
        stack: [{ name: 'GitHub Actions' }, { name: 'OpenTelemetry' }, { name: 'Backstage' }],
      },
    ],
  },
  caseStudies: {
    sectionLabel: 'Section 03',
    heading: 'Proof, not promises',
    description: rt('Two engagements where the platform work paid for itself before the contract ended.'),
    items: [
      {
        meta: '2025 · Insurance',
        title: 'Claims platform re-architecture',
        problem: rt('A 12-year-old claims monolith took six days to price a policy change and nobody dared touch it.'),
        approach: rt(
          'We carved pricing out behind an anti-corruption layer, moved it to an event-sourced service, and shadow-ran it against production for six weeks before cutting over.',
        ),
        outcome: rt('Pricing changes now ship the same day, and the audit log is a first-class product surface.'),
        metricValue: '4h',
        metricLabel: 'from 6 days',
      },
      {
        meta: '2024 · Logistics',
        title: 'Real-time shipment telemetry',
        problem: rt('Fleet data landed in a warehouse overnight, so every operational decision was a day stale.'),
        approach: rt(
          'A streaming pipeline replaced the nightly batch, with backpressure and replay so a bad deploy never loses an event.',
        ),
        outcome: rt('Dispatchers now act on live positions; exception handling dropped from hours to minutes.'),
        metricValue: '99.98%',
        metricLabel: 'pipeline uptime',
      },
    ],
  },
  practiceLead: {
    sectionLabel: 'Section 04',
    member: teamId,
    bio: rt(
      'Test Rahman has spent fifteen years on systems where downtime is measured in money, and now leads the platform practice at Ternary.',
    ),
    credentials: [
      { text: 'CKA — Certified Kubernetes Administrator' },
      { text: 'AWS Solutions Architect, Professional' },
      { text: 'Maintainer, two OSS observability tools' },
    ],
    writings: [
      { title: 'Why your event bus became a distributed monolith', category: 'Essay', link: '/insights/test' },
      { title: 'Strangler-fig migrations in regulated environments', category: 'Talk', link: '/insights/test' },
    ],
    email: 'test.rahman@example.com',
    github: 'https://github.com/test-rahman',
  },
  relatedCapabilities: {
    sectionLabel: 'Section 05',
    heading: 'Related capabilities',
    capabilities: relCapabilities,
  },
  cta: cta('Skip the six-day pricing change.'),
})

// =============================================================================================
// 3. solution — /solutions/test
// =============================================================================================
await upsert('solution', {
  title: 'Test Solution — Agentic Workflow Automation',
  excerpts:
    'Test fixture. Put agents on the repetitive 80% of a workflow and keep a human on the 20% that carries the risk.',
  thumbnail: img(),
  content: doc([
    para(
      'Agentic automation fails in exactly one predictable way: the pilot works, and then nobody can explain to Risk what the agent did on the third Tuesday of last month.',
    ),
    heading('What we build'),
    para(
      'Orchestration graphs where every agent decision is logged with its inputs, its tool calls, and its confidence — so the audit conversation is a query, not an archaeology dig.',
    ),
    para(
      'Human checkpoints sit at the boundaries that carry legal or financial exposure. Everything else runs unattended, with a kill switch that actually works.',
    ),
    heading('What you get'),
    para(
      'A pilot in six weeks against one real workflow, a production rollout in a quarter, and a team that can extend it without us.',
    ),
  ]),
})

// =============================================================================================
// 4. model — no detail route; renders inside the engagementSection block (see the /test page).
// =============================================================================================
const modelId = await upsert('model', {
  title: 'Test Model — Embedded Pod',
  excerpts:
    'Test fixture. A cross-functional pod that joins your delivery org, ships against your board, and reports to your leads.',
  thumbnail: img(),
  content: rt(
    'An embedded pod is four to six Ternary engineers who work inside your process rather than beside it: your standups, your board, your definition of done.',
    'Best when you have the roadmap and the domain knowledge but not the delivery capacity, and you want the capability to remain in-house afterwards.',
  ),
})

// =============================================================================================
// 5. scale — no detail route; renders inside the scaleShowcase block (see the /test page).
//    panelType 'sprint' so the sprint-log panel is exercised.
// =============================================================================================
const scaleId = await upsert('scale', {
  title: 'Test Scale — Strike Team',
  subTitle: 'Fastest path to a shipped increment',
  excerpts: 'Test fixture. Two to four engineers, a two-week cycle, and a working increment at the end of every one.',
  description: rt(
    'A strike team is what you deploy when the problem is sharp and the deadline is real: a small, senior pod with the authority to make calls without a steering committee.',
  ),
  tags: 'Sprint · 2–4 engineers · 6–12 weeks',
  thumbnail: img(),
  image: img(),
  panelType: 'sprint',
  podSize: [
    { title: 'Pod size', value: '2–4 engineers' },
    { title: 'Engagement', value: '6–12 weeks' },
    { title: 'Cadence', value: '2-week sprints' },
  ],
  sprintMeta: {
    statusLabel: 'Live sprint · day 23',
    cadenceLabel: 'cycle 1.8d · lead 6h',
  },
  showUp: [
    { number: '01', title: 'Day 0 — Immersion', subtext: 'We read the code before we opine on it.' },
    { number: '02', title: 'Day 3 — First increment', subtext: 'Something real is running in your environment.' },
    { number: '03', title: 'Day 10 — Cadence', subtext: 'Ship, review, adjust. Every two weeks, without exception.' },
  ],
  sprintLog: [
    { day: 'D23', label: 'Event schema v2 rolled out', status: 'shipped' },
    { day: 'D24', label: 'Replay tooling for the consumer group', status: 'in-review' },
    { day: 'D25', label: 'Backpressure on the ingest path', status: 'in-build' },
    { day: 'D26', label: 'Load test at 4× peak', status: 'queued' },
  ],
})

// =============================================================================================
// 6. insight — /insights/test  (drafts enabled → must be published explicitly)
// =============================================================================================
const insightId = await upsert('insight', {
  _status: 'published',
  title: 'Test Insight — Why your event bus became a distributed monolith',
  code: 'CS-014',
  author: teamId,
  publishedDate: new Date('2026-05-18').toISOString(),
  readTime: '8 min',
  categoryLabel: 'Engineering Studio',
  excerpts:
    'Test fixture. Microservices that all block on the same topic are a monolith with a network hop in the middle — and worse latency.',
  thumbnail: img(),
  tags: [{ name: 'Architecture' }, { name: 'Event-driven' }, { name: 'Migration' }],
  leadParagraph: rt(
    'The promise of the event bus was decoupling. What most teams get instead is a monolith with a network hop bolted into the middle of it — all the coordination cost of the original system, plus a serialization tax.',
  ),
  content: doc([
    heading('The tell'),
    para(
      'You can spot it in the deploy order. If service C must ship before service B, and B before A, the services are not independent — they are modules that happen to be separated by a broker.',
    ),
    heading('How it happens'),
    para(
      'Almost always the same way: teams publish commands instead of facts. "ChargeCustomer" is a command; it names what the consumer must do, so the producer now owns the consumer\'s behaviour. "PaymentAuthorized" is a fact; the consumer decides what it means.',
    ),
    para(
      'Once commands are on the bus, every new consumer is a negotiation with the producer, and the coupling you were trying to remove has simply moved into the schema registry.',
    ),
    heading('The fix is boring'),
    para(
      'Publish facts. Version them additively. Make consumers idempotent and replayable, so a bad deploy is recovered by replaying the log rather than by a coordinated rollback across four teams.',
    ),
    para(
      'None of this is novel. It is just unglamorous enough that it tends to lose the argument to whichever framework is trending that quarter.',
    ),
  ]),
  relatedInsights: {
    heading: 'Related reading',
    description: rt('More from the engineering studio.'),
    insights: relInsights,
  },
  cta: cta('Have an event bus that outgrew its design?'),
})

// =============================================================================================
// 7. pressRelease — /press-release/test  (drafts enabled → publish explicitly)
// =============================================================================================
const pressId = await upsert('pressRelease', {
  _status: 'published',
  title: 'Test Press Release — Ternary opens an agentic engineering practice in Dhaka',
  badge: 'Company News',
  code: 'PR-026',
  releaseDate: new Date('2026-06-02').toISOString(),
  datelineLocation: 'Dhaka, Bangladesh',
  excerpts:
    'Test fixture. The new practice pairs agent orchestration with the audit and compliance scaffolding regulated clients require.',
  readTime: '5 min',
  categoryLabel: 'Company News',
  thumbnail: img(),
  tags: [{ name: 'Company' }, { name: 'Agentic' }, { name: 'Expansion' }],
  leadParagraph: rt(
    'Ternary today announced a dedicated agentic engineering practice, headquartered in Dhaka and staffed by senior engineers drawn from its platform and data pods.',
  ),
  content: doc([
    para(
      'The practice will focus on production agent systems for regulated industries, where the constraint is rarely model quality and almost always traceability: who decided what, on which inputs, and can it be reconstructed a year later.',
    ),
    heading('Why now'),
    para(
      'Client pilots have moved from proof-of-concept to production faster than tooling for oversight has matured. The practice exists to close that gap rather than to chase benchmark scores.',
    ),
    heading('Availability'),
    para('Engagements begin in Q3 2026, with a six-week discovery format available immediately.'),
  ]),
  quotes: [
    {
      quote:
        'The interesting problem is no longer whether an agent can do the task. It is whether you can explain, six months later, why it did.',
      name: 'Test Rahman',
      role: 'Principal Engineer · Ternary',
    },
    {
      quote: 'We wanted a partner who treated the audit trail as a feature, not as paperwork. That is a short list.',
      name: 'A. Karim',
      role: 'Chief Technology Officer · Counterfoil',
    },
  ],
  releaseFacts: {
    forImmediateRelease: 'Yes',
    embargo: 'None',
    distribution: 'Global',
    mediaKit: img(),
    mediaKitSizeLabel: '24 MB',
  },
  pressContact: {
    heading: 'Press & analyst contact',
    description: rt('For interviews, executive commentary, or briefing requests, reach the team directly.'),
    press: {
      name: 'Test Press Office',
      title: 'Head of Communications',
      email: 'press@example.com',
      phone: '+880 1700 000000',
    },
    analyst: {
      name: 'Test Analyst Relations',
      title: 'Director, Analyst Relations',
      email: 'analysts@example.com',
      website: 'https://example.com/analysts',
    },
    mediaKitDescription: 'Logos, executive headshots, product screenshots, brand guidelines',
    socialLinks: {
      twitter: 'https://x.com/ternary',
      linkedin: 'https://www.linkedin.com/company/ternary',
      website: 'https://example.com',
    },
  },
  relatedPressReleases: {
    heading: 'More announcements',
    description: rt('Recent news from Ternary.'),
    pressReleases: relPress,
  },
})

// =============================================================================================
// 8. story — /case-studies/test  (drafts enabled → publish explicitly)
// =============================================================================================
const storyId = await upsert('story', {
  _status: 'published',
  title: 'Test Case Study — Six days to four hours on a claims platform',
  excerpts:
    'Test fixture. A 12-year-old claims monolith priced a policy change in six days. Eleven weeks later it took an afternoon.',
  thumbnail: img(),
  tags: [{ name: 'Event-driven architecture' }, { name: 'Strangler-fig migration' }, { name: 'Regulated' }],
  caseMeta: {
    industry: 'Insurance',
    engagement: 'Embedded pod',
    duration: '11 weeks',
    team: '5 engineers',
    year: '2025',
  },
  content: doc([
    heading('The problem'),
    para(
      'Pricing logic lived in 40,000 lines of stored procedures that three people understood and none of them fully. A rate change meant a six-day cycle of manual regression testing, and the compliance team could not get a straight answer about which version had priced any given policy.',
    ),
    heading('The approach'),
    para(
      'We put an anti-corruption layer in front of the pricing path, lifted the rules into an event-sourced service, and shadow-ran it against live production traffic for six weeks — comparing every output against the legacy engine before a single customer saw the new path.',
    ),
    para(
      'Disagreements between the two engines were treated as findings, not bugs to be smoothed over. Eleven of them turned out to be latent defects in the original system.',
    ),
    heading('The outcome'),
    para(
      "Rate changes now ship in an afternoon. Every priced policy carries the exact rule version that produced it, so the compliance answer is a lookup. The client's own engineers have shipped four rule changes since we left, without us.",
    ),
  ]),
})

// =============================================================================================
// 9. legal — /legals/test
// =============================================================================================
await upsert('legal', {
  title: 'Test Legal Document — Acceptable Use Policy',
  code: 'LEG-TEST',
  lastupdated: 'Last updated 12 June 2026',
  downloadLink: '/legals/test',
  menuLabel: 'Test Policy',
  menuIcon: 'shield',
  menuOrder: 99,
  content: doc([
    para(
      'This is a test fixture, not a real policy. It exists so the Legal Center layout can be reviewed with representative body copy in place.',
    ),
    heading('1. Scope'),
    para(
      'This policy applies to everyone who accesses the services, whether under a signed agreement, a trial, or an evaluation licence.',
    ),
    heading('2. Acceptable use'),
    para(
      "You may not use the services to break the law, to interfere with anyone else's use of them, or to attempt access to systems or data you have not been authorised to reach.",
    ),
    heading('3. Security research'),
    para(
      'Good-faith security research is welcome and will not be met with legal action, provided it is reported through the disclosure channel and does not degrade the service for anyone else.',
    ),
    heading('4. Enforcement'),
    para(
      'We will contact you before suspending access, except where a delay would put other customers or their data at risk.',
    ),
  ]),
  cta: cta('Questions about this policy?'),
})

// =============================================================================================
// 10. pages — /test. The showcase page: surfaces the collections that have NO detail route
//     (scale, model, team) plus the newly-seeded story/insight/press release.
// =============================================================================================
const pageLayout = [
  {
    blockType: 'heroFeatured',
    thesis: 'Test fixture — every card, panel, and pod below is seeded, not real.',
    headline: 'Test Showcase.\nEvery collection, one page.',
    items: [
      ...(storyId ? [{ relationTo: 'story', value: storyId }] : []),
      ...(insightId ? [{ relationTo: 'insight', value: insightId }] : []),
      ...(pressId ? [{ relationTo: 'pressRelease', value: pressId }] : []),
    ],
  },
  {
    blockType: 'scaleShowcase',
    scales: scaleId ? [scaleId] : [],
  },
  {
    blockType: 'engagementSection',
    heading: 'Engagement models',
    description: rt('How a Ternary pod plugs into your delivery org — the `model` collection renders here.'),
    model: modelId ? [modelId] : [],
  },
  {
    blockType: 'careersTeam',
    heading: 'Team voices',
    description: rt('The `team` collection renders here — there is no per-member detail route.'),
    members: teamId ? [{ member: teamId, wide: true }] : [],
  },
  {
    blockType: 'industriesSection',
    industries: relIndustries,
  },
  {
    blockType: 'ctaBlock',
    ...cta('This is what the CMS looks like when it is full.'),
  },
]

await upsert('pages', {
  _status: 'published',
  title: 'Test Showcase',
  layout: pageLayout,
})

payload.logger.info(DRY ? 'DRY RUN complete — nothing written.' : 'Seed complete.')
payload.logger.info('Industry has its own seeder: pnpm payload run ./scripts/seed-test-industry.ts')
process.exit(0)
