// WEB-458 dedupe — find duplicate/junk records, check whether anything references them, and
// (only with DEDUPE_DELETE=1) delete the UNREFERENCED ones. Report-only by default.
// References checked: footer + header globals, and every `pages` doc's layout (depth 0 → rels
// are IDs, so a referenced candidate's id appears in the stringified doc).
import config from '@payload-config'
import { getPayload } from 'payload'

const DELETE = process.env.DEDUPE_DELETE === '1'
// DEDUPE_ALL=1: delete EVERY candidate (incl. referenced) — for scaffolding/placeholder cleanup
// where dangling relationship refs are acceptable (Payload returns null; guarded blocks skip).
const ALL = process.env.DEDUPE_ALL === '1'
const BENIGN = (e: unknown) => String((e as Error)?.message || e).includes('static generation store missing')

// industry: the 7 mis-slugged dupes + the "Alley Analytix" junk doc (slug title-1)
const INDUSTRY_DUPE_SLUGS = new Set(['oil--gas', 'technology', 'consumer--retail', 'hospitality--travel', 'sports--entertainment', 'manufacturing', 'banking--finance', 'title-1'])
// other collections: only the ---copy-suffixed duplicates (leave base records untouched)
const COPY_RE = /---copy|—copy/i

type Cand = { id: string; collection: string; slug?: string; title?: string }

const run = async () => {
  const payload = await getPayload({ config })

  const candidates: Cand[] = []
  const collect = async (coll: string, pick: (d: { slug?: string }) => boolean) => {
    const res = await payload.find({ collection: coll as never, locale: 'en', depth: 0, limit: 500, pagination: false })
    for (const d of res.docs as { id: string; slug?: string; title?: string }[]) if (pick(d)) candidates.push({ id: String(d.id), collection: coll, slug: d.slug, title: d.title })
  }
  await collect('industry', (d) => INDUSTRY_DUPE_SLUGS.has(d.slug ?? ''))
  for (const c of ['solution', 'insight', 'pressRelease', 'story', 'capability', 'model']) await collect(c, (d) => COPY_RE.test(d.slug ?? ''))

  // Build the reference haystack: globals + all pages (stringified, depth 0).
  const haystacks: { where: string; json: string }[] = []
  for (const g of ['footer', 'header']) haystacks.push({ where: `global:${g}`, json: JSON.stringify(await payload.findGlobal({ slug: g as never, depth: 0 })) })
  const pages = await payload.find({ collection: 'pages' as never, depth: 0, limit: 200, pagination: false })
  for (const p of pages.docs as { id: string; slug?: string }[]) haystacks.push({ where: `page:${p.slug ?? p.id}`, json: JSON.stringify(p) })

  console.log(`\n=== ${candidates.length} dupe/junk candidates — reference check ===`)
  const unreferenced: Cand[] = []
  for (const c of candidates) {
    const refs = haystacks.filter((h) => h.json.includes(c.id)).map((h) => h.where)
    const tag = refs.length ? `REFERENCED by ${refs.join(', ')}` : 'unreferenced → safe to delete'
    console.log(`  [${c.collection}] ${(c.slug ?? c.id).padEnd(40)} ${refs.length ? '⚠️ ' : '✓ '}${tag}`)
    if (!refs.length) unreferenced.push(c)
  }
  console.log(`\n${unreferenced.length}/${candidates.length} are unreferenced and safe to delete.`)

  const toDelete = ALL ? candidates : unreferenced
  if (DELETE) {
    console.log(`\n=== DELETING ${ALL ? 'ALL' : 'unreferenced'} candidates (${toDelete.length}) ===`)
    let n = 0
    for (const c of toDelete) {
      try {
        await payload.delete({ collection: c.collection as never, id: c.id as never })
        n++
        console.log(`  ✓ deleted [${c.collection}] ${c.slug}`)
      } catch (e) {
        if (BENIGN(e)) { n++; console.log(`  ✓ deleted [${c.collection}] ${c.slug} (revalidateTag skipped)`) }
        else console.log(`  ✗ FAILED [${c.collection}] ${c.slug}: ${String((e as Error).message).slice(0, 60)}`)
      }
    }
    console.log(`\nDELETED ${n}/${toDelete.length}.`)
  } else {
    console.log('REPORT ONLY — set DEDUPE_DELETE=1 to delete the unreferenced ones.')
  }
  await new Promise((r) => setTimeout(r, 500))
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error('DEDUPE ERROR:', e)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(1)
}
