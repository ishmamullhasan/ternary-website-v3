// Card-copy alignment pass (STAGING cluster) — logged in COPY_CHANGELOG.md.
//
// GOAL: within every card group, all cards' text blocks land in the same line band so rows
// align. Every edit is a COMPRESSION or RECOMPOSITION of existing approved wording — no new
// claims, no metrics. Uniform bands (measured against the rendered card widths):
//
//  1) HOME capabilities strip (4-up, 14px, ~46ch/line) — excerpts to a 77–91ch band
//     (2 rendered lines). agentic-architecture (249ch → clamped mid-claim) and
//     devops-automation (184ch → clamped) rewritten from their own approved hub copy
//     (/capabilities index rows); cloud-transformation trimmed 98 → 89.
//  2) HOME solutions cards (4-up, 14px at lg) — product-development 144 → 119ch so all four
//     sit in the 105–124ch band (3 lines at lg).
//  3) HOME industries cards (4-up, 14px) — healthcare 90 → 81, hospitality-travel 111 → 79,
//     so all eight sit in the 67–85ch band (2 lines).
//  4) HOME scales cards (3-up, 14px, ~63ch/line) — public-sector 208 → 158ch so all three
//     sit in the 158–175ch band (3 lines). Drops the "useful at the workflow boundary" tail.
//  5) HOME engagement models (3-up) — Frame™ 102 → 126ch by recomposing with its approved
//     /solutions descriptor ("a clear finish line"), so all three sit in the 105–126ch band
//     (3 lines) instead of Frame rendering a line short.
//  6) CAPABILITY DETAIL "How we work" 3-up rows — per-page excerpt outliers compressed so no
//     row spans more than ~10ch (each row now renders a uniform line count).
//
// Stale bn values for the rewritten fields are UNSET (locale fallback serves the new en) —
// the established pattern from seed-audit-fixes.js. Idempotent — safe to re-run.
//
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-align-copy.js

const now = new Date()

function setExcerpt(coll, slug, text) {
  const doc = db.getCollection(coll).findOne({ slug })
  if (!doc) throw new Error(coll + ' doc not found: ' + slug)
  db.getCollection(coll).updateOne(
    { _id: doc._id },
    { $set: { 'excerpts.en': text, updatedAt: now }, $unset: { 'excerpts.bn': '' } },
  )
  print(coll + '.' + slug + '.excerpts.en (' + text.length + 'ch) → "' + text + '"')
}

// ---- 1) HOME capabilities strip — 77–91ch band (2 lines) ---------------------------------------
// agentic-architecture: recomposed from the approved /capabilities hub row ("Systems that
//   plan, act, and verify") + its own v3 excerpt's accountability clause.
// devops-automation: the approved /capabilities hub row, verbatim.
// cloud-transformation: same sentence, "platform operations" → "operations" (98 → 89ch).
setExcerpt(
  'capabilities',
  'agentic-architecture',
  'Multi-agent systems that plan, act, and verify — accountable for what they do in production.',
)
setExcerpt(
  'capabilities',
  'devops-automation',
  'We make shipping boring. More releases, fewer incidents, and no two-a.m. surprises.',
)
setExcerpt(
  'capabilities',
  'cloud-transformation',
  'Cloud-native architecture, migration, and operations governed for regulated environments.',
)

// ---- 2) HOME solutions cards — 105–124ch band (3 lines at lg) ----------------------------------
// product-development: "from conception to scale" folded into the em-dash frame (144 → 119ch);
// every claim kept.
setExcerpt(
  'solutions',
  'product-development',
  'End-to-end product engineering — we design, build, and launch digital products that users love and businesses depend on.',
)

// ---- 3) HOME industries cards — 67–85ch band (2 lines) -----------------------------------------
// healthcare: "Digital health platforms" → "Health platforms" (90 → 81ch).
// hospitality-travel: same three coordinates, compressed (111 → 79ch).
setExcerpt(
  'industries',
  'healthcare',
  'Health platforms that pair intuitive experiences with enterprise-grade compliance.',
)
setExcerpt(
  'industries',
  'hospitality-travel',
  'Pricing, inventory, and distribution — coordinated for the experience economy.',
)

// ---- 4) HOME scales cards — 158–175ch band (3 lines) -------------------------------------------
// public-sector: drops the "and useful at the workflow boundary" tail (208 → 158ch).
setExcerpt(
  'scales',
  'public-sector',
  'Secure, compliant, accountable delivery for institutions that demand security by architecture and verifiable governance — controlled at the infrastructure boundary.',
)

// ---- 5) HOME engagement models — 105–126ch band (3 lines) --------------------------------------
// frame: recomposed with its approved /solutions hub descriptor ("For work with a clear
// finish line") so it no longer renders a line short of Flow™/Orchestra™.
setExcerpt(
  'models',
  'frame',
  'Fixed scope, fixed timeline, fixed price. Built for discrete projects with a clear finish line and well-understood objectives.',
)

// ---- 6) CAPABILITY DETAIL "How we work" rows — per-page ≤10ch spread ---------------------------
// Each entry: capability slug → { itemIndex: new excerpt.en }. Guarded on the item's current
// title so a reordered array fails loudly instead of writing the wrong slot.
const HOW_EDITS = {
  'digital-experiences': {
    1: {
      title: 'Design and build together',
      text: 'Design and engineering work side by side, with visible progress at every step.',
    },
    2: {
      title: 'Refine after launch',
      text: 'We watch how people actually use the product and keep improving it after launch.',
    },
  },
  'artificial-intelligence': {
    0: {
      title: 'Start with the workflow',
      text: 'We stay close to the people the system will serve — real context, not assumptions.',
    },
    1: {
      title: 'Build for production',
      text: 'We engineer AI the way we engineer everything — for reliability and the long term.',
    },
  },
  'data-analytics': {
    0: {
      title: 'Start with the decisions',
      text: 'We learn which questions your teams need answered before we touch any technology.',
    },
    1: {
      title: 'Build the foundation',
      text: 'We design and deliver the pipelines and warehouse that bring your data into one place.',
    },
    2: {
      title: 'Keep it dependable',
      text: 'We maintain what we build, so the numbers stay accurate as your business changes.',
    },
  },
  'cloud-transformation': {
    2: {
      title: 'Run and refine',
      text: 'After the move, we operate and tune the environment — accountable for how it performs.',
    },
  },
  'internet-of-things': {
    2: {
      title: 'Support the fleet',
      text: 'We keep devices updated and healthy after deployment, from the first device to the fleet.',
    },
  },
  platformization: {
    0: {
      title: 'Find what repeats',
      text: 'We look across your projects for the work rebuilt again and again — that is the platform.',
    },
  },
  'agentic-architecture': {
    1: {
      title: 'Build and prove it in the open',
      text: 'We build and test against real scenarios — problems surfaced early, tradeoffs made explicit.',
    },
  },
}

for (const slug in HOW_EDITS) {
  const cap = db.capabilities.findOne({ slug })
  if (!cap) throw new Error('capability not found: ' + slug)
  const items = cap.howWeDoIt && cap.howWeDoIt.items
  if (!items) throw new Error('capability ' + slug + ' has no howWeDoIt.items')
  const edits = HOW_EDITS[slug]
  for (const idx in edits) {
    const item = items[Number(idx)]
    const currentTitle = item && item.title && (item.title.en || item.title)
    if (currentTitle !== edits[idx].title) {
      throw new Error(slug + ' how[' + idx + '] title mismatch: "' + currentTitle + '"')
    }
    item.excerpt = { en: edits[idx].text } // drops any stale bn with it (none authored today)
    print('capabilities.' + slug + '.howWeDoIt.items[' + idx + '].excerpt.en (' + edits[idx].text.length + 'ch)')
  }
  db.capabilities.updateOne({ _id: cap._id }, { $set: { 'howWeDoIt.items': items, updatedAt: now } })
}

// ---- verify: print resulting bands per group ---------------------------------------------------
function band(coll, slugs) {
  const lens = slugs.map((s) => {
    const d = db.getCollection(coll).findOne({ slug: s })
    return (d.excerpts.en || d.excerpts).length
  })
  print(coll + ' band [' + slugs.length + ' cards]: ' + Math.min(...lens) + '–' + Math.max(...lens) + 'ch')
}
band('capabilities', [
  'agentic-architecture',
  'artificial-intelligence',
  'platformization',
  'data-analytics',
  'devops-automation',
  'digital-experiences',
  'internet-of-things',
  'cloud-transformation',
])
band('solutions', ['product-development', 'enterprise-transformation', 'engineering-augmentation', 'managed-systems'])
band('industries', [
  'banking-capital-markets',
  'healthcare',
  'technology-platforms',
  'advanced-manufacturing',
  'public-sector',
  'sports-entertainment',
  'hospitality-travel',
  'consumer-goods',
])
band('scales', ['startups-and-scale-ups', 'mid-market-and-enterprise', 'public-sector'])
band('models', ['frame', 'flow', 'orchestra'])

print('DONE')
