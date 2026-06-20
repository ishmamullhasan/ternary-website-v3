// Read-only: dump the home + stories page blocks and their relationship fields (resolved slugs)
// so we can see which blocks reference the ---copy junk and what real docs exist to repoint to.
import config from '@payload-config'
import { getPayload } from 'payload'

const relSlugs = (v: unknown): string => {
  const arr = Array.isArray(v) ? v : v ? [v] : []
  return arr
    .map((x) => (x && typeof x === 'object' ? ((x as { slug?: string; title?: string }).slug ?? (x as { title?: string }).title ?? '?') : String(x)))
    .join(', ')
}

const run = async () => {
  const payload = await getPayload({ config })

  for (const slug of ['home', 'stories'] as const) {
    const res = await payload.find({ collection: 'pages' as never, where: { slug: { equals: slug } } as never, locale: 'en', depth: 1, limit: 1 })
    const page = res.docs?.[0] as { layout?: Record<string, unknown>[] } | undefined
    console.log(`\n=== page: ${slug} ===`)
    for (const b of page?.layout ?? []) {
      const relFields = Object.entries(b).filter(([k, v]) => {
        const arr = Array.isArray(v) ? v : [v]
        return k !== 'id' && arr.some((x) => x && typeof x === 'object' && ('slug' in (x as object) || 'relationTo' in (x as object)))
      })
      console.log(`  • ${b.blockType}${relFields.length ? '' : '  (no rel fields)'}`)
      for (const [k, v] of relFields) console.log(`      ${k}: ${relSlugs(v)}`)
    }
  }

  // What real (non-copy) docs exist to repoint to?
  for (const c of ['capability', 'model', 'industry', 'pressRelease'] as const) {
    const r = await payload.find({ collection: c as never, locale: 'en', depth: 0, limit: 200, pagination: false })
    const clean = (r.docs as { slug?: string }[]).map((d) => d.slug).filter((s) => s && !/---copy|—copy/.test(s))
    console.log(`\n${c} real docs: ${clean.join(', ')}`)
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
