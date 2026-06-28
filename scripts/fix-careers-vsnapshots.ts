// Repair the 3 structurally-corrupted careers version snapshots (members elements stored as
// `{0: ObjectId(...)}` instead of `{member, wide, id}`). Their member data is unrecoverable, so we
// overwrite the whole members array with the current clean list from the main careers doc. Replacing
// the entire array (not patching into corrupted elements) sidesteps the "cannot create field" error.
import config from '@payload-config'
import { getPayload } from 'payload'

const run = async () => {
  const payload = await getPayload({ config })
  const mongoose = (await import('mongoose')).default
  const ObjectId = mongoose.Types.ObjectId
  const { EJSON } = mongoose.mongo.BSON as unknown as { EJSON: { stringify: (v: unknown) => string } }
  const conn = (payload.db as unknown as { connection: import('mongoose').Connection }).connection

  // 1) Current clean members from the main careers doc.
  const main = (await conn.collection('pages').findOne({ slug: 'careers' })) as Record<string, unknown>
  const mainBlock = (main.layout as Record<string, unknown>[]).find((b) => b.blockType === 'careersTeam')!
  const cleanMembers = (mainBlock.members as Record<string, unknown>[]).map((m) => ({
    member: new ObjectId(String(m.member)), // relationship ref -> proper bson6 ObjectId
    wide: typeof m.wide === 'boolean' ? m.wide : true,
    id: String(m.id), // row id -> string (Payload canonical)
  }))
  console.log(`clean members rebuilt: ${cleanMembers.length}`)

  // 2) Overwrite members in each corrupted version snapshot.
  const targets = ['6a33cfab54cfc1bd0c2cd14a', '6a34d548c3129a4626fd3cee', '6a34d5c7ea6d21365f5b3dc7']
  const vcoll = conn.db!.collection('_pages_versions')
  for (const tid of targets) {
    const doc = await vcoll.findOne({ _id: new ObjectId(tid) })
    if (!doc) {
      console.log(`  ${tid}: not found, skipping`)
      continue
    }
    const layout = (doc as { version?: { layout?: Record<string, unknown>[] } }).version!.layout!
    const blockIdx = layout.findIndex((b) => b.blockType === 'careersTeam')
    if (blockIdx < 0) {
      console.log(`  ${tid}: no careersTeam block, skipping`)
      continue
    }
    const res = await vcoll.updateOne(
      { _id: new ObjectId(tid) },
      { $set: { [`version.layout.${blockIdx}.members`]: cleanMembers } },
    )
    console.log(`  ${tid}: block[${blockIdx}] matched=${res.matchedCount} modified=${res.modifiedCount}`)
  }

  // 3) Verify every pages version now serializes.
  const v = await payload.findVersions({
    collection: 'pages' as never,
    limit: 50,
    depth: 0,
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
    fails === 0 ? `\nAll ${v.docs.length} pages versions serialize OK` : `\n${fails} version(s) still failing`,
  )

  await new Promise((r) => setTimeout(r, 300))
  process.exit(fails === 0 ? 0 : 2)
}

try {
  await run()
} catch (e) {
  console.error('VSNAP ERROR:', (e as Error).stack)
  process.exit(1)
}
