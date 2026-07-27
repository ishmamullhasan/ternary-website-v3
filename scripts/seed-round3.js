// Round-3 content + structure fixes (STAGING cluster) — logged in COPY_CHANGELOG.md.
//
//  1) HOME industriesSection → exactly 4 cards: banking-capital-markets, healthcare,
//     technology-platforms, advanced-manufacturing. Drops the Financial Services &
//     Insurance card (read as a duplicate of Banking & Capital Markets) and trims the
//     8-card grid back to one 4-up row.
//  2) Industry card excerpts aligned: one plain sentence of similar length per card,
//     grounded in the deck (audit/deck/DECK_COPY.md p07/p09/p30) and approved hub copy.
//     Overlong (healthcare, banking) and understuffed (public-sector) siblings fixed;
//     the rest already sit in the 8–14-word band and are untouched.
//  3) ABOUT hero heading: "Built in New York, shipped everywhere." → deck-grounded
//     identity line without the shipping gimmick; description reworded so the
//     "engineering institution" phrase isn't repeated back-to-back.
//  4) ABOUT layout reordered into a story arc: hero → thesis → approach (principles)
//     → proof of work → culture → leadership → funding story → closing CTA. The
//     funding-story link is relabeled ("Start a conversation" → "Work with us") so it
//     no longer duplicates the adjacent CTA block's button. Latest _pages_versions
//     draft synced for BOTH pages (seed-about-v2.js pattern) so a republish can't
//     resurrect the old order.
//
// Sources: audit/deck/DECK_COPY.md + existing approved site copy ONLY. No metrics,
// no invented facts, plain language. Idempotent — safe to re-run.
//
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-round3.js

const L = (en) => ({ en })
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
const now = new Date()

// Pages are draft-enabled (versions + autosave): sync the latest version doc so the
// admin's draft view matches and a republish doesn't resurrect the old layout.
const syncLatestVersion = (page) => {
  const versions = db.getCollection('_pages_versions')
  const latest = versions.find({ parent: page._id }).sort({ updatedAt: -1 }).limit(1).toArray()[0]
  if (latest) {
    versions.updateOne(
      { _id: latest._id },
      { $set: { 'version.layout': page.layout, 'version.updatedAt': now, updatedAt: now } },
    )
    print('_pages_versions latest for "' + page.slug + '" (' + latest._id + ') → layout synced')
  } else {
    print('no _pages_versions doc found for "' + page.slug + '" — skipped version sync')
  }
}

// ---- 1) HOME industries section → 4 cards ------------------------------------------------------
const IND_ORDER = ['banking-capital-markets', 'healthcare', 'technology-platforms', 'advanced-manufacturing']
const indIds = IND_ORDER.map((s) => {
  const doc = db.industries.findOne({ slug: s })
  if (!doc) throw new Error('industry not found: ' + s)
  return doc._id
})
const home = db.pages.findOne({ slug: 'home' })
if (!home) throw new Error('pages doc with slug "home" not found')
home.layout.forEach((b) => {
  if (b.blockType === 'industriesSection') b.industries = indIds
})
db.pages.updateOne({ _id: home._id }, { $set: { layout: home.layout, updatedAt: now } })
print('pages.home industriesSection → 4 cards: ' + IND_ORDER.join(', '))
syncLatestVersion(home)

// ---- 2) industry excerpts — one plain sentence each, sibling-consistent length -----------------
// banking: deck p07 card verbatim (previous en had grown a dense qualifier tail).
// healthcare: was a 22-word run-on; regrounded in the Flex5 case narrative (p30 —
//   consumer-grade engagement on enterprise-grade compliance).
// public-sector: was much shorter than every sibling; regrounded in deck p09
//   ("Government & Defense — secure, compliant solutions for mission-critical operations").
const EXCERPTS = {
  'banking-capital-markets': 'Digital transformation and secure platforms for financial institutions.',
  healthcare: 'Digital health platforms that pair intuitive experiences with enterprise-grade compliance.',
  'public-sector': 'Secure, compliant systems for government and mission-critical operations.',
}
for (const slug in EXCERPTS) {
  db.industries.updateOne({ slug }, { $set: { 'excerpts.en': EXCERPTS[slug], updatedAt: now } })
  print('industries.' + slug + '.excerpts.en → "' + EXCERPTS[slug] + '"')
}
// Untouched (already one plain sentence in the 8–14-word band):
//   technology-platforms — "Product companies making the jump from one system to a real platform."
//   advanced-manufacturing — "IoT integration and data-driven operational intelligence for modern manufacturing."
//   financial-services-insurance, sports-entertainment, hospitality-travel, consumer-goods.

// ---- 3) ABOUT copy fixes ------------------------------------------------------------------------
const about = db.pages.findOne({ slug: 'about' })
if (!about) throw new Error('pages doc with slug "about" not found')

for (const block of about.layout) {
  switch (block.blockType) {
    case 'hero': {
      // Deck p02 sidebar ("An engineering institution building digital systems…") +
      // the long-term stewardship voice — no shipping wordplay. Description keeps the
      // p03/p04 intro but lets the heading carry the institution phrase.
      block.heading = L('An engineering institution, built for the long term.')
      block.description = lex([
        'Ternary builds digital systems for organizations scaling their operations and transforming their infrastructure. Based in New York with delivery operations in Dhaka, we work as technical partners — responsible for the systems we design, deliver, and maintain over time.',
      ])
      break
    }
    case 'aboutFundingStory': {
      // Now sits directly above the closing CTA, whose primary button is already
      // "Start a conversation" — relabel to avoid the duplicate. Same destination.
      if (block.links && block.links[0]) {
        block.links[0].label = L('Work with us')
        block.links[0].url = '/contact'
      }
      break
    }
    default:
      break
  }
}

// ---- 4) ABOUT story-arc reorder -----------------------------------------------------------------
// intro/hero → thesis → approach (principles) → proof of work → culture/beliefs →
// leadership → funding story → closing CTA.
const ARC = [
  'hero',
  'aboutThesis',
  'aboutApproach',
  'aboutProofOfScale',
  'aboutBeliefs',
  'aboutLeadership',
  'aboutFundingStory',
  'ctaBlock',
]
const byType = {}
about.layout.forEach((b) => {
  ;(byType[b.blockType] = byType[b.blockType] || []).push(b)
})
const newLayout = []
ARC.forEach((t) => {
  ;(byType[t] || []).forEach((b) => newLayout.push(b))
  delete byType[t]
})
// Defensive: any block type not in the arc keeps its relative position at the end.
Object.keys(byType).forEach((t) => byType[t].forEach((b) => newLayout.push(b)))
if (newLayout.length !== about.layout.length) throw new Error('about reorder lost blocks')
about.layout = newLayout

db.pages.updateOne({ _id: about._id }, { $set: { layout: about.layout, updatedAt: now } })
print('pages.about → hero copy updated; layout order: ' + about.layout.map((b) => b.blockType).join(' → '))
syncLatestVersion(about)

print('DONE')
