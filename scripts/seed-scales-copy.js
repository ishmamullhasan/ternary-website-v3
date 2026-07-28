// Home scales-card copy — plain-language rewrite (STAGING cluster) — logged in COPY_CHANGELOG.md.
//
// GOAL: the three home scale cards (startups-and-scale-ups, mid-market-and-enterprise,
// public-sector; the `test` doc is ignored) carried titles and excerpts written for engineers
// ("ATO-ready", "security by architecture", "re-architect", "cloud-native", "pod cadence").
// A non-technical business owner must understand every line. Rewrites:
//
//  - title.en → a short human promise (≤8 words). No un-glossed jargon.
//  - excerpts.en → ONE plain sentence, 12–16 words, similar length across the three cards so the
//    3-up row's clamped text blocks land on the same rendered line count. Says who each scale
//    serves and what Ternary does for them, in everyday words.
//
// Grounded in the deck (audit/deck/DECK_COPY.md p08–p09 "Scales Served") + approved hub copy
// (/scales page). No invented clients, metrics, or claims.
//
// Stale bn title values for the rewritten titles are UNSET so the locale fallback serves the new
// en — the established pattern from seed-audit-fixes.js / seed-align-copy.js. (The bn excerpts on
// mid-market and startups are likewise unset; public-sector has no bn excerpt.) Idempotent — safe
// to re-run.
//
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-scales-copy.js

const now = new Date()

// slug → { title: <≤8-word promise>, excerpt: <12–16-word plain sentence> }
const CARDS = {
  'startups-and-scale-ups': {
    title: 'Turn your idea into a product that ships.',
    excerpt: 'For founders and early teams: we build your first product and grow it as you scale.',
  },
  'mid-market-and-enterprise': {
    title: 'Modernize what your business runs on.',
    excerpt: 'For established companies: we replace the systems you have outgrown, without pausing the business.',
  },
  'public-sector': {
    title: 'Built for the standards you must meet.',
    excerpt: 'For government and public bodies: we build secure systems and prove they meet every rule.',
  },
}

for (const slug in CARDS) {
  const doc = db.scales.findOne({ slug })
  if (!doc) throw new Error('scales doc not found: ' + slug)
  const { title, excerpt } = CARDS[slug]
  db.scales.updateOne(
    { _id: doc._id },
    {
      $set: { 'title.en': title, 'excerpts.en': excerpt, updatedAt: now },
      $unset: { 'title.bn': '', 'excerpts.bn': '' },
    },
  )
  const words = excerpt.trim().split(/\s+/).length
  print('scales.' + slug)
  print('  title.en    → "' + title + '"')
  print('  excerpts.en (' + excerpt.length + 'ch, ' + words + 'w) → "' + excerpt + '"')
}

// ---- verify: re-read and print the resulting band -----------------------------------------------
const slugs = ['startups-and-scale-ups', 'mid-market-and-enterprise', 'public-sector']
const lens = slugs.map((s) => db.scales.findOne({ slug: s }).excerpts.en.length)
print('scales excerpt band [' + slugs.length + ' cards]: ' + Math.min(...lens) + '–' + Math.max(...lens) + 'ch')

print('DONE')
