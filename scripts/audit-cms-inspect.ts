// Stage 0 audit helper: confirm the [CMS]-side findings against the live DB. Read-only.
import config from '@payload-config'
import { getPayload } from 'payload'

const run = async () => {
  const payload = await getPayload({ config })
  const out: string[] = []
  const log = (s: string) => out.push(s)

  // 1. Test docs in pressRelease + insight
  for (const col of ['pressRelease', 'insight'] as const) {
    const r: any = await payload.find({ collection: col as never, limit: 100, depth: 0, overrideAccess: true })
    const tests = (r.docs ?? []).filter((d: any) => /^test/i.test(d.title ?? ''))
    log(`[${col}] total=${r.totalDocs} testTitled=${tests.length}${tests.length ? ' → ' + tests.map((d: any) => `"${d.title}"(${d._status ?? '?'})`).join(', ') : ''}`)
  }

  // 2. home page: process array + engagement/solutions card order
  const home: any = await payload.find({ collection: 'pages' as never, where: { slug: { equals: 'home' } } as never, depth: 0, limit: 1, overrideAccess: true })
  const layout = home.docs?.[0]?.layout ?? []
  log(`[home] blocks=${layout.map((b: any) => b.blockType).join(', ')}`)
  for (const b of layout) {
    if (b.blockType === 'processSection' || /process/i.test(b.blockType)) {
      const items = b.process ?? b.items ?? []
      const titles = items.map((i: any) => i.title)
      const emptyBodies = items.filter((i: any) => !i.description || (typeof i.description === 'object' && !JSON.stringify(i.description).includes('"text"'))).length
      const dupTitles = titles.filter((t: string, idx: number) => titles.indexOf(t) !== idx)
      log(`  process(${b.blockType}): count=${items.length} emptyBodies=${emptyBodies} titles=[${titles.join(' | ')}] dups=[${dupTitles.join(',')}]`)
    }
    if (/engage|solutionsEngage/i.test(b.blockType)) {
      const cards = b.cards ?? []
      log(`  engagement(${b.blockType}): order=[${cards.map((c: any) => c.title ?? c.name ?? c.heading).join(' | ')}]`)
    }
  }

  // 3. footer global: capabilities relationship count
  try {
    const footer: any = await payload.findGlobal({ slug: 'footer' as never, depth: 0, overrideAccess: true } as never)
    for (const k of ['capabilities', 'solutions', 'industries']) {
      const v = footer?.[k]
      log(`[footer] ${k}=${Array.isArray(v) ? v.length : typeof v}`)
    }
  } catch (e: any) { log(`[footer] err ${String(e?.message).slice(0, 50)}`) }

  // 4. industry excerpts (look for generic/duplicate lines)
  const inds: any = await payload.find({ collection: 'industry' as never, limit: 50, depth: 0, overrideAccess: true })
  log(`[industry] total=${inds.totalDocs}`)
  for (const d of inds.docs ?? []) {
    const ex = (d.excerpts ?? d.excerpt ?? '').toString().slice(0, 70)
    log(`  ${d.slug}: "${ex}"`)
  }

  // 5. about page: aboutApproach block cards (duplicate "certified global delivery hub")
  const about: any = await payload.find({ collection: 'pages' as never, where: { slug: { equals: 'about' } } as never, depth: 0, limit: 1, overrideAccess: true })
  const aLayout = about.docs?.[0]?.layout ?? []
  log(`[about] blocks=${aLayout.map((b: any) => b.blockType).join(', ')}`)

  console.log('\n===== CMS AUDIT =====\n' + out.join('\n') + '\n')
  process.exit(0)
}
await run()
