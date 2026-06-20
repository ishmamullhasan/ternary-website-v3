// WEB-458 — regenerate press-release slugs from their real titles (they carry placeholder
// "title---copy" slugs but real content like "Ternary Operationalizes a Dual-Hub..."). Relationship
// references are by id, so the stories block link auto-updates. Skips placeholder/empty titles.
// CONTENT_DRY=1 preview (default) / CONTENT_DRY=0 apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.CONTENT_DRY !== '0'
const BENIGN = (e: unknown) => String((e as Error)?.message || e).includes('static generation store missing')
const slugify = (s: string) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70)

const run = async () => {
  const payload = await getPayload({ config })
  const res = await payload.find({ collection: 'pressRelease' as never, locale: 'en', depth: 0, limit: 200, pagination: false })
  const used = new Set<string>()
  console.log(`\n=== pressRelease slug regen (${res.totalDocs} docs) ===`)
  for (const d of res.docs as { id: string; title?: string; slug?: string }[]) {
    const title = (d.title ?? '').trim()
    // Skip placeholder titles ("Title"/"title"/empty) — only regen real ones.
    if (!title || /^title$/i.test(title)) {
      console.log(`  – skip (placeholder title): slug=${d.slug}`)
      continue
    }
    let next = slugify(title)
    while (used.has(next)) next += '-2'
    used.add(next)
    if (next && next !== d.slug) {
      console.log(`  • ${d.slug}  →  ${next}   ("${title.slice(0, 50)}")`)
      if (!DRY) {
        try {
          await payload.update({ collection: 'pressRelease' as never, id: d.id as never, locale: 'en', data: { slug: next } as never })
        } catch (e) {
          if (!BENIGN(e)) throw e
        }
      }
    } else {
      console.log(`  – ok: ${d.slug}`)
    }
  }
  console.log(`\n${DRY ? 'DRY RUN — no writes.' : 'APPLIED.'}`)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error('PRESS-SLUG ERROR:', e)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(1)
}
