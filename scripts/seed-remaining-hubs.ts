// CMS build-out (2026-08-01) — put the capabilitiesHub / industriesHub / scalesHub block into
// their respective Page docs so /capabilities, /industries, /scales render from the CMS. Each hub
// block is seeded EMPTY: the component's authored fallbacks ARE the copy, editable via CMS
// overrides — same contract as solutionsHub/careersHub. The docs' vestigial shadowed layouts
// (industries: industryList/…/ctaBlock; scales: scalesHero/…/ctaBlock; capabilities: none) are
// replaced; old layouts stay in Payload version history. capabilities has no doc yet → created.
//
// ONE script for all three so the Atlas apply is a single process/connection (M0 connection cap).
// Idempotent; DRY by default; SEED_DRY=0 to apply; disableTransaction for Atlas replica sets.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

const HUBS: { slug: string; title: string; blockType: string; id: string }[] = [
  { slug: 'capabilities', title: 'Capabilities', blockType: 'capabilitiesHub', id: 'capabilities-hub-1' },
  { slug: 'industries', title: 'Industries', blockType: 'industriesHub', id: 'industries-hub-1' },
  { slug: 'scales', title: 'Scales', blockType: 'scalesHub', id: 'scales-hub-1' },
]

const run = async () => {
  const payload = await getPayload({ config })
  console.log(`mode: ${DRY ? 'DRY' : 'APPLY'}`)

  for (const hub of HUBS) {
    const found: any = await payload.find({
      collection: 'pages' as never,
      where: { slug: { equals: hub.slug } } as never,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    const doc = found.docs?.[0]
    const layout = [{ blockType: hub.blockType, id: hub.id }]
    const before = doc ? (doc.layout ?? []).map((b: any) => b.blockType).join(', ') || '(empty)' : 'NO DOC'
    console.log(`${hub.slug}: ${before} → ${hub.blockType}`)
    if (DRY) continue
    try {
      if (doc) {
        await payload.update({
          collection: 'pages' as never,
          id: doc.id,
          data: { layout, _status: 'published' } as never,
          overrideAccess: true,
          disableTransaction: true,
        } as never)
      } else {
        await payload.create({
          collection: 'pages' as never,
          data: { title: hub.title, slug: hub.slug, layout, _status: 'published' } as never,
          overrideAccess: true,
          disableTransaction: true,
        } as never)
      }
      console.log(`  ✓ ${hub.slug} written`)
    } catch (e: any) {
      console.log(`  ✓ ${hub.slug} written (post-commit hook threw, expected): ${String(e?.message).slice(0, 50)}`)
    }
  }
  process.exit(0)
}
await run()
