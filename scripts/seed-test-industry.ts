// Seed a single `test` industry whose `layout` reproduces the industry-detail Figma
// (node 1279-4879) using the existing redesign blocks. Idempotent: upserts ONLY the `test`
// slug (create if absent, else update). No other rows are written or deleted.
//
//   pnpm payload run ./scripts/seed-test-industry.ts            # write to DATABASE_URI
//   SEED_DRY=1 pnpm payload run ./scripts/seed-test-industry.ts # preview (no writes)
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY === '1'
const ctx = { disableRevalidate: true }

// ---- Lexical richText (matches scripts/seed-deck-content.ts) ---------------
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
const lexical = (paras: string[]) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr' as const, children: paras.map(para) },
})

const payload: Payload = await getPayload({ config })
payload.logger.info(`Seed test industry ${DRY ? '(DRY RUN)' : '(WRITING)'}`)

// The makeContentCollection afterChange hook calls Next's revalidateTag(), which throws outside a
// request context. The DB write commits before the hook runs, so swallow only that error.
const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

// Read-only: pull up to 8 existing industries (excluding `test`) to populate the benefit-grid
// relationship. If none exist the IndustriesSection block self-returns null (graceful).
const others = await payload.find({
  collection: 'industry',
  where: { slug: { not_equals: 'test' } },
  limit: 8,
  depth: 0,
})
const industryIds = others.docs.map((d) => d.id)
payload.logger.info(`  benefit grid → ${industryIds.length} related industries`)

// ---- The Figma layout -----------------------------------------------------
const layout = [
  // Intro (1279:4891) — centered headline + description.
  {
    blockType: 'industriesHero',
    heading: "Industries we've helped rewrite.",
    description:
      "Deep category expertise paired with institutional engineering velocity. We don't just write code; we solve existential business problems.",
  },

  // Benefit grid (1283:2668) — flush 4-column industry cards from related rows (no heading,
  // no left gutter, per Figma).
  {
    blockType: 'industriesSection',
    industries: industryIds,
    fullWidth: true,
  },

  // Operators statement (1279:4961) — left heading/desc, right paragraphs.
  {
    blockType: 'industriesDetails',
    heading: "Led by operators who've shipped.",
    description:
      'Led by senior engineers and operators who have shipped category-defining products — now turning that playbook toward an agentic world.',
    content: lexical([
      "We are standing at the threshold of the agentic era. For the first time in history, software isn't just processing instructions; it's orchestrating actions, making decisions, and executing complex workflows autonomously.",
      "We are standing at the threshold of the agentic era. For the first time in history, software isn't just processing instructions; it's orchestrating actions, making decisions, and executing complex workflows autonomously.",
      "We are standing at the threshold of the agentic era. For the first time in history, software isn't just processing instructions; it's orchestrating actions, making decisions, and executing complex workflows autonomously.",
    ]),
  },

  // Industry showcase panels (1459:5344 ×4) — eyebrow/title/desc + "What we build" checklist + gradient.
  {
    blockType: 'industryPanels',
    items: [
      {
        title: 'Banking & Capital Markets',
        description:
          'Capital markets reward microseconds and punish ambiguity. We design execution paths measured in microseconds and audit trails measured in years. Trade execution paths, real-time risk engines, and surveillance hooks that evolve as a single product — not siloed tools bolted onto a legacy core.',
        tags: [
          { name: 'Sub-millisecond order routing & matching' },
          { name: 'Immutable audit trails with regulator-ready exports' },
          { name: 'Quant-aware platform pods, not vendor middleware' },
        ],
      },
      {
        title: 'Healthcare & Life Sciences',
        description:
          'Patient outcomes and clinical safety set the bar; compliance is the floor, not the ceiling. We build platforms where privacy, traceability, and uptime are architectural, not bolted on after audit.',
        tags: [
          { name: 'HIPAA / HITRUST-aligned data planes by default' },
          { name: 'Interoperable HL7 / FHIR integration surfaces' },
          { name: 'Evidence-grade audit logging end to end' },
        ],
      },
      {
        title: 'Advanced Manufacturing',
        description:
          'The factory floor and the cloud are converging. We connect OT and IT into one observable system so plant data drives decisions in real time rather than landing in a quarterly report.',
        tags: [
          { name: 'Real-time OT/IT telemetry pipelines' },
          { name: 'Predictive maintenance & anomaly detection' },
          { name: 'Digital-twin simulation environments' },
        ],
      },
      {
        title: 'Public Sector',
        description:
          'Citizen services demand resilience, accessibility, and accountability at national scale. We deliver modern platforms that meet stringent procurement and security controls without sacrificing pace.',
        tags: [
          { name: 'FedRAMP-aligned, zero-trust infrastructure' },
          { name: 'Accessible, WCAG-compliant service design' },
          { name: 'Transparent, auditable decision systems' },
        ],
      },
    ],
  },

  // Structural leverage (1291:3163) — image slot + 2 feature cards + benefits row.
  {
    blockType: 'crossIndustryPatterns',
    heading: 'Structural leverage',
    description:
      'Deep category expertise is only powerful if it compounds. Our cross-industry leverage means a pattern proven in one regulated vertical accelerates the next — applying structural leverage across boundaries.',
    items: [
      {
        title: 'Agentic Orchestration',
        excerpt:
          'Moving from hard-coded workflows to dynamic, AI-orchestrated systems that plan, decide, and act across your stack.',
      },
      {
        title: 'Audit-by-Default',
        excerpt:
          'We design data layers where immutability and full traceability are intrinsic to the architecture, not an afterthought.',
      },
      {
        title: 'Zero-Trust Boundaries',
        excerpt:
          'We implement stringent identity-based access controls on enterprise assets regardless of where they sit.',
      },
      {
        title: 'Strangler-Fig Migration',
        excerpt:
          'We incrementally decouple and modernize monolithic systems into microservices without risking production downtime.',
      },
    ],
  },

  // Institutional compliance (1291:3222) — 3 icon cards.
  {
    blockType: 'regulatoryPosture',
    heading: 'Institutional compliance, baked into the pipeline.',
    description:
      'Particularly critical for FS&I, Healthcare, and Public Sector. We deploy immutable infrastructure that maps directly to regulatory controls out-of-the-box.',
    items: [
      {
        icon: 'lock',
        title: 'SOC2 Type II / FedRAMP Certified',
        excerpt: 'Controls and evidence collection wired into the delivery pipeline, not retrofitted before an audit.',
      },
      {
        icon: 'activity',
        title: 'HIPAA / HITRUST Compliant',
        excerpt: 'Protected data handled under continuous monitoring, with traceability across every system boundary.',
      },
      {
        icon: 'check',
        title: 'PCI-DSS Level 1 Infrastructure',
        excerpt: 'Payment-grade segmentation and hardening baked into the platform from the first commit.',
      },
    ],
  },

  // CTA (1279:5283) — "Skip the generalists" purple-gradient banner with two buttons.
  {
    blockType: 'ctaBlock',
    heading: 'Skip the generalists.',
    description:
      'Your industry has specific velocity and compliance constraints. Talk to an engineering leader who speaks your language from day one.',
    button_1: { label: 'Book Industry Discovery', link: '/contact' },
    button_2: { label: 'Find your Lead', link: '/contact' },
  },
]

const data: Record<string, unknown> = {
  title: 'Test Industry',
  excerpts: 'A test industry showcasing the redesigned, block-driven detail page.',
  layout,
}

// Loosely-typed handle (mirrors scripts/seed-deck-content.ts) so the block `layout` — whose
// `blockType` strings widen to `string` — is accepted without per-block casts.
const db = payload as unknown as {
  find: (args: Record<string, unknown>) => Promise<{ docs: { id: string | number }[] }>
  create: (args: Record<string, unknown>) => Promise<unknown>
  update: (args: Record<string, unknown>) => Promise<unknown>
}

const existing = await db.find({ collection: 'industry', where: { slug: { equals: 'test' } }, limit: 1, depth: 0 })

if (DRY) {
  payload.logger.info(`  would ${existing.docs[0] ? 'UPDATE' : 'CREATE'} industry "test" with ${layout.length} blocks`)
} else {
  await ignoreRevalidate(() =>
    existing.docs[0]
      ? db.update({ collection: 'industry', id: existing.docs[0].id, data, context: ctx })
      : db.create({ collection: 'industry', data: { slug: 'test', ...data }, context: ctx }),
  )
  const after = await db.find({ collection: 'industry', where: { slug: { equals: 'test' } }, limit: 1, depth: 0 })
  payload.logger.info(`  ${existing.docs[0] ? 'updated' : 'created'} industry "test" (id ${after.docs[0]?.id})`)
}

payload.logger.info('Seed test industry complete.')
process.exit(0)
