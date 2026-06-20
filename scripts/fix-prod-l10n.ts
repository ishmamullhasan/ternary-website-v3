// PROD l10n + dropdown repair:
//  (1) backfill empty `en` titles from the slug for real (non-placeholder) industry/solution docs,
//  (2) repoint footer.capabilities to the real capability docs (current rel points at dangling IDs)
// so the Capabilities dropdown populates. CONTENT_DRY=1 preview (default) / CONTENT_DRY=0 apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.CONTENT_DRY !== '0'
const BENIGN = (e: unknown) => String((e as Error)?.message || e).includes('static generation store missing')
const save = async (fn: () => Promise<unknown>) => {
  try {
    await fn()
  } catch (e) {
    if (!BENIGN(e)) throw e
  }
}
// slug → Title Case, e.g. technology-platforms → "Technology Platforms"
const titleFromSlug = (slug: string) => slug.split('-').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
const PLACEHOLDER_SLUG = /(^|-)title($|-)|^title-?\d*$/i

// The Capabilities dropdown order (real capability docs that carry en titles).
const CAP_ORDER = ['product-development', 'engineering-augmentation', 'enterprise-transformation', 'managed-systems']

const run = async () => {
  const payload = await getPayload({ config })

  // (1) backfill empty en titles
  for (const coll of ['industry', 'solution'] as const) {
    const res = await payload.find({ collection: coll as never, locale: 'en', depth: 0, limit: 100, pagination: false })
    for (const d of res.docs as { id: string; slug?: string; title?: string }[]) {
      const slug = d.slug ?? ''
      if (d.title || !slug || PLACEHOLDER_SLUG.test(slug)) continue
      const title = titleFromSlug(slug)
      console.log(`  [${coll}] ${slug}  →  title="${title}"`)
      if (!DRY) await save(() => payload.update({ collection: coll as never, id: d.id as never, locale: 'en', data: { title } as never }))
    }
  }

  // (2) repoint footer.capabilities to the real capability docs
  const caps = await payload.find({ collection: 'capability' as never, locale: 'en', depth: 0, limit: 100, pagination: false })
  const bySlug = new Map((caps.docs as { id: string; slug?: string }[]).map((c) => [c.slug, c.id]))
  const ids = CAP_ORDER.map((s) => bySlug.get(s)).filter(Boolean) as string[]
  console.log(`\nfooter.capabilities → ${CAP_ORDER.filter((s) => bySlug.get(s)).join(', ')} (${ids.length} docs)`)
  const footer = (await payload.findGlobal({ slug: 'footer' as never, locale: 'en', depth: 0 })) as Record<string, unknown>
  if (!DRY && ids.length) {
    const { id: _i, globalType: _g, createdAt: _c, updatedAt: _u, ...data } = footer
    await save(() => payload.updateGlobal({ slug: 'footer' as never, locale: 'en', data: { ...data, capabilities: ids } as never }))
  }

  console.log(`\n${DRY ? 'DRY RUN — no writes.' : 'APPLIED.'}`)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(0)
}
try { await run() } catch (e) { console.error('L10N-FIX ERROR:', e); await new Promise((r) => setTimeout(r, 400)); process.exit(1) }
