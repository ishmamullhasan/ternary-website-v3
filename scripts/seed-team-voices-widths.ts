// Alternate card widths in the "Team voices. Production stories." carousel (careersTeam block)
// to match Figma node 1018:4153: narrow, wide, narrow, wide, … The narrow/wide flag is assigned
// in DISPLAY order — the component re-sorts members by the team collection's manual `_order`
// (see sortByTeamOrder), so alternating by raw row order would scramble once sorted.
//
// DRY by default; set SEED_DRY=0 to apply.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/seed-team-voices-widths.ts            # preview
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/seed-team-voices-widths.ts # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

const payload: Payload = await getPayload({ config })
payload.logger.info(`Team voices carousel — alternate wide flags ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

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
const team = await payload.find({ collection: 'team', depth: 0, limit: 500, sort: '_order' })
const rank = new Map(team.docs.map((d, i) => [String(d.id), i]))

const pages = await payload.find({
  collection: 'pages',
  where: { 'layout.blockType': { equals: 'careersTeam' } },
  depth: 0,
  limit: 50,
  locale: 'en',
  fallbackLocale: false,
  draft: false,
  overrideAccess: true,
})

for (const doc of pages.docs as any[]) {
  let changed = 0
  const newLayout = (doc.layout ?? []).map((b: any) => {
    if (b.blockType !== 'careersTeam' || !Array.isArray(b.members)) return b

    // Display order = roster rank; ties/missing keep their row order (stable sort).
    const display = b.members
      .map((row: any, i: number) => ({ row, i, r: rank.get(String(row.member)) ?? Number.MAX_SAFE_INTEGER }))
      .sort((a: any, z: any) => a.r - z.r || a.i - z.i)

    // Figma pattern starts narrow: positions 0,2,4… are narrow (wide=false), 1,3,5… wide.
    const wideByRowIndex = new Map<number, boolean>()
    display.forEach((d: any, pos: number) => wideByRowIndex.set(d.i, pos % 2 === 1))

    const members = b.members.map((row: any, i: number) => {
      const wide = wideByRowIndex.get(i) ?? true
      if ((row.wide !== false) !== wide) changed++
      return { ...row, wide }
    })
    return { ...b, members }
  })

  payload.logger.info(`  page ${doc.slug ?? doc.id}: ${changed} row(s) change`)
  if (changed === 0 || DRY) continue

  // Pages.title is required+localized; an update that omits it fails re-validation (see memory /
  // seed-content.ts). Publish so the change is live, matching the current state of the page.
  await ignoreRevalidate(() =>
    payload.update({
      collection: 'pages',
      id: doc.id,
      data: { title: doc.title, layout: newLayout, _status: 'published' },
      locale: 'en',
      context: { disableRevalidate: true },
    }),
  )
  payload.logger.info(`  page ${doc.slug ?? doc.id}: updated + published`)
}

payload.logger.info(DRY ? 'DRY RUN complete — re-run with SEED_DRY=0 to apply.' : 'Done.')
process.exit(0)
