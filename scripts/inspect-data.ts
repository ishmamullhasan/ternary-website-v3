// Read-only diagnosis for the WEB-458 data cleanup: dump industry docs (title↔slug alignment)
// and count `---copy` duplicate records across content collections. Writes nothing.
import config from '@payload-config'
import { getPayload } from 'payload'

const run = async () => {
  const payload = await getPayload({ config })

  const ind = await payload.find({ collection: 'industry' as never, locale: 'en', depth: 0, limit: 200, pagination: false })
  console.log(`\n=== industry collection (${ind.totalDocs} docs) — title ↔ slug ↔ status ===`)
  for (const d of ind.docs as { id: string; title?: string; slug?: string; _status?: string }[]) {
    const slugFromTitle = (d.title ?? '').toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const mismatch = d.slug && slugFromTitle && d.slug !== slugFromTitle ? '  ⚠️ MISMATCH' : ''
    console.log(`  ${String(d.id).slice(-6)} | ${(d.title ?? '∅').padEnd(34)} | slug=${d.slug ?? '∅'} | ${d._status ?? '?'}${mismatch}`)
  }

  console.log(`\n=== "---copy" duplicate counts by collection ===`)
  for (const c of ['solution', 'industry', 'insight', 'pressRelease', 'job', 'story', 'capability', 'model', 'scale'] as const) {
    try {
      const all = await payload.find({ collection: c as never, locale: 'en', depth: 0, limit: 500, pagination: false })
      const copies = (all.docs as { slug?: string; title?: string }[]).filter((d) => /---copy|—copy|copy$/i.test(d.slug ?? '') || /copy/i.test(d.title ?? ''))
      console.log(`  ${c.padEnd(13)} total=${all.totalDocs}  ---copy-ish=${copies.length}  ${copies.slice(0, 6).map((d) => d.slug).join(', ')}`)
    } catch (e) {
      console.log(`  ${c}: ERR ${String((e as Error).message).slice(0, 50)}`)
    }
  }
  await new Promise((r) => setTimeout(r, 400))
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error('INSPECT ERROR:', e)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(1)
}
