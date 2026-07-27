// Capability proof sections (STAGING cluster) — fill each capability's `caseStudies` group with
// REAL case studies mapped from the approved source writing. Logged in COPY_CHANGELOG.md.
//
// Sources of truth: audit/case-studies/SOURCES.md (extracted from the approved company-profile
// Word doc + the DSE engagement synthesis). House rules applied:
//   - meta = "Sector · Client" — real sectors and clients only, grounded in each doc
//   - problem / approach / outcome: 1–2 plain sentences each, strictly from the source docs
//   - NO metrics: metricValue / metricLabel intentionally left unset (the page hides the result
//     line when empty — an empty proof slot beats a vague one)
//   - no invented facts, no numbers-as-boasts
//
// Mapping (refined per sources):
//   agentic-architecture    ← LankaBangla LINDA, Hissho SushiOps360
//   artificial-intelligence ← LankaBangla LINDA, Alley Analytix
//   data-analytics          ← Alley Analytix, Counterfoil
//   cloud-transformation    ← Hissho (Azure modernization), FAR Oil & Gas (AWS migration)
//   platformization         ← Counterfoil, Turfly
//   digital-experiences     ← Dhaka Stock Exchange, Flex5 (RMS), DoYouWork (Amistee)
//   devops-automation       ← Counterfoil, Turfly
//   internet-of-things      ← Alley Analytix
//
// EN only — bn falls back to en (Payload fallback: true); bn translation is a logged follow-up.
// Idempotent — the full caseStudies group is $set deterministically; safe to re-run.
//
// Run: mongosh "<staging URI>/ternary-local" --file scripts/seed-proof-sections.js

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
const root = (nodes) => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: nodes },
})
const rich = (text) => ({ en: root([P(text)]) })

// One case-study row. Metric fields are intentionally NOT set (no invented numbers).
const item = (meta, title, problem, approach, outcome) => ({
  id: new ObjectId().toString(),
  meta: { en: meta },
  title: { en: title },
  problem: rich(problem),
  approach: rich(approach),
  outcome: rich(outcome),
})

// Shared section frame — same quiet register on all 8 pages.
const frame = (items) => ({
  sectionLabel: { en: 'Proof' },
  heading: { en: 'Work behind this practice' },
  description: { en: root([P('A few engagements where this practice did the heavy lifting.')]) },
  items,
})

// ---- Per-capability proof rows -----------------------------------------------------------------
const PROOF = {
  'agentic-architecture': frame([
    item(
      'Capital markets · LankaBangla Securities',
      'A governed AI assistant for dealer-brokers',
      'Dealer-brokers needed synthesized answers inside tight decision windows, but free-form AI access to production data was never an option in a regulated institution.',
      'We built a governed pipeline in which natural-language requests resolve to pre-approved, read-only query templates — the model never touches production data directly, and every interaction is logged.',
      'Brokers move from question to synthesized answer in one conversational step, and the same governed layer is the base for every AI function the firm adds next.',
    ),
    item(
      'Food service & franchise · Hissho Sushi',
      'Recommendations people can override — with a reason',
      'Franchise intelligence existed, but recommendations only matter if store teams can act on them quickly without surrendering judgment or accountability.',
      'We shaped workflows where AI recommendations arrive inside role-aware surfaces that let users review context, override with a reason, and follow through — every action leaving an audit trail.',
      'Intelligence becomes repeatable daily behavior in stores, with human control and traceability preserved at every step.',
    ),
  ]),

  'artificial-intelligence': frame([
    item(
      'Capital markets · LankaBangla Securities',
      'An air-gapped LLM for a regulated brokerage',
      'The institution wanted practical AI in daily workflows without exposing client or market data to public AI endpoints.',
      'We deployed an open-source LLM in an air-gapped environment and built an extensible application layer over it, shipping a dealer-broker assistant and behavior-aware marketing automation as the first two functions.',
      'AI adoption without regulatory exposure — and a reusable foundation that takes on new functions without re-architecting the platform.',
    ),
    item(
      'Sports technology · Alley Analytix',
      'Physics-first machine learning inside a bowling ball',
      'Professional-grade motion metrics had to come from a sensor riding inside a rolling ball — a hostile measurement environment where naive readings distort and results must stand up to coaching and patent scrutiny.',
      'We anchored every metric in deterministic, physics-grounded signal processing, validated predictions against simulation with known ground truth, and layered a context-aware AI assistant that turns telemetry into coaching guidance.',
      'Measurement became decision support: coaches get explainable analytics and contextual answers rather than raw numbers.',
    ),
  ]),

  'data-analytics': frame([
    item(
      'Sports technology · Alley Analytix',
      'From raw telemetry to coaching intelligence',
      'Streams of noisy sensor data meant little on their own — players and coaches needed interpretable metrics and development trends, not raw signals.',
      'We built the full analytics path: a motion-intelligence pipeline that corrects, fuses, and classifies each throw, cloud ingestion designed for large simultaneous player populations, and dashboards that track development over time.',
      'Coaches read progression across sessions instead of judging throw by throw, on a platform built to keep scaling.',
    ),
    item(
      'Experience economy · Counterfoil',
      'One data backbone for pricing, inventory, and channels',
      'Revenue-critical data sat fragmented across booking, pricing, and distribution tools, so operators could not see how one decision affected the others.',
      'We normalized the operating domain into one canonical data backbone, with a data layer designed to serve both transactional execution and the analytical feedback loops that refine rules over time.',
      'Operators manage pricing, inventory, and channel exposure as connected levers, with decisions informed by shared, current data.',
    ),
  ]),

  'cloud-transformation': frame([
    item(
      'Food service & franchise · Hissho Sushi',
      'An Azure platform spine for franchise scale',
      'Legacy patterns made iteration slower than the business required, and modernization could not be allowed to disrupt daily operations across a national franchise network.',
      'We drove an Azure-centered modernization with environment isolation, API-first service boundaries, disciplined promotion pathways, and observability treated as a baseline requirement — delivered in phased increments.',
      'A platform baseline that supports steady feature movement with greater confidence in production behavior, and clear readiness for the AI and automation layers to come.',
    ),
    item(
      'Oil & gas · FAR Oil & Gas',
      'From local servers to a cloud-hosted ERP',
      'An operations-critical ERP program needed infrastructure that could serve multiple drilling sites and group companies without the burden of maintaining local servers.',
      'We developed locally, then migrated the Odoo-centered system to AWS, sequencing the move so business continuity was never at risk.',
      'The company runs its approvals, reconciliation, and reporting on cloud infrastructure that scales with the group instead of anchoring it.',
    ),
  ]),

  platformization: frame([
    item(
      'Experience economy · Counterfoil',
      'One platform for every kind of experience venue',
      'Escape rooms, concert venues, museums, and tours each run different capacity and pricing models — and existing software forced every business to bend around the tool.',
      'We designed an abstract product model that represents any experience, a configurable pricing engine that supports new scenarios without a code deployment, and a multi-tenant architecture with complete data isolation.',
      'New venue types come online through configuration rather than custom code, on a single codebase serving every customer.',
    ),
    item(
      'Sports & entertainment · Turfly',
      'A booking marketplace built as a platform',
      'A real-time marketplace had to hold together instant bookings that can never double-book, demand-responsive pricing, and payments across a fragmented national landscape.',
      'We built the complete stack as one platform: an atomic booking engine at the core, configurable pricing rules for operators, and payment integrations treated as first-class platform concerns.',
      'Players book instantly, operators price against real demand, and conflicts are designed out at the engine level rather than patched after the fact.',
    ),
  ]),

  'digital-experiences': frame([
    item(
      'Capital markets · Dhaka Stock Exchange',
      'A national exchange, rebuilt without losing a data point',
      "The exchange's public presence had grown into a sprawling legacy system — pages of market data, disclosures, and investor resources on an aging stack, where a mis-transcribed figure is a compliance problem, not a cosmetic one.",
      'We established a complete design language first — including a hard convention reserving green and red exclusively for market movement — then rebuilt page by page under strict fidelity rules: no invented pages, no lost information, verbatim data labels.',
      'A modern, content-managed public platform that preserves institutional information exactly while modernizing the design, the mobile experience, and the publishing workflow around it.',
    ),
    item(
      'Digital health · Reality Meets Science',
      'Consumer-grade health experiences on HIPAA-grade rails',
      'Flex5 had to feel intuitive and motivating for daily users while satisfying enterprise stakeholders who expect regulated-data handling and auditability.',
      'We layered the product deliberately: a frictionless mobile experience on top, strictly managed platform services underneath, with compliance controls embedded in the architecture from day one.',
      'A launched digital-health platform that reads as effortless to users and as governed to enterprise reviewers — with room to grow modules without replatforming.',
    ),
    item(
      'Field services · Amistee',
      'Self-service for the field, visibility for managers',
      'Field technicians had no self-service path for routine requests, and managers had no central view of schedules, vehicles, or approvals — everything ran on spreadsheets and paper.',
      'We designed for both audiences at once: low-friction mobile submissions for employees, structured approval queues for managers, with roles and location boundaries enforced at the API rather than by convention.',
      'Routine requests move from the field to approval inside one system, and the paperwork that used to carry the business is gone.',
    ),
  ]),

  'devops-automation': frame([
    item(
      'Experience economy · Counterfoil',
      'A release cadence the business can rely on',
      'A platform serving live venues has to keep shipping without breaking the businesses running on it — speed and stability could not trade off against each other.',
      'We ran continuous integration and deployment from the start, with automated pipelines and a steady weekly release rhythm, keeping changes small, reversible, and observable.',
      'The platform evolves continuously in production, and releases became routine events rather than risks.',
    ),
    item(
      'Sports & entertainment · Turfly',
      'Infrastructure that absorbs the evening peak',
      'Demand concentrates into evening peaks, and the booking engine had to stay responsive under that load without a team babysitting servers.',
      'We built the operational layer on auto-scaling cloud infrastructure with automated deployment pipelines and monitoring wired in from day one.',
      'The system rides its daily demand curve on its own, and the team learns about problems from telemetry rather than from users.',
    ),
  ]),

  'internet-of-things': frame([
    item(
      'Sports technology · Alley Analytix',
      'A sensor platform that lives inside the ball',
      'Delivering professional-grade motion analytics meant putting sensing hardware inside a bowling ball — tight power budgets, wireless telemetry, hostile physics, and a form factor that had to survive real use.',
      'We engineered the embedded platform end to end: purpose-built sensing hardware miniaturized to a finger-grip form factor, low-energy wireless telemetry, and over-the-air firmware updates so devices in the field keep improving.',
      'Portable hardware replaced fixed lane-mounted infrastructure, and the device platform now feeds a full cloud analytics stack.',
    ),
  ]),
}

// ---- Apply -------------------------------------------------------------------------------------
for (const slug in PROOF) {
  const doc = db.capabilities.findOne({ slug })
  if (!doc) {
    print('!! capability not found: ' + slug + ' — skipped')
    continue
  }
  db.capabilities.updateOne({ _id: doc._id }, { $set: { caseStudies: PROOF[slug], updatedAt: now } })
  print('capabilities.' + slug + ' → caseStudies set (' + PROOF[slug].items.length + ' items)')
}

print('Done. ' + Object.keys(PROOF).length + ' capabilities processed.')
