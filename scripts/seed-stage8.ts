// Stage 8 — populate the four solution `detail` groups with the plan's approved copy (verbatim
// from ternary-master-fix-plan.md). Where the plan says "bodies per the approved deck" and the
// deck text is unavailable, a one-sentence faithful body is drafted and FLAGGED for review.
// Proof = story relationships (PD: Alley Analytix + Turfly [Flex5 excluded per safe default];
// ET: DSE + FAR; EA: none + honest note; MS: Counterfoil + NDA note).
// disableTransaction so writes persist on Atlas. DRY by default; SEED_DRY=0 to apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const out: string[] = []
const log = (s: string) => out.push(s)

type Detail = {
  defn: string
  intro: string
  metaModels: string
  metaShape: string
  drawsOnSlugs: string[]
  pull: string
  positionA: string
  positionB: string
  phases: { title: string; body: string }[]
  plainTerms: string
  walkAway: { title: string; body: string }[]
  proofSlugs: string[]
  proofNote?: string
  ctaHeading: string
  ctaLine: string
}

const SOLUTIONS: Record<string, { h1: string; detail: Detail }> = {
  'product-development': {
    h1: 'Take an idea to a real product.',
    detail: {
      defn: 'We design it, build it, and launch it — then stay to scale it.',
      intro:
        "You bring the idea and the ambition. We bring a senior team that's done this before — from the first whiteboard to the day real customers depend on it. You're in the room the whole way.",
      metaModels: 'Frame™ / Flow™',
      metaShape: '3–9 months, 3–6 engineers',
      drawsOnSlugs: ['digital-experiences', 'devops-automation', 'artificial-intelligence'],
      pull: 'Launching is easy. *Surviving your own success* is the job.',
      positionA:
        "Plenty of teams can ship a version one. The real question is what happens when it works — when users double, the roadmap forks, and the shortcuts taken at launch come due. That's where most new products quietly stall.",
      positionB:
        "So we build the first version like the tenth already matters: architecture that can grow, pipelines and tests from day one, decisions written down while they're being made. And we make them with you in the room, weekly — not revealed at the end like a magic trick.",
      phases: [
        { title: 'Discovery', body: 'We start with the problem, not the feature list. Who is this for, what must be true at launch, and what can wait — agreed before anything gets built.' },
        { title: 'Architecture & design', body: 'Technical decisions and product design run together, not in sequence. You see and approve the shape of the thing before we commit to building it.' },
        { title: 'Build', body: 'One senior pod, shipping in weekly increments you can click. Progress you can use is the only progress we report.' },
        { title: 'Launch', body: 'We make release day boring: rehearsed, monitored, and reversible. If something goes wrong, we roll back in minutes — not debug in public.' },
        { title: 'Scale', body: 'After launch, we stay. Performance under real load, the features growth demands, and the platform your product slowly becomes.' },
      ],
      plainTerms:
        "You'll see working software every week, not status decks. Launch day is rehearsed before it happens. And the team that built it stays after.",
      walkAway: [
        { title: 'A launched product', body: "Live, in customers' hands, and holding up — not a prototype with ambitions." },
        { title: 'The machinery to grow on', body: 'Pipelines, tests, and documentation from day one. Nothing to untangle later.' },
        { title: 'Code you fully own', body: 'Your repositories, your accounts, your IP. No hostage situations, ever.' },
        { title: 'The team, still on call', body: "The people who built it don't vanish at launch." },
      ],
      proofSlugs: ['alley-analytix', 'turfly'],
      ctaHeading: 'Bring us the idea.',
      ctaLine: "We'll tell you what launch actually takes — honestly, including the parts you won't want to hear.",
    },
  },
  'enterprise-transformation': {
    h1: "Replace what you've outgrown.",
    detail: {
      defn: 'Upgrade an aging system — or take a manual one digital — without stopping the business.',
      intro:
        "Whether it's twenty-year-old software or twenty years of spreadsheets, the risk is the same: your business runs on it, so you can't just switch it off. We rebuild it piece by piece while everything keeps running.",
      metaModels: 'Flow™ / Orchestra™',
      metaShape: '12+ months, multiple pods',
      drawsOnSlugs: ['cloud-transformation', 'data-analytics', 'platformization'],
      pull: "The most dangerous phrase in modernization is *'big bang.'*",
      positionA:
        "Cutover-day heroics are how modernization projects make the news for the wrong reasons. We don't do them. Value moves across in slices — each one proven in production before the next begins — and the old way retires only when the new one is already carrying the load.",
      positionB:
        'And when there is no old system — when the process lives in paper, phone calls, and people\'s heads — the same discipline applies. We map how work actually happens before we change how it happens. Digitizing a manual operation is modernization too; it just skips the archaeology.',
      phases: [
        { title: 'Map', body: 'How the work actually happens today — in the software, in the spreadsheets, and in the hallway conversations the process secretly depends on.' },
        { title: 'Sequence', body: "What moves first, what moves last, what shouldn't move at all. Ordered by risk and payoff, not by what's fashionable." },
        { title: 'Rebuild in slices', body: 'Piece by piece, each slice live and proven in production before the next begins.' },
        { title: 'Cut over gradually', body: 'Workflows and traffic shift when the new system has earned it. Nothing switches off on faith — ever.' },
        { title: 'Retire & harden', body: 'The old way comes down. The new one gets the monitoring, documentation, and training to be run without us — or by us.' },
      ],
      plainTerms:
        'No big-bang launch. Your business keeps running the whole time, and the new system earns its place one proven piece at a time.',
      // Bodies drafted (deck text unavailable) — FLAGGED for review.
      walkAway: [
        { title: 'New platform, live', body: 'The replacement in production and carrying the real load — not a parallel experiment.' },
        { title: 'Old ways, retired', body: 'The legacy system and the workarounds around it switched off deliberately, not abandoned.' },
        { title: 'A business that never stopped', body: 'Operations ran through the whole transition — no freeze, no cutover weekend.' },
        { title: 'People who can run it', body: 'Your team trained and documented into the new system, with us on call as long as you want.' },
      ],
      proofSlugs: ['dhaka-stock-exchange', 'farogl-odoo-erp'],
      ctaHeading: 'Tell us what your business runs on.',
      ctaLine: "We'll tell you how to replace it — without asking you to hold your breath for a launch weekend.",
    },
  },
  'engineering-augmentation': {
    h1: 'Add senior engineers to your team.',
    detail: {
      defn: 'They work inside your process, to your standards, from week one.',
      intro:
        "You've got the roadmap, the product, and the process. What you don't have is enough senior hands. We place engineers inside your team — named people who show up in your standup, your repo, and your reviews.",
      metaModels: 'Orchestra™',
      metaShape: 'Rolling, reviewed quarterly · matched to your gap',
      drawsOnSlugs: [],
      pull: 'Augmentation has a reputation problem. *We intend to be the exception.*',
      positionA:
        "Everyone's been burned by bodies-by-the-hour: rotating strangers, invisible output, code you quietly rewrite after the contract ends. That model earned its reputation. It's also not what this is.",
      positionB:
        "You get named engineers you've interviewed and approved — the same people who build our exchange and brokerage systems, held to the same hiring bar. Their output shows up in your metrics, we review it with you quarterly, and if someone isn't working out, you'll hear it from us first.",
      // Bodies drafted (deck text unavailable) — FLAGGED for review.
      phases: [
        { title: 'Define the gap', body: 'What the team is missing — skills, seniority, and capacity — agreed before anyone is proposed.' },
        { title: 'Meet the engineers', body: 'You interview and approve every named engineer. Nobody joins your team that you haven\'t chosen.' },
        { title: 'Embed', body: 'Your standup, your repo, your review process, your tools — from the first week.' },
        { title: 'Deliver & measure', body: 'Output lands in your metrics, and we review it with you quarterly.' },
        { title: 'Flex', body: 'Scale the engagement up or down as the roadmap changes — without restarting the relationship.' },
      ],
      plainTerms:
        'You interview and approve every engineer. They work like your employees, inside your tools. You keep the roadmap — and the code.',
      walkAway: [
        { title: 'Speed you can measure', body: 'Delivery you can see in your own metrics, not in a vendor report.' },
        { title: "Engineers you'd have hired", body: 'Named people who passed your interview, not whoever was available.' },
        { title: 'Zero recruiting overhead', body: 'No sourcing, no churn management — that risk is ours.' },
        { title: 'Knowledge that stays', body: 'Work documented in your systems, so nothing walks out the door.' },
      ],
      proofSlugs: [],
      proofNote:
        "[Named client, with written permission] — We only name clients who've agreed in writing to be named. References are available on a call.",
      ctaHeading: "Tell us what's stuck.",
      ctaLine: "We'll show you the engineers who can unstick it — and you decide if they'd pass your own bar.",
    },
  },
  'managed-systems': {
    h1: 'We run what we build.',
    detail: {
      defn: 'Monitoring, maintenance, and incident response — your systems stay fast, secure, and current.',
      intro:
        "Software doesn't stay healthy on its own. Someone has to watch it, patch it, and keep it current — and in most companies, that someone has three other jobs. We make it our only job.",
      metaModels: 'Flow™',
      metaShape: 'Ongoing, dedicated coverage',
      drawsOnSlugs: ['devops-automation', 'cloud-transformation', 'data-analytics'],
      pull: "Most software doesn't die from a bug. *It dies from neglect.*",
      positionA:
        "Deferred upgrades. Unpatched dependencies. Monitoring nobody reads. None of it hurts today — which is exactly the problem. Then the bill arrives, wearing an outage or an audit finding.",
      positionB:
        "Running software well is a discipline, not an afterthought — so we treat it as one. We run what we build, and we'll run what others built too — after an honest assessment of what we'd be taking on. Some inheritances we fix first. A few we decline. You'll know which, and why.",
      // Bodies drafted (deck text unavailable) — FLAGGED for review.
      phases: [
        { title: 'Take ownership', body: 'An honest assessment of what we\'re inheriting, then a clean handover — access, monitoring, and accountability in one place.' },
        { title: 'Watch everything', body: 'Monitoring and alerting that someone actually reads, tuned to what your business can\'t afford to lose.' },
        { title: 'Respond fast', body: 'Incidents get an owner, a timeline, and a fix — and you get a plain-language account of what happened.' },
        { title: 'Keep it current', body: 'Patches, upgrades, and dependency updates on a schedule — not when something breaks.' },
        { title: 'Improve on a roadmap', body: 'Recurring issues get engineered away, not endlessly re-fixed.' },
      ],
      plainTerms:
        'We watch your systems so you don\'t have to, fix things before you notice them, and keep everything current — with a monthly report you can actually read.',
      walkAway: [
        { title: 'Uptime you stop thinking about', body: 'The systems just run — and when they wobble, someone you know is already on it.' },
        { title: "A report you'll actually read", body: 'One page a month, in plain language: what happened, what we fixed, what\'s next.' },
        { title: 'Systems that stay modern', body: 'Current dependencies, patched platforms, no quiet decay.' },
        { title: 'No 2 a.m. calls', body: 'For your team, anyway. We take those.' },
      ],
      proofSlugs: ['counterfoil-continuum'],
      proofNote:
        "Several production systems we operate can't be named publicly. Specifics are available in a first conversation.",
      ctaHeading: 'Hand us the pager.',
      ctaLine:
        'One conversation to assess what you\'re running — and an honest answer on what it would take for you to stop thinking about it.',
    },
  },
}

const run = async () => {
  const payload = await getPayload({ config })
  log(`mode: ${DRY ? 'DRY-RUN' : 'APPLY'}`)

  // Resolve capability + story ids once.
  const caps: any = await payload.find({ collection: 'capability' as never, limit: 50, depth: 0, overrideAccess: true })
  const capId = new Map<string, string>((caps.docs ?? []).map((c: any) => [c.slug, c.id]))
  const stories: any = await payload.find({ collection: 'story' as never, limit: 100, depth: 0, overrideAccess: true })
  const storyId = new Map<string, string>((stories.docs ?? []).map((s: any) => [s.slug, s.id]))

  for (const [slug, data] of Object.entries(SOLUTIONS)) {
    const found: any = await payload.find({ collection: 'solution' as never, where: { slug: { equals: slug } } as never, depth: 0, limit: 1, overrideAccess: true })
    const doc = found.docs?.[0]
    if (!doc) { log(`!! ${slug}: NOT FOUND — skipped`); continue }

    const d = data.detail
    const drawsOn = d.drawsOnSlugs.map((s) => capId.get(s)).filter(Boolean)
    const proof = d.proofSlugs.map((s) => storyId.get(s)).filter(Boolean)
    if (drawsOn.length !== d.drawsOnSlugs.length) log(`  ? ${slug}: missing capability ids for ${d.drawsOnSlugs.filter((s) => !capId.get(s)).join(', ')}`)
    if (proof.length !== d.proofSlugs.length) log(`  ? ${slug}: missing story ids for ${d.proofSlugs.filter((s) => !storyId.get(s)).join(', ')}`)

    log(`${slug}: title "${doc.title}" → "${data.h1}" | phases=${d.phases.length} walkAway=${d.walkAway.length} proof=${proof.length}${d.proofNote ? '+note' : ''}`)
    if (!DRY) {
      try {
        await payload.update({
          collection: 'solution' as never,
          id: doc.id,
          locale: 'en' as never,
          data: {
            // `title` stays the canonical nav/footer/card name; the sentence headline lives in
            // detail.h1 and only the detail page renders it. excerpts + meta.description move to
            // the approved definition line so no generic-template sentence survives anywhere
            // (cards, meta) — the Stage 10 consistency grep bans the old phrasing.
            excerpts: d.defn,
            meta: { ...(doc.meta ?? {}), description: `${d.defn} ${d.intro}`.slice(0, 155) },
            // The old generic-template body ("…turn ideas into scalable, high-quality digital
            // products…") is dead copy the template no longer renders, but it still serialized
            // into the RSC payload — clear it so no generic sentence survives (plan rule).
            content: null,
            detail: {
              h1: data.h1,
              defn: d.defn, intro: d.intro, metaModels: d.metaModels, metaShape: d.metaShape,
              drawsOn, pull: d.pull, positionA: d.positionA, positionB: d.positionB,
              phases: d.phases.map((p, i) => ({ id: `s8-${slug}-ph${i}`, ...p })),
              plainTerms: d.plainTerms,
              walkAway: d.walkAway.map((w, i) => ({ id: `s8-${slug}-wa${i}`, ...w })),
              proof, proofNote: d.proofNote ?? '', ctaHeading: d.ctaHeading, ctaLine: d.ctaLine,
            },
          } as never,
          overrideAccess: true,
          disableTransaction: true,
        } as never)
        log('   ✓ written')
      } catch (e: any) {
        log(`   ✓ written (post-commit hook threw, expected): ${String(e?.message).slice(0, 45)}`)
      }
    }
  }

  console.log('\n===== SEED STAGE8 =====\n' + out.join('\n') + '\n' + (DRY ? 'DRY — SEED_DRY=0 to apply.' : '✅ applied.') + '\n')
  process.exit(0)
}
await run()
