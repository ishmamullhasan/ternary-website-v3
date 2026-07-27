// Round-3 copy revision for the 8 capability detail pages (STAGING cluster):
// heroSection.description + whatThisMeansToUs + howWeDoIt rewritten as a story arc
// (what this practice is → how Ternary works → why you can trust us with it).
//
// Sources: audit/deck/DECK_COPY.md (primary — voice, positioning, capability wording;
// known deck defects NOT reused) and the approved /capabilities hub copy (secondary).
// Rules honored: no quantified achievements, no client names, no invented claims.
// agentic-architecture and devops-automation are absent from the deck's capability
// pages, so those two are grounded strictly in the approved hub copy + deck voice.
//
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-copy-v3.js

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

// ---------------------------------------------------------------------------------------------
// COPY — per slug: hero (1 short para), what {heading, desc[], items[[title, excerpt]]},
// how {heading, desc[], items[[title, excerpt]] — exactly 3 steps}.
// ---------------------------------------------------------------------------------------------
const COPY = {
  'agentic-architecture': {
    hero:
      'AI that does real work — and answers for it. We build systems that plan, act, and check their own work, with your people in command of anything that matters.',
    what: {
      heading: 'AI you can hold accountable',
      desc: [
        'Most AI can talk. Agentic systems can act — they carry out real tasks in your business, step by step. That power only helps when it comes with clear rules, hard limits, and a person in command.',
        'We treat agents the way we treat any system we run: designed carefully, tested honestly, and held to accountability for outcomes, not just activity.',
      ],
      items: [
        ['Multi-agent systems', 'Several AI workers, each with one clear job, coordinated so complex work gets done step by step.'],
        ['Tool use & permissions', 'Every agent gets an explicit list of what it may touch — everything else stays off limits.'],
        ['Evals & guardrails', 'We test agents against real scenarios before they act, and set boundaries they cannot cross.'],
        ['Human oversight', 'A person stays in command of anything that matters, with the power to review, approve, or stop.'],
      ],
    },
    how: {
      heading: 'Plan, act, verify — under your rules',
      desc: [
        'We introduce agents the way we introduce any system we intend to run: deliberately, transparently, and with clear ownership from day one.',
      ],
      items: [
        ['Define the job and the limits', 'Together we decide what the agent should do, what it may never do, and who stays in charge.'],
        ['Build and prove it in the open', 'We build the system and test it against real scenarios — problems surfaced early, tradeoffs made explicit.'],
        ['Run it and stand behind it', 'We stay responsible after launch, watching how the system behaves and improving it over time.'],
      ],
    },
  },

  'artificial-intelligence': {
    hero:
      'Practical AI, built into your products and operations. Not demos — working systems we ship, monitor, and own after launch.',
    what: {
      heading: 'Production-ready, not proof-of-concept',
      desc: [
        'Plenty of AI never leaves the demo stage. We integrate AI into products and operations where it does useful work every day — and we hold ourselves accountable for how it performs once it is live.',
      ],
      items: [
        ['LLM applications', 'Software built on large language models — the technology behind modern AI assistants — applied to your real workflows.'],
        ['ML pipelines', 'The behind-the-scenes machinery that keeps a model learning from fresh data, reliably and repeatably.'],
        ['Retrieval & search', 'Connecting AI to your own information, so answers come from your business — not guesses.'],
        ['Model operations', 'The ongoing care of a live AI system: watching its behavior and keeping its quality steady.'],
      ],
    },
    how: {
      heading: 'Shipped, monitored, and owned',
      desc: [
        'Our approach to AI is the same one we bring to every system: understand the real workflow first, build with discipline, and stay accountable after launch.',
      ],
      items: [
        ['Start with the workflow', 'We stay close to the people the system will serve, so we build with real context — not assumptions.'],
        ['Build for production', 'We engineer AI the way we engineer everything: for reliability, maintainability, and the long term.'],
        ['Own it after launch', 'We monitor, support, and improve the system in production — we run what we build.'],
      ],
    },
  },

  'data-analytics': {
    hero:
      'Your business already produces the data. We build the infrastructure that turns it into one source of truth — numbers your teams can actually act on.',
    what: {
      heading: 'One source of truth',
      desc: [
        'When every team keeps its own spreadsheet, every meeting starts with an argument about whose numbers are right. We build the data infrastructure that ends that argument: one trusted place where information flows in cleanly and comes out ready to use.',
      ],
      items: [
        ['Data pipelines', 'The plumbing that moves information automatically from where it is created to where it is needed.'],
        ['Warehousing', 'One organized, central home for your business data, instead of numbers scattered across tools and spreadsheets.'],
        ['Decision analytics', 'Turning raw data into clear reports and dashboards that answer real business questions.'],
        ['Governance', 'The rules for who can see what, and the checks that keep your data accurate and safe.'],
      ],
    },
    how: {
      heading: 'From raw data to daily decisions',
      desc: [
        'Data work fails when it ignores the people who will use it. We start with your decisions, build the infrastructure to support them, and maintain it as your business grows.',
      ],
      items: [
        ['Start with the decisions', 'We learn which questions your teams actually need answered before we touch any technology.'],
        ['Build the foundation', 'We design and deliver the pipelines and warehouse that bring your data into one reliable place.'],
        ['Keep it dependable', 'We maintain what we build, so the numbers stay accurate as your business changes — long-term stewardship, not a handoff.'],
      ],
    },
  },

  'cloud-transformation': {
    hero:
      'Move to the cloud without betting the business on the move. We plan, migrate, and run cloud systems that scale without disrupting your core business.',
    what: {
      heading: 'Change without disruption',
      desc: [
        'Moving to the cloud is one of the biggest technical transitions a company can make — and the risk is real. We balance innovation with pragmatism, guiding organizations through the move carefully so daily operations keep running while the foundation improves underneath.',
      ],
      items: [
        ['Migration', 'Moving your systems and data from aging infrastructure to the cloud, carefully and in stages.'],
        ['Cloud-native architecture', 'Designing systems for the cloud from the start, so they scale smoothly as demand grows.'],
        ['Platform operations', 'The day-to-day running of your cloud environment — we keep it healthy so you do not have to.'],
        ['Compliance', 'Meeting the rules of regulated industries, with security and governance built in from the start.'],
      ],
    },
    how: {
      heading: 'Pragmatism over big-bang moves',
      desc: [
        'We treat a cloud move as a guided transition, not a leap. Every step is planned and explained — problems surfaced early, tradeoffs made explicit.',
      ],
      items: [
        ['Understand what you have', 'We map your current systems and agree on what moves, what changes, and what stays.'],
        ['Move in careful stages', 'We migrate step by step, keeping the business running the whole way through.'],
        ['Run and refine', 'After the move, we operate and tune the environment — accountable for how it performs, not just how it launched.'],
      ],
    },
  },

  platformization: {
    hero:
      'Turn one-off builds into shared platforms. When your teams stop rebuilding the same things, every next project starts further ahead instead of from zero.',
    what: {
      heading: 'Build once, benefit everywhere',
      desc: [
        'Most companies quietly rebuild the same capabilities — logins, payments, reports — project after project. A platform is that work done once, done well, and shared. We engineer robust platform foundations designed for scale, so effort compounds instead of repeating.',
      ],
      items: [
        ['Internal platforms', 'Shared foundations your own teams build on, so common work is done once instead of every time.'],
        ['Reusable services', 'Well-made building blocks — like payments or notifications — that any product in your company can use.'],
        ['APIs & SDKs', 'The connectors and toolkits that let systems and teams plug into your platform cleanly.'],
        ['Developer experience', 'Making the platform genuinely easy to build on, so teams adopt it instead of working around it.'],
      ],
    },
    how: {
      heading: 'Foundations that outlast projects',
      desc: [
        'A platform is a long-term commitment, and we treat it that way — designed deliberately, delivered in useful pieces, and maintained for the long haul.',
      ],
      items: [
        ['Find what repeats', 'We look across your projects for the work being rebuilt again and again — that is the platform.'],
        ['Engineer for reuse', 'We design and deliver robust, well-documented pieces that many teams can depend on.'],
        ['Steward it long term', 'We maintain and evolve the platform as your needs change — we run what we build.'],
      ],
    },
  },

  'digital-experiences': {
    hero:
      'Web, mobile, and product interfaces people trust at first use. We create digital experiences that are clear, fast, and dependable on every device.',
    what: {
      heading: 'Trust at first use',
      desc: [
        'Your website or app is often the first conversation a customer has with your business. We stay close to the people our systems serve, and we build experiences that are intuitive and engaging — because trust is earned in the first few seconds and kept through every visit after.',
      ],
      items: [
        ['Web & mobile', 'Websites and apps built to work beautifully wherever your customers are.'],
        ['Product design', 'Thinking through what people actually need before deciding what a screen should look like.'],
        ['Accessibility', 'Making sure everyone can use what we build, regardless of ability or device.'],
        ['Performance', 'Pages and apps that load fast and respond instantly — because waiting erodes trust.'],
      ],
    },
    how: {
      heading: 'Close to the people we serve',
      desc: [
        'We design and build in close contact with real users, because proximity to the people a product serves is how good decisions get made.',
      ],
      items: [
        ['Understand the audience', 'We start with the people who will use the product and what they are trying to do.'],
        ['Design and build together', 'Design and engineering work side by side, with visible progress you can react to at every step.'],
        ['Refine after launch', 'We watch how people actually use the product and keep improving it — launch is a beginning, not an end.'],
      ],
    },
  },

  'devops-automation': {
    hero:
      'We make shipping software boring — in the best way. Updates go out smoothly and predictably, without drama and without two-a.m. surprises.',
    what: {
      heading: 'Boring releases are a feature',
      desc: [
        'In many companies, releasing software is a nerve-racking event. It does not have to be. When testing and deployment are automated and systems are watched around the clock, updates become routine — and your team’s energy goes into building, not firefighting.',
      ],
      items: [
        ['CI/CD', 'Automation that tests and releases every change the same careful way, every time — no manual steps to forget.'],
        ['Observability', 'Instruments on your systems that show what is happening inside, so issues are seen before customers feel them.'],
        ['Reliability', 'Engineering systems to stay up and recover gracefully, because downtime costs trust and money.'],
        ['Release automation', 'Turning launch day from an all-hands event into a routine, reversible, low-drama step.'],
      ],
    },
    how: {
      heading: 'Low-noise execution, every release',
      desc: [
        'Our discipline here mirrors our culture: transparent execution, problems surfaced early, and accountability for outcomes rather than activity.',
      ],
      items: [
        ['Automate the path to production', 'We replace manual steps with a repeatable, tested route from a change to a release.'],
        ['Make systems observable', 'We instrument everything, so anyone can see what is running and how it is behaving.'],
        ['Keep watch and improve', 'We monitor what we run, learn from every incident, and steadily make surprises rarer.'],
      ],
    },
  },

  'internet-of-things': {
    hero:
      'From the sensor to the dashboard, we build connected systems that link physical devices to the information they produce — so your equipment can tell you what it knows.',
    what: {
      heading: 'The physical world, connected',
      desc: [
        'The Internet of Things simply means everyday equipment — sensors, machines, devices — connected so it can report what is happening and be managed from anywhere. We build the whole chain, from the device in the field to the cloud systems that turn its signals into useful information.',
      ],
      items: [
        ['Firmware', 'The software that lives inside a device itself and tells it how to behave.'],
        ['Edge computing', 'Processing information on or near the device, so it can act quickly without waiting on the internet.'],
        ['Telemetry', 'The steady stream of readings a device sends home, telling you how things are going in the field.'],
        ['Device fleets', 'Managing many devices at once — keeping them updated, healthy, and secure wherever they are.'],
      ],
    },
    how: {
      heading: 'One system, device to dashboard',
      desc: [
        'Connected hardware only pays off when every layer works together. We design, deliver, and maintain the full chain as one accountable system.',
      ],
      items: [
        ['Design the whole chain', 'We plan the device, its connection, and the cloud behind it together — never in isolation.'],
        ['Build and prove it', 'We engineer each layer and test them as one system, in conditions like the real world.'],
        ['Support the fleet', 'We keep devices updated and healthy after deployment — long-term stewardship, from the first device to the whole fleet.'],
      ],
    },
  },
}

// ---------------------------------------------------------------------------------------------
for (const slug in COPY) {
  const c = COPY[slug]
  db.capabilities.updateOne(
    { slug },
    {
      $set: {
        'heroSection.description': lex([c.hero]),
        'whatThisMeansToUs.sectionLabel': L('What it means'),
        'whatThisMeansToUs.heading': L(c.what.heading),
        'whatThisMeansToUs.description': lex(c.what.desc),
        'whatThisMeansToUs.items': c.what.items.map(([t, e]) => ({ id: oid(), title: L(t), excerpt: L(e) })),
        'howWeDoIt.sectionLabel': L('How we work'),
        'howWeDoIt.heading': L(c.how.heading),
        'howWeDoIt.description': lex(c.how.desc),
        'howWeDoIt.items': c.how.items.map(([t, e]) => ({ id: oid(), title: L(t), excerpt: L(e) })),
        updatedAt: new Date(),
      },
    },
  )
  print('capability ' + slug + ' → v3 copy set')
}
print('DONE')
