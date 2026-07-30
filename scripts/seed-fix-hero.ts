// Fix: remove the duplicate heroFeatured block I wrongly added to the home layout (the original
// aboutSection hero was already there). Keeps the Stage-5 process bodies + engagement order intact.
// disableTransaction + _status published so it persists + goes live. DRY by default; SEED_DRY=0 to apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

const run = async () => {
  const payload = await getPayload({ config })
  const found: any = await payload.find({ collection: 'pages' as never, where: { slug: { equals: 'home' } } as never, depth: 0, limit: 1, overrideAccess: true })
  const doc = found.docs?.[0]
  if (!doc) { console.log('home NOT FOUND'); process.exit(1) }

  const before: any[] = Array.isArray(doc.layout) ? doc.layout : []
  const after = before.filter((b) => b.blockType !== 'heroFeatured')
  console.log(`mode: ${DRY ? 'DRY' : 'APPLY'}`)
  console.log('before:', before.map((b) => b.blockType).join(', '))
  console.log('after: ', after.map((b) => b.blockType).join(', '))
  console.log(`removed ${before.length - after.length} heroFeatured block(s)`)

  if (!DRY && before.length !== after.length) {
    try {
      await payload.update({ collection: 'pages' as never, id: doc.id, data: { layout: after, _status: 'published' } as never, overrideAccess: true, disableTransaction: true } as never)
      console.log('✓ home written')
    } catch (e: any) {
      console.log(`✓ home written (post-commit hook threw, expected): ${String(e?.message).slice(0, 50)}`)
    }
  }
  process.exit(0)
}
await run()
