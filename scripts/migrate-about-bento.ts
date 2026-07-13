// Migrate aboutSection.items from the flat polymorphic-relationship shape
//   items: [{ relationTo, value }]
// to the wrapped array shape
//   items: [{ item: { relationTo, value } }]
// The per-card `size` field this script once wrote is gone — the grid is uniform, so display
// order is the only thing a row carries.
//
// Old rows are sourced from RAW Mongo docs (the new array schema no longer describes them, so a
// schema-sanitized read may drop them); the update itself goes through the Local API, preserving
// block ids / organization row ids so other-locale values stay attached (see seed-content.ts).
//
// DRY by default; set SEED_DRY=0 to apply.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/migrate-about-bento.ts            # preview
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/migrate-about-bento.ts # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

const payload: Payload = await getPayload({ config })
payload.logger.info(`Migrate aboutSection items → wrapped rows ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

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

type OldRow = { relationTo?: string; value?: unknown }
type NewRow = { item: { relationTo: string; value: string } }

const isOldRow = (r: unknown): r is Required<OldRow> =>
  !!r && typeof r === 'object' && 'relationTo' in r && 'value' in r && !('item' in r)

const convertItems = (rows: unknown[]): { rows: NewRow[]; converted: number } => {
  let converted = 0
  const out: NewRow[] = []
  for (const r of rows) {
    if (isOldRow(r)) {
      out.push({ item: { relationTo: r.relationTo, value: String(r.value) } })
      converted++
    } else if (r && typeof r === 'object' && 'item' in r) {
      out.push(r as NewRow) // already migrated
    }
  }
  return { rows: out, converted }
}

const rawDocs = await payload.db.connection.collection('pages').find({ 'layout.blockType': 'aboutSection' }).toArray()

payload.logger.info(`  found ${rawDocs.length} page(s) with an aboutSection block`)

for (const rawDoc of rawDocs) {
  const id = String(rawDoc._id)
  // Old-shape items keyed by block id, taken from the raw doc.
  const rawItemsByBlockId = new Map<string, unknown[]>()
  for (const b of rawDoc.layout ?? []) {
    if (b?.blockType === 'aboutSection') rawItemsByBlockId.set(String(b.id), Array.isArray(b.items) ? b.items : [])
  }

  const doc = (await payload.findByID({
    collection: 'pages',
    id,
    depth: 0,
    locale: 'en',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  })) as any

  let totalConverted = 0
  const newLayout = (doc.layout ?? []).map((b: any) => {
    if (b.blockType !== 'aboutSection') return b
    const source = rawItemsByBlockId.get(String(b.id)) ?? (Array.isArray(b.items) ? b.items : [])
    const { rows, converted } = convertItems(source)
    totalConverted += converted
    return { ...b, items: rows }
  })

  payload.logger.info(`  page ${doc.slug ?? id}: converted ${totalConverted} item row(s)`)
  if (totalConverted === 0 || DRY) continue

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

payload.logger.info(DRY ? 'DRY RUN complete — re-run with SEED_DRY=0 to apply.' : 'Migration complete.')
process.exit(0)
