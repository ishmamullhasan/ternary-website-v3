// Insights: two lesson-style editorial retellings (STAGING cluster) — created strictly from the
// approved case-study source material in audit/case-studies/SOURCES.md. Logged in COPY_CHANGELOG.md.
//
//   1. "The Model Is the Easy Part: Lessons from an Air-Gapped LLM in Capital Markets"
//      ← LBS LINDA sections (air-gapped LLM + governed application layer pattern)
//   2. "Unify the Domain Before You Automate It: Lessons from an Event-Driven Replatform"
//      ← Counterfoil sections (domain-first sequencing, event-driven services, governed AI)
//
// House rules: plain language, no metrics/numbers-as-boasts, no invented facts, no client-internal
// details. EN only — bn translation is a logged follow-up (Payload falls back to en).
//
// Docs are created `_status: 'published'` so the staging review site renders them, with a matching
// `_insight_versions` snapshot (latest: true) so an admin edit/republish behaves normally.
// Idempotent — upserts by slug; safe to re-run.
//
// Run: mongosh "<staging URI>/ternary-local" --file scripts/seed-insights-case-lessons.js

const now = new Date()

// ---- Lexical helpers ---------------------------------------------------------------------------
const T = (text) => ({ type: 'text', version: 1, text, detail: 0, format: 0, mode: 'normal', style: '' })
const P = (text) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children: [T(text)],
})
const H = (text) => ({
  type: 'heading',
  tag: 'h3',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: [T(text)],
})
const root = (nodes) => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: nodes },
})
const tagRows = (labels) => labels.map((name) => ({ name: { en: name }, id: new ObjectId().toString() }))

// ---- The two articles --------------------------------------------------------------------------
const INSIGHTS = [
  {
    slug: 'lessons-from-an-air-gapped-llm-in-capital-markets',
    code: 'INS-006',
    title: 'The Model Is the Easy Part: Lessons from an Air-Gapped LLM in Capital Markets',
    publishedDate: new Date('2026-07-22T00:00:00Z'),
    readTime: '5 min',
    categoryLabel: 'Applied AI',
    tags: ['Applied AI', 'Governance', 'Capital markets'],
    excerpt:
      'When LankaBangla Securities wanted AI in daily brokerage workflows, the deployment pattern mattered more than the model: an air-gapped runtime, a governed application layer, and two concrete functions shipped on one reusable foundation.',
    lead: 'LankaBangla Securities had rich client and market data — and no way to reach it without a technical intermediary. Getting AI into that environment was never a modeling problem. It was an architecture problem.',
    content: [
      H('Two gaps, one constraint'),
      P(
        "The firm faced a dual gap. Dealer-brokers spent too much time gathering and synthesizing dispersed information before they could act. Retail marketing, meanwhile, risked irrelevance whenever messaging wasn't tied to account state and trading behavior. And over both sat a hard constraint: in a regulated capital-markets institution, free-form AI access to production data — or sending sensitive data to public AI endpoints — was never an option.",
      ),
      H('The boundary comes first'),
      P(
        "The answer started at the boundary, not the model. An open-source LLM was deployed in an air-gapped environment, so inference — and the sensitive data feeding it — stays inside the institution's own walls. With boundary control solved, the real work began: an application layer that mediates every interaction with the model.",
      ),
      H('A governed layer does the heavy lifting'),
      P(
        'That layer is the control plane. Natural-language requests resolve to pre-approved, read-only query templates; the model never touches production data directly; role-based visibility decides who sees what; and every interaction is logged. The model provides capability. The layer provides trust.',
      ),
      H('Ship something concrete, early'),
      P(
        'Two functions went first: an assistant that lets dealer-brokers retrieve and synthesize information inside their decision windows, and marketing automation for retail traders that adapts messaging to trading behavior and account context. Both run on the same platform substrate — which means the next function reuses the governance, orchestration, and integration patterns instead of rebuilding them.',
      ),
      H('What we took away'),
      P(
        'In regulated environments, AI adoption succeeds when architecture and workflow design are treated as one problem. Air-gapping addresses boundary control, but the business value comes from the layer that converts model capability into role-specific, auditable execution.',
      ),
      P(
        'The second lesson is sequencing. Shipping two concrete functions early, on a reusable core, creates momentum while preserving long-term scalability. The institution got practical AI without regulatory exposure — and a foundation ready for whatever function comes next.',
      ),
    ],
  },
  {
    slug: 'unify-the-domain-before-you-automate-it',
    code: 'INS-007',
    title: 'Unify the Domain Before You Automate It: Lessons from an Event-Driven Replatform',
    publishedDate: new Date('2026-07-28T00:00:00Z'),
    readTime: '5 min',
    categoryLabel: 'Platform Engineering',
    tags: ['Platform engineering', 'Event-driven architecture', 'Revenue operations'],
    excerpt:
      "Counterfoil's Continuum platform holds a lesson for anyone replatforming revenue operations: normalize the domain first, keep rule boundaries explicit and observable, and layer intelligence only where it can be trusted.",
    lead: 'Experience-economy operators were running revenue-critical work across disconnected booking, pricing, and distribution tools. Counterfoil set out to replace that fragmentation with one operating layer — and the order in which the system was built mattered as much as what was built.',
    content: [
      H('The problem was never just legacy software'),
      P(
        'What was missing was a control layer. Operators had no reliable way to fuse demand signals with inventory constraints and pricing strategy, so high-impact questions — when to adjust price, where to shift inventory exposure, how to balance direct channels against marketplaces — were answered manually or not at all. The costs showed up as yield leakage, operating drag, and governance gaps.',
      ),
      H('Domain clarity before model complexity'),
      P(
        'The implementation sequence put domain modeling first. Inventory semantics, availability windows, pricing constraints, and channel policies were normalized before any recommendation or optimization logic was introduced. That ordering is the point: optimization built on unclear semantics produces fragile systems, while unified semantics make every later feature cheaper to add.',
      ),
      H('Events as the seams of the system'),
      P(
        'Modular contracts and event-driven workflows reduced coupling between operational domains. Pricing logic, channel logic, and reporting evolve independently while sharing one canonical data backbone — and the platform reacts to demand and operational events in near real time while preserving a clear audit trail of decisions.',
      ),
      H('Intelligence inside policy boundaries'),
      P(
        'AI entered last, and deliberately constrained. Recommendations are generated within policy boundaries defined by business rules — observable, auditable, and override-capable — so operators keep decision authority. That avoids the common failure mode of AI projects: opaque automation without operational trust.',
      ),
      H('What we took away'),
      P(
        'AI in revenue operations works best as governed infrastructure, not decorative automation. The durable pattern is explicit domain modeling, deterministic rule boundaries, and intelligence layered only where it can be validated and iterated.',
      ),
      P(
        'And sequencing is strategy: unifying operational semantics before chasing optimization breadth prevented brittle systems — and left the platform able to take on new pricing logic, connectors, and analytics without a rewrite.',
      ),
    ],
  },
]

// ---- Apply -------------------------------------------------------------------------------------
const versions = db.getCollection('_insight_versions')

for (const spec of INSIGHTS) {
  const fields = {
    title: { en: spec.title },
    generateSlug: false,
    slug: spec.slug,
    code: spec.code,
    publishedDate: spec.publishedDate,
    readTime: { en: spec.readTime },
    categoryLabel: { en: spec.categoryLabel },
    excerpts: { en: spec.excerpt },
    tags: tagRows(spec.tags),
    leadParagraph: { en: root([P(spec.lead)]) },
    content: { en: root(spec.content) },
    _status: 'published',
    updatedAt: now,
  }

  const existing = db.insights.findOne({ slug: spec.slug })
  let id
  if (existing) {
    db.insights.updateOne({ _id: existing._id }, { $set: fields })
    id = existing._id
    print('insights.' + spec.slug + ' → updated')
  } else {
    id = new ObjectId()
    db.insights.insertOne(Object.assign({ _id: id, createdAt: now }, fields))
    print('insights.' + spec.slug + ' → created (' + spec.code + ')')
  }

  // Version snapshot (latest) so admin edit/republish behaves normally and can't resurrect
  // stale copy. Any previous snapshots for this parent lose `latest`.
  const snapshot = Object.assign({}, fields, { createdAt: existing ? existing.createdAt : now })
  versions.updateMany({ parent: id }, { $unset: { latest: '' } })
  const latest = versions.find({ parent: id }).sort({ updatedAt: -1 }).limit(1).toArray()[0]
  if (latest) {
    versions.updateOne({ _id: latest._id }, { $set: { version: snapshot, latest: true, updatedAt: now } })
    print('  _insight_versions latest (' + latest._id + ') → synced')
  } else {
    versions.insertOne({ parent: id, version: snapshot, latest: true, createdAt: now, updatedAt: now })
    print('  _insight_versions → created')
  }
}

print('Done. ' + INSIGHTS.length + ' insights processed.')
