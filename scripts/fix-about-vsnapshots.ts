// Repair the 14 structurally-corrupted ABOUT-page version snapshots whose `aboutLeadership` block
// stored each members row as a bare ObjectId (the relationship ref) instead of the canonical
// {member, wide, id} object. bson6 can't serialize those ObjectIds (internal buffer is a string),
// so the admin version list / version detail RSC crashes with
// "BSONError: Cannot create Buffer from the passed potentialBuffer".
//
// The per-row `wide`/`id` data is unrecoverable, so we overwrite the whole members array with the
// current clean list from the main about doc — same durable approach as fix-careers-vsnapshots.ts.
// Replacing the entire array (not patching into corrupted elements) sidesteps the driver's
// "cannot create field" error. Block index differs across snapshots, so we locate it by blockType.
import config from '@payload-config'
import { getPayload } from 'payload'

const PARENT = process.env.DOC_ID || '6a32be3f0e362afdc192f0c7'
const BLOCK = 'aboutLeadership'
const APPLY = process.env.APPLY === '1'

const isCanonicalRow = (m: unknown): boolean =>
  m != null &&
  typeof m === 'object' &&
  (m as { _bsontype?: string })._bsontype !== 'ObjectId' &&
  'member' in (m as object) &&
  'id' in (m as object)

const run = async () => {
  const payload = await getPayload({ config })
  const mongoose = (await import('mongoose')).default
  const ObjectId = mongoose.Types.ObjectId
  const { EJSON } = mongoose.mongo.BSON as unknown as { EJSON: { stringify: (v: unknown) => string } }
  const conn = (payload.db as unknown as { connection: import('mongoose').Connection }).connection

  // 1) Current clean members from the main about doc's aboutLeadership block.
  const main = (await conn.collection('pages').findOne({ _id: new ObjectId(PARENT) })) as Record<string, unknown>
  if (main?.slug !== 'about') throw new Error(`parent ${PARENT} is not the about page (slug=${main?.slug})`)
  const mainBlock = (main.layout as Record<string, unknown>[]).find((b) => b.blockType === BLOCK)
  if (!mainBlock) throw new Error(`main about doc has no ${BLOCK} block`)
  const cleanMembers = (mainBlock.members as Record<string, unknown>[]).map((m) => ({
    member: new ObjectId(String(m.member)), // relationship ref -> proper bson6 ObjectId
    wide: typeof m.wide === 'boolean' ? m.wide : true,
    id: String(m.id), // row id -> string (Payload canonical)
  }))
  console.log(`clean members rebuilt: ${cleanMembers.length}${APPLY ? '' : '   (DRY RUN — set APPLY=1 to write)'}`)

  // 2) Overwrite members in every corrupted about version snapshot.
  const vcoll = conn.db!.collection('_pages_versions')
  const versions = await vcoll
    .find({ parent: new ObjectId(PARENT) })
    .sort({ updatedAt: -1 })
    .toArray()
  let fixed = 0
  for (const doc of versions) {
    const layout = (doc as { version?: { layout?: Record<string, unknown>[] } }).version?.layout ?? []
    const idx = layout.findIndex((b) => b.blockType === BLOCK)
    if (idx < 0) continue
    const members = layout[idx].members
    if (!Array.isArray(members) || members.every(isCanonicalRow)) continue // already clean
    if (!APPLY) {
      console.log(`  would fix _id=${doc._id} block[${idx}]`)
      fixed++
      continue
    }
    const res = await vcoll.updateOne({ _id: doc._id }, { $set: { [`version.layout.${idx}.members`]: cleanMembers } })
    console.log(`  fixed _id=${doc._id} block[${idx}] matched=${res.matchedCount} modified=${res.modifiedCount}`)
    fixed++
  }
  console.log(`${APPLY ? 'fixed' : 'would fix'} ${fixed} snapshot(s)`)

  // 3) Verify every about version now serializes (only meaningful after APPLY).
  const v = await payload.findVersions({
    collection: 'pages' as never,
    where: { parent: { equals: PARENT } },
    limit: 50,
    depth: 1,
    locale: 'all' as never,
    overrideAccess: true,
  } as never)
  let fails = 0
  v.docs.forEach((d: unknown, i: number) => {
    try {
      EJSON.stringify(d)
    } catch (e) {
      fails++
      console.error(`  version[${i}] STILL FAILS: ${(e as Error).message}`)
    }
  })
  console.log(
    fails === 0 ? `\nAll ${v.docs.length} about versions serialize OK` : `\n${fails} version(s) still failing`,
  )

  await new Promise((r) => setTimeout(r, 300))
  process.exit(APPLY && fails !== 0 ? 2 : 0)
}

try {
  await run()
} catch (e) {
  console.error('FIX ERROR:', (e as Error).stack)
  process.exit(1)
}
