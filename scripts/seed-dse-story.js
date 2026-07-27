// Dhaka Stock Exchange story upgrade (STAGING cluster) — carry the new DSE engagement synthesis
// (audit/case-studies/SOURCES.md § "Dhaka Stock Exchange (DSE)") into the `stories` collection,
// matching the narrative arc used by scripts/seed-stories-v2.js for the other nine stories:
// context → challenge → approach → what we built → outcome. Logged in COPY_CHANGELOG.md.
//
// House rules applied:
//   - plain language, NO quantified achievements
//   - no invented facts; client-internal references from the synthesis (SOW number, ticket IDs,
//     staging URL, named data blockers, tool names for internal process) are excluded per the
//     source author's own publication caveat
//   - the old copy described a proposal/design-prototyping stage; the new synthesis documents an
//     active platform rebuild — tags/caseMeta updated to match the source
//
// EN only — bn narrative translation is a logged follow-up.
// Idempotent — safe to re-run. Syncs the latest _story_versions draft so an admin republish
// can't resurrect the old copy.
//
// Run: mongosh "<staging URI>/ternary-local" --file scripts/seed-dse-story.js

const now = new Date()

// ---- Lexical helpers ---------------------------------------------------------------------------
const T = (text) => ({ type: 'text', version: 1, text, detail: 0, format: 0, mode: 'normal', style: '' })
const P = (text) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children: [T(text)],
})
const H = (text) => ({
  type: 'heading',
  tag: 'h3',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: [T(text)],
})
const root = (nodes) => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: nodes },
})
const tagRows = (labels) => labels.map((name) => ({ name, id: new ObjectId().toString() }))

const SLUG = 'dhaka-stock-exchange'

const excerpt =
  "Ternary is rebuilding the Dhaka Stock Exchange's public platform on a modern, content-managed stack — under a strict fidelity standard, so a decade of institutional information carries over exactly."

const tags = ['Legacy replatform', 'CMS-driven platform', 'Design system', 'Regulated data fidelity']

const caseMeta = {
  industry: { en: 'Capital markets', bn: 'Capital markets' },
  engagement: { en: 'Full platform rebuild', bn: 'Full platform rebuild' },
  duration: { en: '', bn: '' },
  team: { en: '', bn: '' },
  year: { en: '', bn: '' },
}

const content = [
  P(
    "The Dhaka Stock Exchange is the public face of Bangladesh's capital market. Its website is where market data, company and securities information, broker directories, disclosures and filings, and investor resources reach the public — and it had grown into a large, sprawling legacy application, hundreds of pages deep.",
  ),
  H('The challenge'),
  P(
    "This is a full rebuild of a national financial institution's public presence, not a cosmetic refresh. Because it is a stock exchange, the information carries legal and regulatory weight: a mis-transcribed column header or an invented figure is not a cosmetic bug, it is a compliance problem. Everything had to move to a modern stack without losing, altering, or inventing a single data point.",
  ),
  H('Our approach'),
  P(
    'The engagement runs on disciplined legacy parity. Four governing rules shape every decision: no invented pages, no lost information, no invented or derived data fields, and verbatim reproduction of table labels. Where the client deliberately reduces content, that exception is recorded explicitly for the audit trail rather than made silently — and every piece of feedback is researched against the live legacy source before anything is designed or built, so nothing ships on assumption.',
  ),
  H("What we're building"),
  P(
    'A complete design language came first: a navy brand identity, typography split between interface and numeric contexts, and a hard convention reserving green and red exclusively for market movement, so colour never misleads. Dark mode and mobile layouts are defined as reusable primitives rather than per-page decisions. On that foundation, the site is being reconstructed as a modern, CMS-driven platform, guided by a specification suite that documents every component — its data source, content, states, and acceptance criteria — page family by page family.',
  ),
  H('The outcome'),
  P(
    'Every publications and disclosures surface is cross-checked against the legacy source, with reconciliation evidence attached rather than asserted — catching the quiet failure mode of pages that look finished but hide dead document links or silently dropped content. The result is the harder discipline behind a modern rebuild: preserving institutional information exactly while modernising everything around it — the design system, the CMS, the mobile experience, and the performance.',
  ),
]

// ---- Apply -------------------------------------------------------------------------------------
const doc = db.stories.findOne({ slug: SLUG })
if (!doc) {
  print('!! story not found: ' + SLUG)
} else {
  const set = {
    updatedAt: now,
    'excerpts.en': excerpt,
    'tags.en': tagRows(tags),
    'tags.bn': tagRows(tags),
    caseMeta: caseMeta,
    'content.en': root(content),
  }
  db.stories.updateOne({ _id: doc._id }, { $set: set })
  print('stories.' + SLUG + ' → rewritten (en content, excerpt, tags, caseMeta)')

  // Sync the newest version snapshot so a republish from admin can't resurrect old copy.
  const versions = db.getCollection('_story_versions')
  const latest = versions.find({ parent: doc._id }).sort({ updatedAt: -1 }).limit(1).toArray()[0]
  if (latest) {
    versions.updateOne(
      { _id: latest._id },
      {
        $set: {
          'version.updatedAt': now,
          updatedAt: now,
          'version.excerpts.en': excerpt,
          'version.tags.en': set['tags.en'],
          'version.tags.bn': set['tags.bn'],
          'version.caseMeta': caseMeta,
          'version.content.en': set['content.en'],
        },
      },
    )
    print('  _story_versions latest (' + latest._id + ') → synced')
  } else {
    print('  no _story_versions doc — skipped version sync')
  }
}
print('Done.')
