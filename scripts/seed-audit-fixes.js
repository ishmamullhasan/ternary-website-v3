// Audit copy fixes on the STAGING cluster (ternary-local). Idempotent — safe to re-run.
//
//  1) ℠ → ™ on Frame/Flow/Orchestra model titles (also strips any space before the mark).
//  2) Orchestra™ realigned to the canonical deck definition (on-demand senior talent) — the
//     multi-pod/multi-program copy belonged to no engagement model. Stale bn copies of the wrong
//     definition are unset so localization fallback serves the corrected en.
//  3) Home processSection: "four foundations" → "the foundations" (the list has five items) — en + bn.
//  4) /contact: placeholder ctaBlock ("CTA" / "vfgdv…" / "123") removed; placeholder office phone
//     "+1 (800) 123-4567" cleared so the guarded Phone row hides.
//  6) Industry technology-platforms: missing excerpt set (used by the home industry card).
//  7) Footer global: software-platforms removed from the industries column (duplicate of
//     technology-platforms; canonical name is Technology Platforms).
//  8) Solution enterprise-transformation excerpt: "Modernize legacy systems and processes." stub →
//     approved recomposed copy. Stale bn stub unset (fallback serves en).
//  9) /stories storiesArchive: "Eight engagements, every one delivered to production." →
//     "Every engagement here shipped to production." (en + bn — de-counted).
//
// Fix 5 (proof-slot guidance), 10 (Orchestrators counter), 11 (empty-role guard) are code-side.
// Fix 11 note: team member "Romjan Ali" has no position in the DB — deliberately NOT invented here.
//
// Run: mongosh "mongodb+srv://…/ternary-local" --file scripts/seed-audit-fixes.js

const lex = (paras) => ({
  root: {
    type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
    children: paras.map((p) => ({
      type: p.h ? 'heading' : 'paragraph',
      version: 1, direction: 'ltr', format: '', indent: 0,
      ...(p.h ? { tag: 'h3' } : { textFormat: 0, textStyle: '' }),
      children: [{ type: 'text', version: 1, text: p.h || p.p, detail: 0, format: 0, mode: 'normal', style: '' }],
    })),
  },
})

// Replace an exact substring inside a Lexical richText tree (any locale). Returns true if changed.
const replaceInLex = (node, from, to) => {
  if (!node || typeof node !== 'object') return false
  let changed = false
  if (typeof node.text === 'string' && node.text.includes(from)) {
    node.text = node.text.replace(from, to)
    changed = true
  }
  for (const k of Object.keys(node)) {
    if (node[k] && typeof node[k] === 'object' && replaceInLex(node[k], from, to)) changed = true
  }
  return changed
}

// ---- 1) ℠ → ™ on engagement-model titles (and drop any space before the mark) -----------------
for (const slug of ['frame', 'flow', 'orchestra']) {
  const m = db.models.findOne({ slug })
  if (!m) { print('SKIP models/' + slug + ' (not found)'); continue }
  const sets = {}
  for (const loc of Object.keys(m.title || {})) {
    const fixed = m.title[loc].replace(/\s*[℠™]/g, '') + '™'
    if (fixed !== m.title[loc]) sets['title.' + loc] = fixed
  }
  if (Object.keys(sets).length) {
    sets.updatedAt = new Date()
    db.models.updateOne({ _id: m._id }, { $set: sets })
    print('models/' + slug + ' title → ' + JSON.stringify(sets))
  } else print('models/' + slug + ' title already ™')
}

// ---- 2) Orchestra™ = on-demand senior talent (canonical deck + /solutions wording) ------------
// Recomposed strictly from approved copy: deck p18 ("Orchestra™ for on-demand talent
// augmentation", "Technical talent integrated into your existing workflows", ideal-for list) and
// the approved /solutions engagement card ("Senior capacity · on demand", "For teams that need
// depth without the headcount", "Filling skill gaps, scaling delivery"). No new claims.
const ORCH_EXCERPT =
  'On-demand senior talent. Experienced engineers integrated into your existing workflows — depth without the headcount.'
const ORCH_CONTENT = lex([
  { h: 'On-demand senior talent' },
  { p: 'Orchestra™ provides senior technical talent on demand, integrated into your existing workflows — your process, your tooling, your rituals.' },
  { p: 'It is built for teams that need depth without the headcount, with the same production responsibility we bring to every engagement.' },
  { h: 'Ideal for' },
  { p: 'Filling skill gaps, scaling capacity, specialized expertise, and flexible resourcing.' },
])
const orch = db.models.findOne({ slug: 'orchestra' })
if (orch) {
  db.models.updateOne(
    { _id: orch._id },
    {
      $set: { 'excerpts.en': ORCH_EXCERPT, 'content.en': ORCH_CONTENT, updatedAt: new Date() },
      // bn still carried the wrong multi-program definition — unset so fallback serves the fixed en.
      $unset: { 'excerpts.bn': '', 'content.bn': '' },
    },
  )
  print('models/orchestra → on-demand senior talent (en set; stale bn unset)')
} else print('SKIP models/orchestra (not found)')

// ---- 3) Home "four foundations" → "the foundations" (five items are listed) -------------------
const home = db.pages.findOne({ slug: 'home' })
if (home) {
  let changed = false
  for (const b of home.layout || []) {
    if (b.blockType !== 'processSection' || !b.description) continue
    if (replaceInLex(b.description.en, 'four foundations that help us deliver', 'the foundations that help us deliver')) changed = true
    if (replaceInLex(b.description.bn, 'চারটি ভিত্তি যা আমাদের', 'যে ভিত্তিগুলো আমাদের')) changed = true
  }
  if (changed) {
    db.pages.updateOne({ _id: home._id }, { $set: { layout: home.layout, updatedAt: new Date() } })
    print('pages/home processSection → "the foundations that help us deliver" (en+bn)')
  } else print('pages/home processSection already de-counted')
} else print('SKIP pages/home (not found)')

// ---- 4) /contact: drop the placeholder ctaBlock; clear the placeholder phone ------------------
const contact = db.pages.findOne({ slug: 'contact' })
if (contact) {
  const before = contact.layout.length
  contact.layout = contact.layout.filter(
    (b) => !(b.blockType === 'ctaBlock' && (b.heading && b.heading.en) === 'CTA'),
  )
  let phoneCleared = false
  for (const b of contact.layout) {
    if (b.blockType !== 'contactOffices') continue
    for (const it of b.items || []) {
      if (it.phone === '+1 (800) 123-4567') { it.phone = ''; phoneCleared = true }
    }
  }
  if (contact.layout.length !== before || phoneCleared) {
    db.pages.updateOne({ _id: contact._id }, { $set: { layout: contact.layout, updatedAt: new Date() } })
    print('pages/contact → ctaBlock removed: ' + (before - contact.layout.length) + ', phone cleared: ' + phoneCleared)
  } else print('pages/contact already clean')
} else print('SKIP pages/contact (not found)')

// ---- 6) technology-platforms industry: missing excerpt (home industry card) -------------------
const TECH_EXCERPT = 'Product companies making the jump from one system to a real platform.'
const tech = db.industries.findOne({ slug: 'technology-platforms' })
if (tech) {
  if ((tech.excerpts && tech.excerpts.en) !== TECH_EXCERPT) {
    db.industries.updateOne({ _id: tech._id }, { $set: { 'excerpts.en': TECH_EXCERPT, updatedAt: new Date() } })
    print('industries/technology-platforms excerpt set')
  } else print('industries/technology-platforms excerpt already set')
} else print('SKIP industries/technology-platforms (not found)')

// ---- 7) Footer: remove the duplicate Software Platforms entry from the industries column ------
const softwarePlatforms = db.industries.findOne({ slug: 'software-platforms' })
if (softwarePlatforms) {
  const res = db.globals.updateOne(
    { globalType: 'footer' },
    { $pull: { industries: softwarePlatforms._id }, $set: { updatedAt: new Date() } },
  )
  print('globals/footer industries: software-platforms pulled (modified: ' + res.modifiedCount + ')')
} else print('SKIP footer pull (industries/software-platforms not found)')

// ---- 8) enterprise-transformation excerpt: stub → approved recomposed copy --------------------
const ET_EXCERPT =
  'Replace what you have outgrown. We modernize the systems your business depends on — without stopping the business to do it.'
const et = db.solutions.findOne({ slug: 'enterprise-transformation' })
if (et) {
  if ((et.excerpts && et.excerpts.en) !== ET_EXCERPT) {
    db.solutions.updateOne(
      { _id: et._id },
      // bn still carried the old stub's meaning — unset so fallback serves the fixed en.
      { $set: { 'excerpts.en': ET_EXCERPT, updatedAt: new Date() }, $unset: { 'excerpts.bn': '' } },
    )
    print('solutions/enterprise-transformation excerpt replaced (stale bn unset)')
  } else print('solutions/enterprise-transformation excerpt already set')
} else print('SKIP solutions/enterprise-transformation (not found)')

// ---- 9) /stories: de-counted lead sentence ----------------------------------------------------
const stories = db.pages.findOne({ slug: 'stories' })
if (stories) {
  let changed = false
  for (const b of stories.layout || []) {
    if (b.blockType !== 'storiesArchive' || !b.description) continue
    if (replaceInLex(b.description.en, 'Eight engagements, every one delivered to production.', 'Every engagement here shipped to production.')) changed = true
    if (replaceInLex(b.description.bn, 'আটটি এনগেজমেন্ট, প্রতিটিই প্রোডাকশনে ডেলিভারি দেওয়া।', 'এখানকার প্রতিটি এনগেজমেন্ট প্রোডাকশনে শিপ হয়েছে।')) changed = true
  }
  if (changed) {
    db.pages.updateOne({ _id: stories._id }, { $set: { layout: stories.layout, updatedAt: new Date() } })
    print('pages/stories storiesArchive → "Every engagement here shipped to production." (en+bn)')
  } else print('pages/stories already de-counted')
} else print('SKIP pages/stories (not found)')

print('--- seed-audit-fixes done ---')
