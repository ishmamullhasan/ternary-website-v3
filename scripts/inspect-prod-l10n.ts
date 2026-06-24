// Read-only: where do titles actually live on prod (en vs default), what do the footer dropdown
// relationships point to, and is the header logo media URL valid? Drives the l10n + dropdown fix.
import config from '@payload-config'
import { getPayload } from 'payload'

const run = async () => {
  const payload = await getPayload({ config })

  for (const coll of ['capability', 'solution', 'industry'] as const) {
    const en = await payload.find({ collection: coll as never, locale: 'en', depth: 0, limit: 50, pagination: false })
    const def = await payload.find({ collection: coll as never, depth: 0, limit: 50, pagination: false }) // no locale = default
    const defMap = new Map((def.docs as { id: string; title?: string }[]).map((d) => [String(d.id), d.title]))
    console.log(`\n=== ${coll} (${en.totalDocs}) — slug | title(en) | title(default) ===`)
    for (const d of en.docs as { id: string; slug?: string; title?: string }[]) {
      console.log(`  ${(d.slug ?? '∅').padEnd(34)} | en=${d.title ?? '∅'} | def=${defMap.get(String(d.id)) ?? '∅'}`)
    }
  }

  const footer = (await payload.findGlobal({ slug: 'footer' as never, locale: 'en', depth: 1 })) as Record<
    string,
    unknown
  >
  const rel = (k: string) => {
    const arr = (footer[k] as { slug?: string; title?: string }[] | undefined) ?? []
    return arr.map((x) => (typeof x === 'object' ? `${x.title ?? '∅'}(${x.slug ?? '?'})` : String(x))).join(', ')
  }
  console.log('\n=== footer dropdown relationships ===')
  for (const k of ['capabilities', 'solutions', 'industries']) console.log(`  ${k}: ${rel(k)}`)

  const header = (await payload.findGlobal({ slug: 'header' as never, locale: 'en', depth: 1 })) as {
    logo?: { url?: string; filename?: string; id?: string }
  }
  console.log('\n=== header.logo media ===')
  console.log(
    '  ',
    JSON.stringify(header.logo ? { id: header.logo.id, filename: header.logo.filename, url: header.logo.url } : null),
  )

  await new Promise((r) => setTimeout(r, 400))
  process.exit(0)
}
try {
  await run()
} catch (e) {
  console.error('L10N-INSPECT ERROR:', e)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(1)
}
