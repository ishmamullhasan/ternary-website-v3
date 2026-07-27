// Seeds the header global's mega-menu PANELS (Capabilities / Solutions / Industries) on the STAGING
// cluster. The redesigned MegaMenuOverlay needs panel.columns[].items[]; the copied content only had
// the old flat subItems, so dropdowns rendered empty. Idempotent — safe to re-run.
//
// Run:  mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-megamenu.js
// Links point at real detail routes; copy is count-free (base-3 marks live on the pages, not here).

const oid = () => new ObjectId().toHexString()
const L = (en) => ({ en })
const item = (label, link, description) => {
  const o = { id: oid(), label: L(label), link }
  if (description) o.description = L(description)
  return o
}
const col = (heading, items) => ({ id: oid(), heading: L(heading), items })
const res = (label, link) => ({ id: oid(), label: L(label), link })

const PANELS = {
  Capabilities: {
    eyebrow: L('Capabilities'),
    heading: L('The disciplines behind everything we build.'),
    viewAllLabel: L('View all'),
    viewAllLink: '/capabilities',
    featured: {
      enabled: true,
      badge: L('Base 3'),
      title: L('An index, numbered in base three.'),
      description: L('Every practice we run in production — each with a named lead, house standards, and work to show for it.'),
      ctaLabel: L('Open the index'),
      link: '/capabilities',
    },
    columns: [
      col('Intelligence', [
        item('Agentic Architecture', '/capabilities/agentic-architecture', 'AI that does real work — and answers for it.'),
        item('Artificial Intelligence', '/capabilities/artificial-intelligence', 'LLM apps and ML built for production.'),
        item('Data & Analytics', '/capabilities/data-analytics', 'One source of truth your teams can act on.'),
      ]),
      col('Platform', [
        item('Cloud Transformation', '/capabilities/cloud-transformation', 'Move to the cloud without betting the business.'),
        item('Platformization', '/capabilities/platformization', 'Turn one-off builds into shared platforms.'),
        item('DevOps & Automation', '/capabilities/devops-automation', 'We make shipping boring.'),
      ]),
      col('Experience', [
        item('Digital Experiences', '/capabilities/digital-experiences', 'Interfaces people trust at first use.'),
        item('Internet of Things', '/capabilities/internet-of-things', 'From the sensor to the dashboard.'),
      ]),
    ],
    resources: [res('Case studies', '/stories'), res('Insights', '/insights')],
  },

  Solutions: {
    eyebrow: L('Solutions'),
    heading: L('Ways to work with us.'),
    viewAllLabel: L('View all'),
    viewAllLink: '/solutions',
    featured: {
      enabled: true,
      badge: L('Engagement'),
      title: L('Frame™ · Flow™ · Orchestra™'),
      description: L('Fixed scope, a dedicated team, or senior capacity on demand — every engagement runs on one standard.'),
      ctaLabel: L('How we engage'),
      link: '/solutions',
    },
    columns: [
      col('Work with us', [
        item('Product Development', '/solutions/product-development', 'Take an idea to a real product.'),
        item('Enterprise Transformation', '/solutions/enterprise-transformation', 'Replace what you have outgrown.'),
        item('Engineering Augmentation', '/solutions/engineering-augmentation', 'Add senior engineers to your team.'),
        item('Managed Systems', '/solutions/managed-systems', 'We run what we build.'),
      ]),
    ],
    resources: [res('Case studies', '/stories'), res('Insights', '/insights')],
  },

  Industries: {
    eyebrow: L('Industries'),
    heading: L('We build where the stakes are specific.'),
    viewAllLabel: L('View all'),
    viewAllLink: '/industries',
    featured: { enabled: false },
    columns: [
      col('Regulated', [
        item('Banking & Capital Markets', '/industries/banking-capital-markets'),
        item('Financial Services & Insurance', '/industries/financial-services-insurance'),
        item('Public Sector', '/industries/public-sector'),
      ]),
      col('Enterprise', [
        item('Technology Platforms', '/industries/technology-platforms'),
        item('Advanced Manufacturing', '/industries/advanced-manufacturing'),
        item('Health Care', '/industries/healthcare'),
      ]),
      col('Experience', [
        item('Sports & Entertainment', '/industries/sports-entertainment'),
        item('Hospitality & Travel', '/industries/hospitality-travel'),
        item('Consumer Goods & Services', '/industries/consumer-goods'),
      ]),
    ],
    resources: [res('Case studies', '/stories')],
  },
}

const h = db.globals.findOne({ globalType: 'header' })
if (!h) {
  print('ABORT: no header global found')
  quit(1)
}
let seeded = 0
h.menu.forEach((m) => {
  const label = m.label && (m.label.en || m.label)
  if (PANELS[label]) {
    m.type = 'mega'
    m.panel = PANELS[label]
    delete m.subItems
    seeded++
  }
})
db.globals.updateOne({ _id: h._id }, { $set: { menu: h.menu, updatedAt: new Date() } })
print('Seeded mega-menu panels for ' + seeded + ' items: ' + Object.keys(PANELS).join(', '))
