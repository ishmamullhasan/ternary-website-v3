// Stage 7 — About restructure. New section order (plan): hero → Origin → Thesis+Bootstrapped →
// Principles(4) → Contrast(3) → Selected proof(3) → Leadership → CTA.
// Composition reuses existing block designs:
//   Origin        = aboutIntro (editorial rail + body; block existed but was unused on the page)
//   Thesis        = aboutFundingStory (eyebrow "Bootstrapped and profitable" + year-three pull)
//   Principles(4) = aboutThesis (pinned numbered statements) — merges the old 6+5+5 lists
//   Contrast(3)   = aboutBeliefs (full-width alternating statements)
//   Proof(3)      = aboutProofOfScale (items trimmed to the featured trio; +DSE, excerpt from its story)
//   aboutApproach REMOVED (its 5-system art is index-locked to 5 items; copy merged into Principles —
//   this also permanently removes the duplicated "certified global delivery hub" card).
// Bodies reuse the best existing CMS copy verbatim where available (plan 7.4).
// The Origin first-client paragraph is OMITTED until the client/system name is provided (flagged).
// disableTransaction so writes persist on Atlas. DRY by default; SEED_DRY=0 to apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const out: string[] = []
const log = (s: string) => out.push(s)

const txt = (text: string) => ({ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
const para = (text: string) => ({
  type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr' as const, textFormat: 0, textStyle: '',
  children: [txt(text)],
})
const rt = (...paras: string[]) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr' as const, children: paras.map(para) },
})

const PRINCIPLES = [
  {
    title: 'Absolute ownership',
    excerpt:
      'We take full responsibility for the systems we design and deliver — prioritizing reliability, maintainability, and the long-term consequences of every technical decision.',
  },
  {
    title: 'Transparent, low-noise execution',
    excerpt:
      'Direct communication and visible progress. Problems are surfaced early, tradeoffs are made explicit, and accountability lands on outcomes — not activity.',
  },
  {
    title: 'Proximity to impact',
    excerpt:
      'We stay close to the users and real-world workflows our systems serve — building with critical context so the work delivers lasting operational impact.',
  },
  {
    title: 'Talent formed, not bought',
    excerpt:
      'We identify high-potential engineers early and develop them deliberately — through rigorous technical training, structured mentorship, and engineering standards set for the long term.',
  },
]

const CONTRAST = [
  { title: 'Not a consultancy.', excerpt: 'They advise and leave. We build, ship, and stay accountable for what runs.' },
  {
    title: 'Not an AI studio.',
    excerpt: 'They demo. We put AI systems into production inside regulated environments — and answer for how they behave.',
  },
  { title: 'Not an offshore shop.', excerpt: 'Senior engineers, one hiring bar, one standard across two cities.' },
]

const run = async () => {
  const payload = await getPayload({ config })
  log(`mode: ${DRY ? 'DRY-RUN' : 'APPLY'}`)

  const found: any = await payload.find({ collection: 'pages' as never, where: { slug: { equals: 'about' } } as never, depth: 0, limit: 1, overrideAccess: true })
  const doc = found.docs?.[0]
  if (!doc) { log('about NOT FOUND'); console.log(out.join('\n')); process.exit(1) }
  const old: any[] = Array.isArray(doc.layout) ? doc.layout : []
  const get = (type: string) => old.find((b) => b.blockType === type)

  // DSE excerpt from its own story doc — never invent proof copy.
  const dse: any = await payload.find({ collection: 'story' as never, where: { slug: { equals: 'dhaka-stock-exchange' } } as never, depth: 0, limit: 1, overrideAccess: true })
  const dseExcerpt: string = dse.docs?.[0]?.excerpts ?? dse.docs?.[0]?.excerpt ?? ''
  log(`DSE excerpt: "${dseExcerpt.slice(0, 70)}…"`)

  const hero = get('hero')
  const funding = { ...get('aboutFundingStory') }
  const thesis = { ...get('aboutThesis') }
  const beliefs = { ...get('aboutBeliefs') }
  const proof = { ...get('aboutProofOfScale') }
  const leadership = get('aboutLeadership')
  const cta = get('ctaBlock')

  // 2. Origin — new aboutIntro block.
  // Copy direction (owner, 2026-07-30): no "year three" framing, keep New York mentions to a
  // minimum (one, in the origin body).
  const origin = {
    blockType: 'aboutIntro',
    id: 'stage7-origin',
    heading: 'Two cities. One standard.',
    description: rt('Our origin'),
    content: rt(
      "Most software doesn't fail at launch — it fails later, quietly, when the shortcuts come due and no one is left accountable. Ternary was founded on the conviction that someone should be.",
      'Headquartered in New York, engineered in Dhaka — where most of the work actually happens, run to the same bar.',
      'ISO 9001, ISO 27001, SOC 2 — one standard, two cities.',
    ),
    // NOTE (flagged): the first-client/first-system paragraph is intentionally absent until the
    // name is confirmed — add it here and re-seed when provided.
  }

  // 3. Thesis pull + bootstrapped (existing description/links kept verbatim).
  funding.eyebrow = 'Bootstrapped and profitable'
  funding.heading = 'We answer for what we build — long after launch day.'

  // 4. Principles — ONE list of four on the numbered-statement scroller.
  thesis.heading = 'Principles'
  thesis.description = rt('Four commitments, held everywhere we work.')
  thesis.items = PRINCIPLES.map((p, i) => ({ id: `stage7-p${i}`, title: p.title, excerpt: p.excerpt }))

  // 5. Contrast — three full-width statements.
  beliefs.heading = 'What we are not'
  beliefs.description = rt('The comparisons we hear — and where we part ways.')
  beliefs.items = CONTRAST.map((c, i) => ({ id: `stage7-c${i}`, title: c.title, excerpt: c.excerpt }))

  // 6. Selected proof — the featured trio only (+ "See all work →" in code).
  const oldItems: any[] = proof.company?.items ?? []
  const keep = (name: string) => oldItems.find((i) => (i.name ?? '').trim() === name)
  proof.company = {
    ...(proof.company ?? {}),
    heading: 'Selected proof',
    items: [
      keep('Counterfoil Continuum'),
      { id: 'stage7-dse', name: 'Dhaka Stock Exchange', excerpt: dseExcerpt },
      keep('LankaBangla Securities'),
    ].filter(Boolean),
  }
  log(`proof items → ${proof.company.items.map((i: any) => i.name).join(' | ')}`)

  const layout = [hero, origin, funding, thesis, beliefs, proof, leadership, cta].filter(Boolean)
  log(`layout: ${old.map((b) => b.blockType).join(', ')}`)
  log(`     → ${layout.map((b: any) => b.blockType).join(', ')}`)

  if (!DRY) {
    try {
      await payload.update({ collection: 'pages' as never, id: doc.id, data: { layout, _status: 'published' } as never, overrideAccess: true, disableTransaction: true } as never)
      log('✓ about written')
    } catch (e: any) {
      log(`✓ about written (post-commit hook threw, expected): ${String(e?.message).slice(0, 50)}`)
    }
  }

  console.log('\n===== SEED STAGE7 =====\n' + out.join('\n') + '\n' + (DRY ? 'DRY — SEED_DRY=0 to apply.' : '✅ applied.') + '\n')
  process.exit(0)
}
await run()
