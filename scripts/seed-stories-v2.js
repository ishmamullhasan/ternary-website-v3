// Stories copy pass v2 (STAGING cluster) — carry the approved Word-doc case-study narratives
// into the `stories` collection. Logged in COPY_CHANGELOG.md.
//
// Source of truth: audit/case-studies/SOURCES.md (extracted from
// "COMPANY PROFILE_ TERNARY  (1).docx"). House rules applied:
//   - story arc: context → challenge → approach → what we built → outcome
//   - NO quantified achievements (all numbers from the docs dropped)
//   - no invented facts: caseMeta duration/team/year cleared (previous values were
//     copy-pasted placeholders repeated across all 10 stories); industry/engagement
//     grounded in each doc's Type/segment line
//   - per-story hero tags grounded in each doc (previous tags were one duplicated set)
//
// Stories WITHOUT a doc (dhaka-stock-exchange, holcim): copy left substantively as-is,
// only restructured (heading labels) to match the arc; tags/caseMeta fixed from their
// own existing approved copy.
//
// EN only — bn narrative translation is a logged follow-up (tags/caseMeta bn set to the
// same values so the stale duplicated set can't linger in either locale).
//
// Idempotent — safe to re-run. Also syncs the latest _story_versions draft per story so
// an admin republish can't resurrect the old copy.
//
// Run: mongosh "<staging URI>/ternary-local" --file scripts/seed-stories-v2.js

const now = new Date()

// ---- Lexical helpers ---------------------------------------------------------------------------
const T = (text) => ({ type: 'text', version: 1, text, detail: 0, format: 0, mode: 'normal', style: '' })
const P = (text) => ({
  type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, textFormat: 0, textStyle: '',
  children: [T(text)],
})
const H = (text) => ({
  type: 'heading', tag: 'h3', version: 1, direction: 'ltr', format: '', indent: 0,
  children: [T(text)],
})
const root = (nodes) => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: nodes },
})
const tagRows = (labels) => labels.map((name) => ({ name, id: new ObjectId().toString() }))
const meta = (industry, engagement) => ({
  industry: { en: industry, bn: industry },
  engagement: { en: engagement, bn: engagement },
  duration: { en: '', bn: '' },
  team: { en: '', bn: '' },
  year: { en: '', bn: '' },
})

// ---- Per-story copy ----------------------------------------------------------------------------
const STORIES = {
  'counterfoil-continuum': {
    title: 'Counterfoil: AI Revenue Operations',
    excerpt:
      'With Counterfoil, Ternary built Continuum — an AI-native operating layer that brings pricing, inventory, and distribution together for experience-economy operators.',
    tags: ['Multi-tenant SaaS', 'Pricing engine', 'Event-driven services', 'AI-assisted decisioning'],
    caseMeta: meta('Experience economy', 'Flow — dedicated product team'),
    content: [
      P('Counterfoil is building an operating platform for the experience economy — museums, theme parks, tours, and entertainment venues across Bangladesh and the United States.'),
      H('The challenge'),
      P('Every operator runs differently. Escape rooms book hourly slots, concert venues sell assigned seats, museums offer timed entry, tours schedule departures — and existing software forces each business to bend its operations around the tool. Revenue-critical work sat in disconnected systems: booking in one place, pricing in another, channel distribution in a third, with slow decisions and fragmented data as the result.'),
      H('Our approach'),
      P("Ternary engaged as Counterfoil's dedicated engineering team under our Flow model. We put domain clarity before model complexity — normalizing inventory semantics, availability windows, pricing constraints, and channel policies first, then layering model-assisted recommendations only where they add value. Every automated decision stays inside explicit policy boundaries, observable and override-capable, so operators keep control."),
      H('What we built'),
      P('Continuum is an AI-native revenue operating layer that unifies pricing, inventory, and distribution in one extensible platform. An abstract product model represents any experience — per-timeslot, per-item, or per-seat — and a configurable pricing engine supports new scenarios without a code deployment. The platform is multi-tenant with complete data isolation, built as event-driven services behind API-first contracts, with payment rails for both Bangladesh and the US.'),
      H('The outcome'),
      P('Operators now manage pricing, inventory, and channel exposure as connected levers instead of separate administrative chores, and new venue types come online through configuration rather than custom code. The partnership continues, with Ternary extending the platform into deeper pricing intelligence, loyalty, and channel integrations.'),
    ],
  },

  turfly: {
    excerpt:
      "Ternary designed and built Turfly's complete stack — a real-time sports-facility booking marketplace with dynamic pricing and Bangladesh's full payment landscape built in.",
    tags: ['Mobile marketplace', 'Real-time booking', 'Dynamic pricing', 'Payment integration'],
    caseMeta: meta('Sports & entertainment', 'Flow — dedicated product team'),
    content: [
      P('In Bangladesh, booking a sports facility meant phoning turf after turf to check availability and waiting on confirmations. Players had no reliable way in; operators had empty slots, booking errors, and no view of demand.'),
      H('The challenge'),
      P("A real-time booking marketplace has to get several hard things right at once: bookings that confirm instantly and can never double-book under peak evening demand, pricing that responds to demand, payments across Bangladesh's fragmented landscape — bKash, Nagad, Rocket, SSLCommerz — and the social coordination that group sports actually run on."),
      H('Our approach'),
      P("Ternary designed and built Turfly's complete technology stack as a dedicated product team, shipping in weekly releases and iterating on direct feedback from players and operators."),
      H('What we built'),
      P('A cross-platform mobile app gives players real-time availability, holds a slot while payment completes, and handles invites, ratings, and notifications. Operators get a web dashboard with utilization analytics and configurable dynamic-pricing rules. Underneath, an atomic booking engine prevents conflicts, and the backend runs on cloud infrastructure built to absorb the evening peak.'),
      H('The outcome'),
      P('Booking a pitch became instant and reliable. Operators can finally see demand and price against it, double bookings are designed out at the engine level, and the platform is live in production with a steady release cadence.'),
    ],
  },

  'alley-analytix': {
    title: 'Alley Analytix: Bowling Intelligence',
    excerpt:
      "Ternary engineered Alley Analytix's motion-intelligence platform end to end — from a sensor that fits inside the ball to coach dashboards and a context-aware AI assistant.",
    tags: ['Embedded hardware', 'Motion intelligence', 'Coach dashboards', 'Contextual AI'],
    caseMeta: meta('Sports technology', 'Flow — product development'),
    content: [
      P('Measuring what a bowling ball actually does has traditionally required expensive lane-mounted systems. Alley Analytix set out to put professional-grade motion analytics inside the ball itself.'),
      H('The challenge'),
      P('A sensor riding inside a rolling ball is a hostile measurement environment. Off-center placement introduces centripetal artifacts that distort naive readings, motion states change in an instant, signal drift accumulates, and the whole system has to survive real-world use on a small battery. The results also had to be explainable and defensible — good enough for coaching and for patent scrutiny.'),
      H('Our approach'),
      P('We kept the system physics-first: deterministic, physically grounded signal processing anchors every metric, with machine learning layered only where it improves usefulness. Predictions were validated against simulation with known ground truth, and the architecture was shaped patent-aware from the start.'),
      H('What we built'),
      P('Ternary engineered the platform end to end. Purpose-built sensing hardware, miniaturized to fit a finger-grip form factor with over-the-air firmware updates. A motion-intelligence pipeline that detects release and impact, corrects for off-center placement, fuses orientation, and classifies motion phases. Cloud ingestion built for large simultaneous player populations. On top: coach dashboards for tracking development over time, and a context-aware AI assistant that turns telemetry into coaching guidance.'),
      H('The outcome'),
      P('What began as portable telemetry became a coaching-intelligence platform — measurement turned into decision support. The custom hardware makes the product genuinely usable in the field, and the architecture leaves room for expansion into adjacent sports.'),
    ],
  },

  flex5: {
    excerpt:
      'Ternary took Flex5 from strategy to a launched digital-health platform — consumer-grade mobile experiences on HIPAA-grade controls, with an extensible AI coaching layer.',
    tags: ['Digital health', 'HIPAA-grade controls', 'AI coaching workflows', 'Mobile-first product'],
    caseMeta: meta('Digital health', 'End-to-end product engineering'),
    content: [
      P('Reality Meets Science came to Ternary with a clear product conviction: Flex5, a health and lifestyle platform built on structured coaching and intelligent guidance. What it needed was execution.'),
      H('The challenge'),
      P("Flex5 had to satisfy two audiences at once — end users expecting an intuitive, motivating daily experience, and enterprise stakeholders expecting HIPAA-grade data handling, governance, and reliability. The risk wasn't a lack of ideas; it was whether the product could be built quickly without accumulating compliance or architecture debt."),
      H('Our approach'),
      P('We built platform-first. Phase one established secure service boundaries, role-aware access, and audit-capable workflows. Phase two delivered the mobile experience and AI-assisted flows. Phase three made every module reusable, so future coaching functions and partner integrations plug into existing foundations instead of requiring rebuilds.'),
      H('What we built'),
      P('Flex5 runs as a layered product system: a consumer-ready mobile experience for daily engagement, a reusable AI application layer powering coaching workflows and behavior-aware personalization, and secure platform services handling identity, permissions, and auditability. Compliance controls were embedded in the architecture from day one, not bolted on before launch.'),
      H('The outcome'),
      P('Flex5 moved from strategy to a launched, production-ready platform — a real system to put in front of users, partners, and enterprise buyers, with an architecture that lowers the cost of every feature that comes next.'),
    ],
  },

  'farogl-odoo-erp': {
    excerpt:
      'Ternary replaced spreadsheets and paper approvals at FAR Oil & Gas with a governed, Odoo-centered ERP built around the company’s real workflows.',
    tags: ['Odoo ERP', 'Approval workflows', 'Process transformation', 'Multi-company operations'],
    caseMeta: meta('Oil & gas', 'Frame — enterprise transformation'),
    content: [
      P("FAR Oil & Gas operates drilling sites across Bangladesh for one of the world's largest petroleum operators. Behind that operation sat spreadsheets and physical paperwork."),
      H('The challenge'),
      P('Invoice approvals waited on physical signatures. Bank reconciliation was manual and error-prone. Tax calculations lived in spreadsheets, carrying real compliance risk. Fleet and attendance tracking ran on paper, and there was no way to see profitability across sites in real time. Enterprise ERP licensing was priced out of reach — the company needed enterprise-grade discipline without the enterprise-grade bill.'),
      H('Our approach'),
      P('We ran the program governance-first: structured requirements discovery with leadership, process baselines before configuration, and module-by-module rollout with training — so transformation never broke business continuity. Customization was deliberate, applied only where the business truly required it, keeping the system maintainable for the long run.'),
      H('What we built'),
      P("An Odoo-centered ERP shaped around the company's real workflows: automatic payment reconciliation, tiered approval chains reaching to the executive level, intercompany and loan handling, requisitions, biometric attendance integration, fleet tracking, and inventory linked to projects — deployed to the cloud and consolidated across the group's companies."),
      H('The outcome'),
      P('Approvals, reconciliation, and compliance now run inside one governed system with a full audit trail. Leadership sees project profitability across sites as it happens, and the foundation scales without forcing an expensive licensing jump.'),
    ],
  },

  doyouwork: {
    excerpt:
      'Ternary built DoYouWork for Amistee — a mobile employee app, admin portal, and backend that move field-service operations off spreadsheets and paperwork.',
    tags: ['Field-service platform', 'Mobile self-service', 'Role-based access', 'Approval workflows'],
    caseMeta: meta('Field services', 'Frame — enterprise transformation'),
    content: [
      P('Amistee Air Duct Insulation & Cleaning runs field-service teams across Michigan. Managing the people, vehicles, and requests behind that work relied on spreadsheets and paper.'),
      H('The challenge'),
      P('Managers had no central view of schedules, vehicle assignments, or approvals — every decision meant chasing paper or email. Technicians in the field had no self-service path for routine needs: submitting an expense, claiming a spiff, requesting time off, checking out a tool. The friction compounded as the company grew.'),
      H('Our approach'),
      P('We designed for both audiences from day one: low-friction mobile submissions for employees, structured approval queues and auditability for managers, with organizational roles and location boundaries enforced at the API — not left to convention. Production discipline — containerized deployment, migrations, health checks — was built in during delivery, not after.'),
      H('What we built'),
      P('DoYouWork is a three-application platform: a mobile employee app for schedules, requests, and notifications; a web admin portal for scheduling, fleet, approvals, and configuration; and a backend that enforces role-based access with Admin, Manager, and Employee tiers, location scoping, and real-time notifications.'),
      H('The outcome'),
      P("Spreadsheets and paperwork gave way to one system. Employees act on routine requests directly from the field, managers approve with full context for their locations, and the platform's structure leaves room for the company to keep growing into it."),
    ],
  },

  'hissho-sushiops360': {
    excerpt:
      "In a Covalent-led program, Ternary is building the application layer that turns Hissho's franchise-wide AI intelligence into daily, accountable execution in stores.",
    tags: ['Franchise operations', 'AI application layer', 'Mobile-first workflows', 'Enterprise integration'],
    caseMeta: meta('Food service & franchise', 'Engineering partner · Covalent-led program'),
    content: [
      P('Hissho Sushi supports franchised locations across the United States, where execution quality is shaped by thousands of small daily decisions in stores. In a modernization program led by Covalent Resource Group, Ternary serves as the engineering partner building the platform’s application layer.'),
      H('The challenge'),
      P("At franchise scale, the gap is rarely a lack of data — it's the last mile between available intelligence and daily execution. Franchisees and regional teams faced fragmented tools across many systems of record, which meant time lost searching for answers, reconciling signals by hand, and reacting to issues late."),
      H('Our approach'),
      P('We followed a decision-to-action chain: identify the workflows where people act every day — plan, review, order, coach, communicate — then shape role-specific interfaces so franchisees, regional teams, and corporate users each see the right controls, bound to secure, auditable integration contracts.'),
      H('What we built'),
      P("A mobile-first, role-aware application layer that sits between users and Hissho's AI and data ecosystem: production planning with editable recommendations and reasoned overrides, sales dashboards, ordering workflows informed by production context, a chat-style information hub with source-aware answers, pre-visit briefings for regional coaching, and a communication hub connecting headquarters to the field — all under role-based access and audit trails."),
      H('The outcome'),
      P('Intelligence becomes repeatable field behavior. Recommendations arrive inside workflows where users can review, override with a reason, and follow through — preserving accountability while raising consistency. The program continues its staged rollout, module by module.'),
    ],
  },

  'lankabangla-securities': {
    excerpt:
      'Ternary deployed an air-gapped LLM environment for LankaBangla Securities and built the governed application layer that makes AI useful — and auditable — in capital markets.',
    tags: ['Air-gapped LLM', 'Governed AI', 'Read-only query pipeline', 'Audit-ready workflows'],
    caseMeta: meta('Capital markets', 'Frame — AI platform architecture'),
    content: [
      P("LankaBangla Securities is one of Bangladesh's leading capital-market institutions, with rich client and market data — and, until this engagement, no way to reach it without a technical intermediary."),
      H('The challenge'),
      P('Dealer-brokers needed synthesized answers inside decision windows, not ad-hoc reports days later. Retail outreach needed relevance grounded in account and trading context, not generic campaigns. And in a regulated institution, free-form AI access to production data was never an option — any system had to be read-only, role-aware, and fully auditable by design.'),
      H('Our approach'),
      P('Architecture first: isolate the model in an air-gapped, open-source LLM environment, then mediate every interaction through a governed application layer. Natural-language requests resolve to pre-approved, read-only query templates — the model never touches production data directly, and every interaction is logged.'),
      H('What we built'),
      P('Two working functions on one reusable foundation: an AI assistant that lets dealer-brokers retrieve and synthesize information in seconds, and marketing automation for retail traders that adapts messaging to trading behavior and account context. Because both run on the same governed layer, new functions can be added without re-architecting the platform.'),
      H('The outcome'),
      P('The institution gained practical AI adoption without regulatory exposure: conversational access for the people who need speed, controlled execution for the people who answer for it, and an extensible base for what comes next.'),
    ],
  },

  // ---- No source doc — copy kept, restructured to the arc; tags/caseMeta grounded in own copy --
  'dhaka-stock-exchange': {
    tags: ['Public platform', 'Bilingual & accessible', 'Investor portal', 'Content workflows'],
    caseMeta: meta('Capital markets', 'Platform design & prototyping'),
    content: [
      H('The challenge'),
      P("A national exchange's public digital presence had fallen well behind global peers — fragmented across many properties, hard to navigate, and missing the data tools (charts, screeners, watchlists, alerts) that today's investors expect."),
      H('Our approach'),
      P("Ternary is designing a unified, content-managed platform that modernizes the public experience and adds an investor portal — explicitly tracking-only, with no trading or settlement — so the exchange's regulated trading core is never touched."),
      H("What we're designing"),
      P('The design uses a single platform behind both the public site and the investor app, with live market-data ingestion, full English and Bangla bilingual support, accessibility and performance tuned for national-scale mobile use, and a department-based publishing workflow with live preview and approvals. It is built to deploy on the exchange’s choice of cloud or on-premise infrastructure.'),
      H('Where it stands'),
      P('The engagement is at the proposal and design-prototyping stage, backed by a research study of the existing estate and peer exchanges and a working design prototype.'),
    ],
  },

  holcim: {
    tags: ['Industrial digital twin', 'AI control interface', 'Natural-language operations', 'Applied machine learning'],
    caseMeta: meta('Building materials', 'Applied-AI engagement'),
    content: [
      H('The context'),
      P('In an early applied-AI engagement, Ternary built an AI-enabled control interface on top of an industrial digital-twin environment for a global building-materials operation.'),
      H('What we built'),
      P('The interface let plant users interact with complex operating data and control logic through natural language, with machine-learning-assisted recommendations and parameter support for operators in a high-stakes industrial setting where reliability and trust are paramount.'),
      H('Why it matters'),
      P("The work demonstrates Ternary's ability to apply AI inside real operational systems — building intelligent, accessible interfaces over enterprise and industrial infrastructure. Further detail is available on request, subject to confidentiality."),
    ],
  },
}

// ---- Apply -------------------------------------------------------------------------------------
const versions = db.getCollection('_story_versions')

for (const slug in STORIES) {
  const spec = STORIES[slug]
  const doc = db.stories.findOne({ slug })
  if (!doc) {
    print('!! story not found: ' + slug + ' — skipped')
    continue
  }

  const set = { updatedAt: now }
  if (spec.title) set['title.en'] = spec.title
  if (spec.excerpt) set['excerpts.en'] = spec.excerpt
  if (spec.tags) {
    set['tags.en'] = tagRows(spec.tags)
    set['tags.bn'] = tagRows(spec.tags)
  }
  if (spec.caseMeta) set['caseMeta'] = spec.caseMeta
  set['content.en'] = root(spec.content)

  db.stories.updateOne({ _id: doc._id }, { $set: set })
  print('stories.' + slug + ' → rewritten (en content, tags, caseMeta' + (spec.title ? ', title' : '') + (spec.excerpt ? ', excerpt' : '') + ')')

  // Sync the newest version snapshot so a republish from admin can't resurrect old copy.
  const latest = versions.find({ parent: doc._id }).sort({ updatedAt: -1 }).limit(1).toArray()[0]
  if (latest) {
    const vset = { 'version.updatedAt': now, updatedAt: now }
    if (spec.title) vset['version.title.en'] = spec.title
    if (spec.excerpt) vset['version.excerpts.en'] = spec.excerpt
    if (spec.tags) {
      vset['version.tags.en'] = set['tags.en']
      vset['version.tags.bn'] = set['tags.bn']
    }
    if (spec.caseMeta) vset['version.caseMeta'] = spec.caseMeta
    vset['version.content.en'] = set['content.en']
    versions.updateOne({ _id: latest._id }, { $set: vset })
    print('  _story_versions latest (' + latest._id + ') → synced')
  } else {
    print('  no _story_versions doc — skipped version sync')
  }
}

print('Done. ' + Object.keys(STORIES).length + ' stories processed.')
