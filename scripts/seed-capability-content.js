// Authors the "What this means to us" section for the 8 capability detail pages on the STAGING
// cluster. The detail template is built but was hero-only because these fields were empty. Content is
// real (drawn from each discipline's substance) — no invented clients or metrics. Idempotent.
//
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-capability-content.js

const L = (en) => ({ en })
const oid = () => new ObjectId().toHexString()
const it = (title, excerpt) => ({ id: oid(), title: L(title), excerpt: L(excerpt) })
const lex = (paras) => ({
  en: {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: paras.map((t) => ({
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        children: [{ type: 'text', version: 1, text: t, detail: 0, format: 0, mode: 'normal', style: '' }],
      })),
    },
  },
})

const C = {
  'agentic-architecture': {
    heading: 'Agents that answer for their work.',
    desc: [
      'We build AI that plans, acts, and verifies — with people in command of anything that matters. Not a demo that impresses in a sandbox, but systems that carry real responsibility in production.',
      'Every action is scoped, permissioned, and observable. When an agent does something consequential, you can see what it did and why — and stop it.',
    ],
    items: [
      it('Multi-agent systems', 'Coordinated agents with clear tools, permissions, and hand-offs.'),
      it('Evals & guardrails', 'Measured before it ships; bounded once it does.'),
    ],
  },
  'artificial-intelligence': {
    heading: 'Built for production, not the demo.',
    desc: [
      'LLM applications and machine learning that ship, get monitored, and stay owned after launch — not a proof-of-concept that never survives contact with real users and real data.',
      'We treat models like any other production system: versioned, evaluated, and operated with the same discipline as the code around them.',
    ],
    items: [
      it('LLM applications', 'Retrieval, tools, and guardrails wired for real workloads.'),
      it('Model operations', 'Monitored, versioned, and owned past launch.'),
    ],
  },
  'data-analytics': {
    heading: 'One source of truth.',
    desc: [
      'Pipelines, warehouses, and numbers your teams can actually act on — not five dashboards that disagree. We make the data trustworthy first, then useful.',
      "Governance isn't an afterthought: lineage, access, and quality are built in, so the numbers hold up when they matter.",
    ],
    items: [
      it('Pipelines & warehousing', 'Reliable movement into a model your teams share.'),
      it('Governance', 'Lineage, access, and quality by default.'),
    ],
  },
  'cloud-transformation': {
    heading: 'Move without betting the business.',
    desc: [
      "Architecture, migration, and operations for the cloud — governed for regulated environments where a bad move isn't an option. We de-risk the change, then run it.",
      "The goal isn't just to be in the cloud; it's to operate there predictably, with the controls auditors and boards expect.",
    ],
    items: [
      it('Migration', 'Sequenced so the business keeps running.'),
      it('Compliance', 'Controls that hold up to review.'),
    ],
  },
  platformization: {
    heading: 'Every next project starts ahead.',
    desc: [
      'We turn one-off builds into shared platforms, so each new project starts further along instead of from zero. Reusable services, clean APIs, and a developer experience people actually want to use.',
      'A platform is only real if teams choose it. We build for adoption, not mandate.',
    ],
    items: [
      it('Reusable services', 'The common work done once, well.'),
      it('Developer experience', "Adopted because it's better, not required."),
    ],
  },
  'digital-experiences': {
    heading: 'Trusted at first use.',
    desc: [
      'Web, mobile, and product interfaces that are clear, fast, and dependable on every device — the kind people trust without being told to. Design and engineering as one practice, not a hand-off.',
      'Accessibility and performance are requirements, not polish added at the end.',
    ],
    items: [
      it('Product design', 'Clarity that survives real content and real users.'),
      it('Accessibility & performance', 'Fast and usable for everyone, by default.'),
    ],
  },
  'devops-automation': {
    heading: 'We make shipping boring.',
    desc: [
      'More releases, fewer incidents, and no two-a.m. surprises. We automate the path to production so shipping is a non-event and reliability is the default, not the heroics.',
      'When something does break, you find out first — with the context to fix it fast.',
    ],
    items: [
      it('CI/CD & release automation', 'The path to prod, paved and repeatable.'),
      it('Observability & reliability', 'You find out first, with context.'),
    ],
  },
  'internet-of-things': {
    heading: 'From the sensor to the dashboard.',
    desc: [
      'Devices, firmware, and the data they send home — the whole path from the physical world to a number someone can act on. Built for fleets, not a single prototype on a bench.',
      'Edge and cloud designed together, so telemetry is reliable and fleets stay manageable at scale.',
    ],
    items: [
      it('Firmware & edge', 'Reliable at the far end of the network.'),
      it('Telemetry & fleets', 'Manageable from one to many thousands.'),
    ],
  },
}

let n = 0
for (const slug in C) {
  const c = C[slug]
  const r = db.capabilities.updateOne(
    { slug },
    {
      $set: {
        'whatThisMeansToUs.sectionLabel': L('What this means to us'),
        'whatThisMeansToUs.heading': L(c.heading),
        'whatThisMeansToUs.description': lex(c.desc),
        'whatThisMeansToUs.items': c.items,
        updatedAt: new Date(),
      },
    },
  )
  print(slug + ': matched=' + r.matchedCount + ' modified=' + r.modifiedCount)
  n++
}
print('DONE — authored "What this means to us" for ' + n + ' capabilities')
