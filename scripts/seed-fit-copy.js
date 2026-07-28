// Fit truncated card copy (STAGING cluster) — every card's text becomes a COMPLETE thought that
// fits its line-clamp, with cards in a group kept to a similar length. Idempotent: re-running sets
// the same values. Recomposition of existing approved copy only — no new claims, no metrics.
//
// Run (DIRECT connection — the srv URI has a flaky DNS lookup on this machine):
//   mongosh "mongodb://ternary-preview:***@ac-w7hsldc-shard-00-00.xxpag78.mongodb.net:27017,\
//     ac-w7hsldc-shard-00-01…:27017,ac-w7hsldc-shard-00-02…:27017/ternary-local?ssl=true&\
//     authSource=admin&retryWrites=true&w=majority" --file scripts/seed-fit-copy.js
//
// Truncations fixed (all surface in the home `aboutSection` / SolutionsComp; verified in-browser
// against the real rendered card widths at yh16):
//   1. pressreleases.one-year-in-bangladesh.title — 47ch wrapped to 3 lines in aboutComp's
//      line-clamp-2 title (24px). Shortened to a complete, shorter headline that fits 2 lines.
//   2. stories.dhaka-stock-exchange.excerpts — 198ch overran the aboutComp hover panel's
//      line-clamp-5 (16px). Trimmed the trailing clause; still a complete sentence.
//   3. pressreleases.one-year-in-bangladesh.excerpts — 190ch, same line-clamp-5 overrun.
//   4. solutions.{product-development,enterprise-transformation,engineering-augmentation} excerpts
//      — 120–124ch overran SolutionsComp's lg:line-clamp-3 (14px) at the tight 4-up (~232px) lg
//      width. Recomposed to the 100–105ch band so all four fit 3 lines and read as one group.
//      managed-systems (105ch) already fits and is left as-is.
//
// Each rewritten field is set to `{ en }` only, which REPLACES the whole localized object and drops
// any stale `bn` — Payload's `fallback: true` then serves the fresh `en` to Bengali readers (same
// pattern as the prior fit pass), so no separate `$unset` is needed. bn re-translation is a later
// content pass. (A `$set` of the field plus a `$unset` of its `.bn` subpath would be an illegal
// path conflict, so replacing the object is also the only correct single-op form.)

const L = (en) => ({ en })

// --- Press release: one-year-in-bangladesh ------------------------------------------------------
db.pressreleases.updateOne(
  { slug: 'one-year-in-bangladesh' },
  {
    $set: {
      title: L('Ternary Marks One Year in Bangladesh'),
      excerpts: L(
        'A year after opening its Dhaka delivery hub, Ternary now builds and operates production software from Bangladesh — anchoring a dual-hub model across New York and Dhaka.',
      ),
      updatedAt: new Date(),
    },
  },
)
print('pressrelease one-year-in-bangladesh → title + excerpts fitted')

// --- Story: dhaka-stock-exchange (excerpt only) -------------------------------------------------
db.stories.updateOne(
  { slug: 'dhaka-stock-exchange' },
  {
    $set: {
      excerpts: L(
        'Ternary is rebuilding the Dhaka Stock Exchange’s public platform on a modern, content-managed stack — with a decade of institutional information carried over exactly.',
      ),
      updatedAt: new Date(),
    },
  },
)
print('story dhaka-stock-exchange → excerpt fitted')

// --- Solutions: tighten to a uniform 100–105ch band (3 lines at the 4-up lg width) --------------
const SOLUTIONS = {
  'product-development':
    'End-to-end product engineering — we design, build, and launch digital products businesses depend on.',
  'enterprise-transformation':
    'Replace what you have outgrown. We modernize the systems your business depends on, without the downtime.',
  'engineering-augmentation':
    'Extending your team with specialized talent — experienced engineers who fit your workflows and culture.',
}
for (const slug in SOLUTIONS) {
  db.solutions.updateOne({ slug }, { $set: { excerpts: L(SOLUTIONS[slug]), updatedAt: new Date() } })
  print('solution ' + slug + ' → excerpt fitted')
}

print('DONE')
