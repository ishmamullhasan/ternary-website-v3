// Set the HOME industriesSection block to show ALL industries. The block + its 5-col grid are built
// for eight cards ("matching the Capabilities section"), but only three industries were picked. This
// sets the non-fullWidth (home) block's relationship to every industry (excluding any "test" record).
// The fullWidth benefit grids on industry-detail pages are left untouched.
//
// DRY by default; set SEED_DRY=0 to apply.
//   pnpm payload run ./scripts/set-home-industries.ts             # preview
//   SEED_DRY=0 pnpm payload run ./scripts/set-home-industries.ts  # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const payload: Payload = await getPayload({ config })
payload.logger.info(`Set home industriesSection → all industries ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

// afterChange hooks call revalidateTag(), which throws outside a request context; swallow only that.
const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

const industries = await payload.find({
  collection: 'industry',
  limit: 100,
  depth: 0,
  locale: 'en',
  overrideAccess: true,
})
// The chosen "clean 8": drop any test record, plus "Software Platforms" (overlaps Technology
// Platforms — already hidden on the /industries hub) and "Financial Services & Insurance" (Banking &
// Capital Markets carries finance). Fills exactly two rows of four.
const EXCLUDE = /test|software platforms|financial services/i
// Order to match the /industries hub sector order for a coherent read.
const ORDER = ['banking', 'health', 'manufactur', 'sport', 'hospitality', 'consumer', 'public', 'technology']
const rank = (t: unknown): number => {
  const s = String(t ?? '').toLowerCase()
  const i = ORDER.findIndex((k) => s.includes(k))
  return i < 0 ? 99 : i
}
const real = industries.docs
  .filter((d) => !EXCLUDE.test(String(d.title ?? d.slug ?? '')))
  .sort((a, b) => rank(a.title) - rank(b.title))
const ids = real.map((d) => String(d.id))
payload.logger.info(`  industry records: ${industries.docs.length}, using ${ids.length} (excluding "test"):`)
for (const d of real) payload.logger.info(`    · ${d.title ?? d.slug} (${d.id})`)
if (ids.length === 0) {
  payload.logger.warn('No industry records — nothing to set.')
  process.exit(0)
}

const rawDocs = await payload.db.connection
  .collection('pages')
  .find({ 'layout.blockType': 'industriesSection' })
  .toArray()
payload.logger.info(`  found ${rawDocs.length} page(s) with an industriesSection block`)

for (const rawDoc of rawDocs) {
  const id = String(rawDoc._id)
  const doc = (await payload.findByID({
    collection: 'pages',
    id,
    depth: 0,
    locale: 'en',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  })) as any

  let changed = 0
  const newLayout = (doc.layout ?? []).map((b: any) => {
    if (b.blockType !== 'industriesSection') return b
    if (b.fullWidth) return b // leave the industry-detail benefit grids alone
    const current: string[] = Array.isArray(b.industries) ? b.industries.map((x: unknown) => String(x)) : []
    const same = current.length === ids.length && ids.every((x) => current.includes(x))
    if (same) return b
    changed++
    payload.logger.info(`    home block: ${current.length} → ${ids.length} industries`)
    return { ...b, industries: ids }
  })

  if (changed === 0) {
    payload.logger.info(`  page ${doc.slug ?? id}: home block already complete — skipped`)
    continue
  }
  payload.logger.info(`  page ${doc.slug ?? id}: updating ${changed} home block(s)`)
  if (DRY) continue

  await ignoreRevalidate(() =>
    payload.update({
      collection: 'pages',
      id,
      data: { title: doc.title || 'Home', layout: newLayout, _status: 'published' },
      context: { disableRevalidate: true },
    }),
  )
  payload.logger.info(`  page ${doc.slug ?? id}: updated + published`)
}

payload.logger.info(DRY ? 'DRY RUN complete — re-run with SEED_DRY=0 to apply.' : 'Done.')
process.exit(0)
