// About / "The Ternary Way" — remove the stated count (STAGING cluster) — logged in COPY_CHANGELOG.md.
//
// The intro read "...defined by three core principles" while the block holds FIVE items:
// Absolute ownership, Transparent execution, Proximity to impact, A certified global delivery
// hub, Three ways to engage. So it was wrong on the page, and it also broke the standing copy
// rule against stated counts (REDESIGN_PLAN.md: "reword any copy that states a count" — the same
// pass turned "Eight disciplines. One standard." into a count-free line).
//
// This deletes the count clause and nothing else. No new wording, no claim added or removed
// beyond the incorrect number: the sentence simply ends after "sustained accountability".
//
// SHAPES DIFFER BETWEEN LOCALES and both are preserved. `en` is a Lexical richText object and is
// edited at its text node; `bn` is stored as a plain string on this field and is rewritten as a
// string. Normalising one into the other would be a schema change, not a copy fix.
//
// Idempotent: matches on the count clause, so a second run reports "already clean" and writes
// nothing.
//
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-about-approach-count.js

const EN_BEFORE =
  'Software built as long-term stewardship: an engineering partnership rooted in technical excellence and sustained accountability, defined by three core principles.'
const EN_AFTER =
  'Software built as long-term stewardship: an engineering partnership rooted in technical excellence and sustained accountability.'

const BN_BEFORE =
  'টেকনিক্যাল উৎকর্ষ ও নিরবচ্ছিন্ন জবাবদিহিতে প্রোথিত একটি ইঞ্জিনিয়ারিং পার্টনারশিপ মডেল, যা তিনটি মূল নীতির দ্বারা সংজ্ঞায়িত।'
const BN_AFTER = 'টেকনিক্যাল উৎকর্ষ ও নিরবচ্ছিন্ন জবাবদিহিতে প্রোথিত একটি ইঞ্জিনিয়ারিং পার্টনারশিপ মডেল।'

const page = db.pages.findOne({ slug: 'about' })
if (!page) throw new Error('about page not found')

const layout = page.layout || []
const i = layout.findIndex((b) => b.blockType === 'aboutApproach')
if (i === -1) throw new Error('aboutApproach block not found')

const desc = layout[i].description
let changed = false

const node = desc && desc.en && desc.en.root && desc.en.root.children[0] && desc.en.root.children[0].children[0]
if (node && node.text === EN_BEFORE) {
  node.text = EN_AFTER
  changed = true
  print('  en : count clause removed')
} else if (node && node.text === EN_AFTER) {
  print('  en : already clean')
} else {
  print('  en : UNRECOGNISED — left untouched')
}

if (desc && desc.bn === BN_BEFORE) {
  desc.bn = BN_AFTER
  changed = true
  print('  bn : count clause removed')
} else if (desc && desc.bn === BN_AFTER) {
  print('  bn : already clean')
} else {
  print('  bn : UNRECOGNISED — left untouched')
}

if (changed) {
  const set = {}
  set['layout.' + i + '.description'] = desc
  db.pages.updateOne({ _id: page._id }, { $set: set })
  print('written.')
} else {
  print('no write needed.')
}
