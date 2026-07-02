// Add the missing 4th card (the full-width "benefit" card that sits below the grid, per Figma
// 1291-3163) to the crossIndustryPatterns block on the `industries` page. The block Component
// already renders items[3] as the bottom card; only the CMS data was short one item.
//
// Idempotent: the new row uses a FIXED id (…d0c) so re-runs upsert rather than duplicate. Written
// per-locale (en then bn) with draft:false + _status:'published' — the safe pattern for a
// drafts-enabled collection (see scripts/seed-scale-panels.ts); a per-locale write preserves the
// other locale's values, and the fixed id keeps the new row's localized subfields stable across
// both passes.
//   SEED_DRY=1 pnpm payload run ./scripts/seed-cross-industry-4th.ts   # preview, no writes
//   pnpm payload run ./scripts/seed-cross-industry-4th.ts             # write
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY === '1'
const PAGE_ID = '6a32be520e362afdc192f0f2'
const NEW_ITEM_ID = '6a33cfa7093b5526db8b3d0c' // fixed → idempotent + stable across locales

const ITEM: Record<'en' | 'bn', { title: string; excerpt: string }> = {
  en: {
    title: 'Incremental modernization without downtime',
    excerpt:
      'We decouple legacy monoliths and replace them service by service, so mission-critical systems keep running while the platform beneath them is rebuilt on modern, dependable foundations.',
  },
  bn: {
    title: 'ডাউনটাইম ছাড়াই ধাপে ধাপে আধুনিকীকরণ',
    excerpt:
      'আমরা লিগ্যাসি মনোলিথকে বিচ্ছিন্ন করে সার্ভিস ধরে ধরে প্রতিস্থাপন করি, যাতে নিচের প্ল্যাটফর্মটি আধুনিক ও নির্ভরযোগ্য ভিত্তির উপর পুনর্গঠিত হওয়ার সময়েও মিশন-ক্রিটিক্যাল সিস্টেমগুলো চালু থাকে।',
  },
}

const payload: Payload = await getPayload({ config })

// afterChange revalidateTag() throws outside a Next request; it fires after the commit, so swallow
// only that error.
const tryUpdate = async (fn: () => Promise<unknown>, tag: string) => {
  try {
    await fn()
    payload.logger.info(`  ${tag}: OK`)
  } catch (e: any) {
    const m = String(e?.message ?? e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) {
      payload.logger.info(`  ${tag}: committed (revalidate swallowed)`)
      return
    }
    payload.logger.error(`  ${tag}: ${m}`)
    const errs = e?.data?.errors ?? e?.cause?.errors ?? []
    for (const er of errs) payload.logger.error(`    field="${er?.path}" msg="${er?.message}"`)
    throw e
  }
}

for (const locale of ['en', 'bn'] as const) {
  // Read the PUBLISHED doc (not the draft): the draft can hold incomplete, unpublished blocks
  // whose required fields would fail the publish-time validation below. Published is known-valid.
  const page = (await payload.findByID({
    collection: 'pages' as never,
    id: PAGE_ID,
    locale: locale as never,
    draft: false,
    depth: 0,
  })) as any

  const layout = (page.layout ?? []).map((block: any) => {
    if (block?.blockType !== 'crossIndustryPatterns') return block
    const items = Array.isArray(block.items) ? [...block.items] : []
    const row = { id: NEW_ITEM_ID, title: ITEM[locale].title, excerpt: ITEM[locale].excerpt }
    const idx = items.findIndex((it: any) => String(it?.id) === NEW_ITEM_ID)
    if (idx >= 0) items[idx] = { ...items[idx], ...row }
    else items.push(row)
    return { ...block, items }
  })

  const block = layout.find((b: any) => b?.blockType === 'crossIndustryPatterns')
  payload.logger.info(
    `[${locale}] items now ${block?.items?.length}: ${block?.items?.map((it: any) => it?.title).join(' | ')}`,
  )

  if (DRY) {
    payload.logger.info(`  ${locale}: DRY — no write`)
    continue
  }

  await tryUpdate(
    () =>
      payload.update({
        collection: 'pages' as never,
        id: PAGE_ID,
        locale: locale as never,
        draft: false,
        // `title` is a required localized field; include the per-locale value explicitly so the
        // publish-time validation sees it (the update merge doesn't carry it through on publish).
        data: { title: page.title, layout, _status: 'published' } as never,
      }),
    `page[${locale}]`,
  )
}

// Verify via published reads (bypasses Next cache).
for (const locale of ['en', 'bn'] as const) {
  const r = (await payload.find({
    collection: 'pages' as never,
    where: { slug: { equals: 'industries' } } as never,
    draft: false,
    locale: locale as never,
    overrideAccess: true,
    depth: 0,
    limit: 1,
  })) as any
  const block = (r.docs[0]?.layout ?? []).find((b: any) => b?.blockType === 'crossIndustryPatterns')
  payload.logger.info(
    `verify[${locale}]: ${block?.items?.length} items → ${block?.items?.map((it: any) => it?.title).join(' | ')}`,
  )
}

process.exit(0)
