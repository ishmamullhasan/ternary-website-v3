// Round-2 content fixes on the STAGING cluster:
//  1) Story titles shortened to ≤40 chars so the 2-line card clamp never truncates.
//  2) Home industries section → 8 industries (two clean 4-up rows).
//  3) Capability "What this means to us" REWRITTEN to verbatim already-approved copy — the exact
//     body sentences + tags from the approved /capabilities hub page. Removes the previously
//     authored prose/excerpts (flagged as made-up). Nothing here is new copy.
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-fixes-round2.js

const L = (en) => ({ en })
const oid = () => new ObjectId().toHexString()
const lex = (paras) => ({
  en: {
    root: {
      type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
      children: paras.map((t) => ({
        type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, textFormat: 0, textStyle: '',
        children: [{ type: 'text', version: 1, text: t, detail: 0, format: 0, mode: 'normal', style: '' }],
      })),
    },
  },
})

// ---- 1) titles ≤40 chars ----------------------------------------------------------------------
const TITLES = {
  'counterfoil-continuum': 'Counterfoil: Event-Driven Booking',
  turfly: 'Turfly: Sports-Facility Marketplace',
  'alley-analytix': 'AlleyIQ: Lab-Grade Bowling Analytics',
  flex5: 'Flex5: HIPAA-Grade Digital Health',
  'farogl-odoo-erp': 'FAR Oil & Gas: Odoo-Centered ERP',
  doyouwork: 'DoYouWork: Field-Service Operations',
  'hissho-sushiops360': 'Hissho: AI Franchise Operations',
  'lankabangla-securities': 'LankaBangla: Air-Gapped Market AI',
  'dhaka-stock-exchange': 'Dhaka Stock Exchange: Public Platform',
  holcim: 'Holcim: AI for an Industrial Twin',
}
for (const slug in TITLES) {
  db.stories.updateOne({ slug }, { $set: { 'title.en': TITLES[slug], updatedAt: new Date() } })
  print('title ' + slug + ' → "' + TITLES[slug] + '" (' + TITLES[slug].length + ')')
}

// ---- 2) home industries → 8 -------------------------------------------------------------------
const IND = ['banking-capital-markets','financial-services-insurance','public-sector','healthcare',
  'technology-platforms','advanced-manufacturing','sports-entertainment','hospitality-travel']
const indIds = IND.map((s) => (db.industries.findOne({ slug: s }) || {})._id).filter(Boolean)
const home = db.pages.findOne({ slug: 'home' })
home.layout.forEach((b) => { if (b.blockType === 'industriesSection') b.industries = indIds })
db.pages.updateOne({ _id: home._id }, { $set: { layout: home.layout, updatedAt: new Date() } })
print('home industries → ' + indIds.length + ' set')

// ---- 3) capability copy = verbatim approved hub copy ------------------------------------------
// heading = first sentence of the approved hub body; description = the full approved body;
// items = the approved tags (title only, no excerpts).
const HUB = {
  'agentic-architecture': {
    h: 'AI that does real work — and answers for it.',
    d: 'AI that does real work — and answers for it. Systems that plan, act, and verify, with people in command of anything that matters.',
    tags: ['Multi-agent systems', 'Tool use & permissions', 'Evals & guardrails', 'Human oversight'],
  },
  'artificial-intelligence': {
    h: 'Built for production, not demos.',
    d: 'LLM applications and machine learning built for production, not demos. Shipped, monitored, and owned after launch.',
    tags: ['LLM applications', 'ML pipelines', 'Retrieval & search', 'Model operations'],
  },
  'data-analytics': {
    h: 'One source of truth.',
    d: 'One source of truth. Pipelines, warehouses, and numbers your teams can actually act on.',
    tags: ['Data pipelines', 'Warehousing', 'Decision analytics', 'Governance'],
  },
  'cloud-transformation': {
    h: 'Move to the cloud without betting the business on the move.',
    d: 'Move to the cloud without betting the business on the move. Architecture, migration, and operations — governed for regulated environments.',
    tags: ['Migration', 'Cloud-native architecture', 'Platform operations', 'Compliance'],
  },
  platformization: {
    h: 'Every next project starts further ahead.',
    d: 'Turn one-off builds into shared platforms, so every next project starts further ahead instead of from zero.',
    tags: ['Internal platforms', 'Reusable services', 'APIs & SDKs', 'Developer experience'],
  },
  'digital-experiences': {
    h: 'Interfaces people trust at first use.',
    d: 'Web, mobile, and product interfaces people trust at first use — clear, fast, and dependable on every device.',
    tags: ['Web & mobile', 'Product design', 'Accessibility', 'Performance'],
  },
  'devops-automation': {
    h: 'We make shipping boring.',
    d: 'We make shipping boring. More releases, fewer incidents, and no two-a.m. surprises.',
    tags: ['CI/CD', 'Observability', 'Reliability', 'Release automation'],
  },
  'internet-of-things': {
    h: 'From the sensor to the dashboard.',
    d: 'From the sensor to the dashboard — devices, firmware, and the data they send home.',
    tags: ['Firmware', 'Edge computing', 'Telemetry', 'Device fleets'],
  },
}
for (const slug in HUB) {
  const c = HUB[slug]
  db.capabilities.updateOne(
    { slug },
    {
      $set: {
        'whatThisMeansToUs.sectionLabel': L('What this means to us'),
        'whatThisMeansToUs.heading': L(c.h),
        'whatThisMeansToUs.description': lex([c.d]),
        'whatThisMeansToUs.items': c.tags.map((t) => ({ id: oid(), title: L(t) })),
        updatedAt: new Date(),
      },
    },
  )
  print('capability ' + slug + ' → verbatim hub copy')
}
print('DONE')
