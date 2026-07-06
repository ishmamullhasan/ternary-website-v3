// Migrate aboutLeadership.members from the flat relationship shape
//   members: ["<team id>", …]
// to the admin-controlled width rows
//   members: [{ member: "<team id>", wide }, …]
// Initial wide flags follow the Figma alternation (node 1018:4153) in DISPLAY order — the
// component re-sorts members by the team collection's manual `_order` (sortByTeamOrder), so the
// pattern is assigned by roster rank, not raw row order: narrow, wide, narrow, wide, …
//
// Old rows are sourced from RAW Mongo docs (the new array schema no longer describes them, so a
// schema-sanitized read may drop them); the update itself goes through the Local API (same
// approach as migrate-about-bento.ts).
//
// DRY by default; set SEED_DRY=0 to apply.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/migrate-about-leadership-wide.ts            # preview
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/migrate-about-leadership-wide.ts # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

const payload: Payload = await getPayload({ config })
payload.logger.info(`Migrate aboutLeadership members → wide rows ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

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

// Global roster order: member id -> display rank (missing `_order` sinks to the end, matching
// sortByTeamOrder's semantics on the front end).
const teamDocs = await payload.find({ collection: 'team', depth: 0, limit: 500, sort: '_order' })
const rank = new Map(teamDocs.docs.map((d, i) => [String(d.id), i]))

type NewRow = { id?: string; member: string; wide: boolean }

// Old flat ids (strings or ObjectIds) or already-migrated rows both normalize to NewRow[].
const convertMembers = (rows: unknown[]): { rows: NewRow[]; converted: number } => {
  let converted = 0
  const flat: { member: string; id?: string; wide?: boolean }[] = []
  for (const r of rows) {
    if (r && typeof r === 'object' && 'member' in r) {
      const row = r as { member: unknown; id?: string; wide?: boolean }
      flat.push({ member: String(row.member), id: row.id, wide: row.wide })
    } else if (r) {
      flat.push({ member: String(r) })
      converted++
    }
  }
  // Alternate in display order: even rank position → narrow, odd → wide.
  const display = flat
    .map((row, i) => ({ row, i, r: rank.get(row.member) ?? Number.MAX_SAFE_INTEGER }))
    .sort((a, z) => a.r - z.r || a.i - z.i)
  const wideByRowIndex = new Map<number, boolean>()
  display.forEach((d, pos) => wideByRowIndex.set(d.i, pos % 2 === 1))
  return {
    rows: flat.map((row, i) => ({ ...row, wide: wideByRowIndex.get(i) ?? false })),
    converted,
  }
}

const rawDocs = await payload.db.connection
  .collection('pages')
  .find({ 'layout.blockType': 'aboutLeadership' })
  .toArray()

payload.logger.info(`  found ${rawDocs.length} page(s) with an aboutLeadership block`)

for (const rawDoc of rawDocs) {
  const id = String(rawDoc._id)
  // Old-shape members keyed by block id, taken from the raw doc.
  const rawMembersByBlockId = new Map<string, unknown[]>()
  for (const b of rawDoc.layout ?? []) {
    if (b?.blockType === 'aboutLeadership') {
      rawMembersByBlockId.set(String(b.id), Array.isArray(b.members) ? b.members : [])
    }
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
    if (b.blockType !== 'aboutLeadership') return b
    const source = rawMembersByBlockId.get(String(b.id)) ?? (Array.isArray(b.members) ? b.members : [])
    const { rows, converted } = convertMembers(source)
    totalConverted += converted
    return { ...b, members: rows }
  })

  payload.logger.info(`  page ${doc.slug ?? id}: converted ${totalConverted} member row(s)`)
  if (totalConverted === 0 || DRY) continue

  // Pages.title is required+localized; an update that omits it fails re-validation (see memory /
  // seed-content.ts). Publish so the change is live, matching the current state of the page.
  await ignoreRevalidate(() =>
    payload.update({
      collection: 'pages',
      id,
      data: { title: doc.title, layout: newLayout, _status: 'published' },
      locale: 'en',
      context: { disableRevalidate: true },
    }),
  )
  payload.logger.info(`  page ${doc.slug ?? id}: updated + published`)
}

payload.logger.info(DRY ? 'DRY RUN complete — re-run with SEED_DRY=0 to apply.' : 'Migration complete.')
process.exit(0)
