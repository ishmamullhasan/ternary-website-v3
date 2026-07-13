// Fill any empty `industriesSection.industries` relationship with up to 4 industry records.
//
// The block used to render picked media tiles (`images`); that field is gone and both modes now
// read `industries`, so a block left with an empty relationship renders nothing. This backfills it
// from the industry collection (first 4, in collection order). Blocks that already have industries
// picked are left alone.
//
// DRY by default; set SEED_DRY=0 to apply.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/fill-industries-section.ts            # preview
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/fill-industries-section.ts # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const PICK = 4

const payload: Payload = await getPayload({ config })
payload.logger.info(`Backfill industriesSection.industries ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

// afterChange hooks call revalidateTag(), which throws outside a request context; the DB write
// commits first, so swallow only that specific error (same handling as seed-content.ts).
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
  limit: PICK,
  depth: 0,
  locale: 'en',
  overrideAccess: true,
})

const ids = industries.docs.map((d) => String(d.id))
if (ids.length === 0) {
  payload.logger.warn('No industry records exist — nothing to pick. Seed the industry collection first.')
  process.exit(0)
}
payload.logger.info(`  picking ${ids.length} industr${ids.length === 1 ? 'y' : 'ies'}:`)
for (const d of industries.docs) payload.logger.info(`    · ${d.title ?? d.slug} (${d.id})`)

const rawDocs = await payload.db.connection
  .collection('pages')
  .find({ 'layout.blockType': 'industriesSection' })
  .toArray()
payload.logger.info(`  found ${rawDocs.length} page(s) with an industriesSection block`)

for (const rawDoc of rawDocs) {
  const id = String(rawDoc._id)

  // Read through the Local API so block ids / other-locale values stay attached on write.
  const doc = (await payload.findByID({
    collection: 'pages',
    id,
    depth: 0,
    locale: 'en',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  })) as any

  let filled = 0
  const newLayout = (doc.layout ?? []).map((b: any) => {
    if (b.blockType !== 'industriesSection') return b
    const current: unknown[] = Array.isArray(b.industries) ? b.industries : []
    if (current.length > 0) return b // already picked — leave it
    filled++
    return { ...b, industries: ids }
  })

  if (filled === 0) {
    payload.logger.info(`  page ${doc.slug ?? id}: already populated — skipped`)
    continue
  }
  payload.logger.info(`  page ${doc.slug ?? id}: filling ${filled} block(s)`)
  if (DRY) continue

  // Pages.title is required+localized; an update that omits it fails re-validation (see memory /
  // seed-content.ts). Publish so the change is live, matching the seeded state of these pages.
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

payload.logger.info(DRY ? 'DRY RUN complete — re-run with SEED_DRY=0 to apply.' : 'Backfill complete.')
process.exit(0)
