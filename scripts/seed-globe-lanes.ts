// Seed the Global Delivery block's `lanes` array with the routes the globe used to hard-code.
//
// The block used to hold `image` / `title` / `excerpt`; those are gone, replaced by `lanes` — the
// shipping routes the 3D globe draws, now pinned on a map in the admin. A block with no lanes still
// renders (the globe falls back to its built-in Dhaka → US routes), but the CMS would show an empty
// picker, so this writes those three lanes in as real, editable content.
//
// Labels are localized, coordinates are not, so each locale is written separately — with the row ids
// fixed up front and reused across both writes, or the bn pass would create its own rows and the
// two locales would drift apart (see the per-locale publish notes in seed-content.ts).
//
// DRY by default; set SEED_DRY=0 to apply.
//   pnpm payload run ./scripts/seed-globe-lanes.ts            # preview
//   SEED_DRY=0 pnpm payload run ./scripts/seed-globe-lanes.ts # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

type Locale = 'en' | 'bn'
type Point = { label?: string | null; lat?: number | null; lng?: number | null }
type Row = { id?: string; from?: Point; to?: Point; color?: string }

// Fixed row ids (24-char hex, as Mongo expects) so both locales write to the same three rows.
const LANES = [
  {
    id: '000000000000000000000a01',
    from: { label: { en: 'Dhaka', bn: 'ঢাকা' }, lat: 23.8103, lng: 90.4125 },
    to: { label: { en: 'New York', bn: 'নিউ ইয়র্ক' }, lat: 40.7128, lng: -74.006 },
    color: 'cream',
  },
  {
    id: '000000000000000000000a02',
    from: { label: { en: 'Dhaka', bn: 'ঢাকা' }, lat: 23.8103, lng: 90.4125 },
    to: { label: { en: 'Austin', bn: 'অস্টিন' }, lat: 30.2672, lng: -97.7431 },
    color: 'amber',
  },
  {
    id: '000000000000000000000a03',
    from: { label: { en: 'Dhaka', bn: 'ঢাকা' }, lat: 23.8103, lng: 90.4125 },
    to: { label: { en: 'San Francisco', bn: 'সান ফ্রান্সিসকো' }, lat: 37.7749, lng: -122.4194 },
    color: 'azure',
  },
] as const

const lanesFor = (locale: Locale) =>
  LANES.map((l) => ({
    id: l.id,
    from: { label: l.from.label[locale], lat: l.from.lat, lng: l.from.lng },
    to: { label: l.to.label[locale], lat: l.to.lat, lng: l.to.lng },
    color: l.color,
  }))

const payload: Payload = await getPayload({ config })
payload.logger.info(`Seed globalDeliverySection.lanes ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

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

const rawDocs = await payload.db.connection
  .collection('pages')
  .find({ 'layout.blockType': 'globalDeliverySection' })
  .toArray()
payload.logger.info(`  found ${rawDocs.length} page(s) with a globalDeliverySection block`)

for (const rawDoc of rawDocs) {
  const id = String(rawDoc._id)

  for (const locale of ['en', 'bn'] as Locale[]) {
    // fallbackLocale: false — otherwise an unset bn field reads back as its en value, and writing
    // that back would materialize English text as real Bengali content.
    const doc = (await payload.findByID({
      collection: 'pages',
      id,
      depth: 0,
      locale,
      fallbackLocale: false,
      draft: false,
      overrideAccess: true,
    })) as unknown as { slug?: string; title?: string; layout?: ({ blockType: string } & Record<string, unknown>)[] }

    let touched = 0
    const layout = (doc.layout ?? []).map((block) => {
      if (block.blockType !== 'globalDeliverySection') return block
      const existing = (block as { lanes?: Row[] }).lanes ?? []

      // Only `label` is localized — the coordinates and colour are one shared value. So after the en
      // pass the bn locale already *has* rows (same ids, same lat/lng) with their labels unset. Row
      // count alone therefore can't say whether this locale is done; the labels have to.
      const named = (r: Row): boolean => Boolean(r?.from?.label?.trim() && r?.to?.label?.trim())
      if (existing.length > 0 && existing.every(named)) return block

      touched++
      if (existing.length === 0) {
        // image/title/excerpt are no longer in the schema; spreading the block keeps what it still
        // holds (heading, description) and Payload drops the dead fields on write.
        return { ...block, lanes: lanesFor(locale) }
      }

      // Rows exist: fill in just the labels this locale is missing, keyed by row id, so an editor's
      // own coordinates/colours survive.
      return {
        ...block,
        lanes: existing.map((row, i) => {
          const seed = LANES.find((l) => l.id === row.id) ?? LANES[i]
          if (!seed) return row
          return {
            ...row,
            from: { ...row.from, label: row.from?.label?.trim() || seed.from.label[locale] },
            to: { ...row.to, label: row.to?.label?.trim() || seed.to.label[locale] },
          }
        }),
      }
    })

    if (touched === 0) {
      payload.logger.info(`  page ${doc.slug ?? id} [${locale}]: lanes already set — skipped`)
      continue
    }

    // Pages.title is required + localized, and an update that omits it fails re-validation — but
    // this locale's title is genuinely unset, and substituting the English one would materialize
    // English text as real Bengali content. Leave the locale alone; its lanes fall back to en.
    const title = doc.title?.trim()
    if (!title) {
      payload.logger.warn(`  page ${doc.slug ?? id} [${locale}]: no ${locale} title — skipped (would fabricate one)`)
      continue
    }

    payload.logger.info(`  page ${doc.slug ?? id} [${locale}]: seeding ${LANES.length} lanes into ${touched} block(s)`)
    if (DRY) continue

    await ignoreRevalidate(() =>
      payload.update({
        collection: 'pages',
        id,
        locale,
        data: { title, layout, _status: 'published' },
        context: { disableRevalidate: true },
      }),
    )
    payload.logger.info(`  page ${doc.slug ?? id} [${locale}]: updated + published`)
  }
}

payload.logger.info(DRY ? 'DRY RUN complete — re-run with SEED_DRY=0 to apply.' : 'Seed complete.')
process.exit(0)
