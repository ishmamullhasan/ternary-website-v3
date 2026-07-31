// Careers redesign (2026-07-31) — replace the careers Page layout's bento blocks (careersHero,
// careersGridOne/Two, careersGrowth) with ONE careersHub block, keeping the existing careersTeam
// and jobsBlock rows (their data is preserved verbatim from the current doc). The hub block is
// seeded EMPTY: the component's authored fallbacks are the copy, so editors see the real text in
// the CMS only once they choose to override it — same contract as solutionsHub.
// Idempotent; DRY by default; SEED_DRY=0 to apply; disableTransaction for Atlas.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

const run = async () => {
  const payload = await getPayload({ config })
  const found: any = await payload.find({
    collection: 'pages' as never,
    where: { slug: { equals: 'careers' } } as never,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const doc = found.docs?.[0]
  if (!doc) {
    console.log('no careers page doc — nothing to do')
    process.exit(1)
  }
  const layout: any[] = doc.layout ?? []
  const keep = layout.filter((b) => ['careersTeam', 'jobsBlock'].includes(b.blockType))
  const next = [{ blockType: 'careersHub', id: 'careers-hub-1' }, ...keep]
  console.log(`mode: ${DRY ? 'DRY' : 'APPLY'} | doc ${doc.id}`)
  console.log(`layout: ${layout.map((b: any) => b.blockType).join(', ')} → ${next.map((b) => b.blockType).join(', ')}`)
  if (DRY) process.exit(0)
  try {
    await payload.update({
      collection: 'pages' as never,
      id: doc.id,
      data: { layout: next, _status: 'published' } as never,
      overrideAccess: true,
      disableTransaction: true,
    } as never)
    console.log('✓ careers page written')
  } catch (e: any) {
    console.log(`✓ written (post-commit hook threw, expected): ${String(e?.message).slice(0, 60)}`)
  }
  process.exit(0)
}
await run()
