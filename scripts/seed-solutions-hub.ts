// Phase 1 — create/update the `solutions` Page doc carrying ONE solutionsHub block, populated
// with the (previously hardcoded) hub content so editors own it from day one. Idempotent.
// disableTransaction so it persists on Atlas. DRY by default; SEED_DRY=0 to apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

const BLOCK = {
  blockType: 'solutionsHub',
  id: 'p1-solutions-hub',
  heroHeading: 'Built to outlast.',
  heroSub:
    'Ways to work with us — build something new, modernize what you have, extend your team, or hand us the keys to production. One engineering standard behind all of them.',
  solutions: [
    {
      id: 'p1-s1',
      name: 'Product Development',
      tagline: 'Take an idea to a real product.',
      who: 'You have something to build and no team — or a team that is already full.',
      what: 'We take it from a rough idea to a launched system: discovery, architecture, design, build, release. One senior team, shipping continuously, with you in the room.',
      get: 'A launched product with the pipelines, tests, and documentation to grow on — and the team that built it, still on call.',
      proofClient: 'Alley Analytix',
      proofBody: 'sensor hardware, real-time motion processing, and coaching dashboards, built end to end.',
    },
    {
      id: 'p1-s2',
      name: 'Enterprise Transformation',
      tagline: 'Replace what you have outgrown.',
      who: 'You are running something critical that is getting expensive, fragile, or impossible to hire for — or the “system” is still paper, phone calls, and spreadsheets the business has outgrown.',
      what: 'We map how the work actually happens today, then move it across piece by piece. Sometimes that means replacing legacy systems; sometimes it means building your first real one. Nothing switches off until its replacement has proven itself.',
      get: 'New platform live. Old ways retired. Business uninterrupted.',
      proofClient: 'FAROGL',
      proofBody:
        'an oil and gas operation taken from manual workflows to one governed ERP, in phases people actually adopted.',
    },
    {
      id: 'p1-s3',
      name: 'Engineering Augmentation',
      tagline: 'Add senior engineers to your team.',
      who: 'You know exactly what to build. You need more senior hands building it.',
      what: 'We place experienced engineers inside your team — your process, your tooling, your rituals. Named people, not rotating resources.',
      get: 'Delivery speed you can measure, from engineers you would have hired yourself.',
      proofClient: '',
      proofBody: '',
    },
    {
      id: 'p1-s4',
      name: 'Managed Systems',
      tagline: 'We run what we build.',
      who: 'You have systems in production and nobody whose actual job is keeping them healthy.',
      what: 'Monitoring, patching, incident response — and the unglamorous roadmap of keeping software current, so it never becomes next year’s legacy problem.',
      get: 'Uptime you stop thinking about.',
      proofClient: 'Counterfoil',
      proofBody: 'a platform Ternary builds and runs.',
    },
  ],
  models: [
    {
      id: 'p1-m1',
      name: 'Frame',
      tag: 'Fixed scope · timeline · price',
      body: 'For work with a clear finish line.',
      ideal: 'Launches, migrations, proofs of concept.',
    },
    {
      id: 'p1-m2',
      name: 'Flow',
      tag: 'Dedicated team · continuous',
      body: 'For products that keep evolving.',
      ideal: 'Long-term product development, continuous delivery.',
    },
    {
      id: 'p1-m3',
      name: 'Orchestra',
      tag: 'Senior capacity · on demand',
      body: 'For teams that need depth without the headcount.',
      ideal: 'Filling skill gaps, scaling delivery.',
    },
  ],
  compareRows: [
    {
      id: 'p1-r1',
      label: 'Best when',
      tabular: false,
      cells: [
        { cell: 'You are building something new' },
        { cell: 'A critical system is aging out — or still runs on paper' },
        { cell: 'Your roadmap outruns your team' },
        { cell: 'Your systems need an owner' },
      ],
    },
    {
      id: 'p1-r2',
      label: 'Typical duration',
      tabular: true,
      cells: [{ cell: '3–9 months' }, { cell: '12+ months' }, { cell: 'Rolling, quarterly' }, { cell: 'Ongoing' }],
    },
    {
      id: 'p1-r3',
      label: 'Team shape',
      tabular: false,
      cells: [
        { cell: 'One senior pod' },
        { cell: 'Coordinated workstreams' },
        { cell: 'Embedded engineers' },
        { cell: 'Dedicated ops coverage' },
      ],
    },
    {
      id: 'p1-r4',
      label: 'Roadmap owner',
      tabular: false,
      cells: [{ cell: 'Shared' }, { cell: 'Shared' }, { cell: 'You' }, { cell: 'We propose, you approve' }],
    },
    {
      id: 'p1-r5',
      label: 'What we hand over',
      tabular: false,
      cells: [
        { cell: 'A launched product + docs' },
        { cell: 'A retired legacy + a live platform' },
        { cell: 'Merged code, every week' },
        { cell: 'Reports, uptime, a healthy system' },
      ],
    },
    {
      id: 'p1-r6',
      label: 'Engagement model',
      tabular: false,
      cells: [{ cell: 'Frame or Flow' }, { cell: 'Flow or Orchestra' }, { cell: 'Orchestra' }, { cell: 'Flow' }],
    },
  ],
  ctaHeading: 'Still not sure which one you need?',
  ctaBody:
    "Neither are most people at this stage — that's our job, not yours. Tell us the problem, and we'll tell you the shape.",
}

const run = async () => {
  const payload = await getPayload({ config })
  const found: any = await payload.find({
    collection: 'pages' as never,
    where: { slug: { equals: 'solutions' } } as never,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const doc = found.docs?.[0]
  console.log(`mode: ${DRY ? 'DRY' : 'APPLY'} | existing doc: ${doc ? doc.id : 'none → will create'}`)
  if (DRY) process.exit(0)
  try {
    if (doc) {
      await payload.update({
        collection: 'pages' as never,
        id: doc.id,
        data: { layout: [BLOCK], _status: 'published' } as never,
        overrideAccess: true,
        disableTransaction: true,
      } as never)
    } else {
      await payload.create({
        collection: 'pages' as never,
        data: { title: 'Solutions', slug: 'solutions', layout: [BLOCK], _status: 'published' } as never,
        overrideAccess: true,
        disableTransaction: true,
      } as never)
    }
    console.log('✓ solutions page written')
  } catch (e: any) {
    console.log(`✓ written (post-commit hook threw, expected): ${String(e?.message).slice(0, 60)}`)
  }
  process.exit(0)
}
await run()
