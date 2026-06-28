// Fix the careers-page BSONError at its root: the careersTeam block's `members` array rows were
// written with their `id` stored as a BSON **ObjectId**, whereas Payload stores all other block/
// array row ids as **strings** (see careersHero buttons, etc.). On read, Payload's mongodb transform
// mishandles the unexpected ObjectId-typed row id and emits a malformed ObjectId (internal `.id` is a
// hex string), which bson 6 cannot serialize -> breaks the admin pages list / any RSC serialization.
//
// Surgical remedy via the raw driver: rewrite only `members[].id` from ObjectId -> hex string,
// leaving every other value (relationship/image ObjectId refs) untouched. Backs up first, verifies after.
import config from '@payload-config'
import { writeFileSync } from 'node:fs'
import { getPayload } from 'payload'

const BACKUP = String.raw`C:\Users\Shemul\AppData\Local\Temp\claude\D--Server-Ternary-Ternary\46d602d9-3ac4-4ba5-8e23-bd3cdc267a22\scratchpad\careers-page-backup.json`

const isOid = (v: unknown): v is { toHexString: () => string; _bsontype?: string } =>
  !!v && typeof v === 'object' && (v as { _bsontype?: string })._bsontype === 'ObjectId'

const run = async () => {
  const payload = await getPayload({ config })
  const conn = (payload.db as unknown as { connection: import('mongoose').Connection }).connection
  const pages = conn.collection('pages')

  const raw = (await pages.findOne({ slug: 'careers' })) as Record<string, unknown> | null
  if (!raw) {
    console.log('careers page not found — nothing to do')
    process.exit(1)
  }
  // Backup (EJSON-style, preserving type tags) before any write.
  const { EJSON } = (await import('mongoose')).default.mongo.BSON as unknown as {
    EJSON: { stringify: (v: unknown, opt?: unknown) => string }
  }
  writeFileSync(BACKUP, EJSON.stringify(raw, { relaxed: false }))
  console.log(`backed up original careers doc -> ${BACKUP}`)

  const layout = (raw.layout as Record<string, unknown>[]) ?? []
  let converted = 0
  for (const block of layout) {
    if (block.blockType !== 'careersTeam') continue
    const members = (block.members as Record<string, unknown>[]) ?? []
    for (const row of members) {
      if (isOid(row.id)) {
        row.id = row.id.toHexString() // ObjectId -> string, matching all other blocks
        converted++
      }
    }
  }
  console.log(`converted ${converted} careersTeam members[].id ObjectId -> string`)
  if (!converted) {
    console.log('nothing to convert; exiting')
    process.exit(0)
  }

  await pages.updateOne({ _id: raw._id }, { $set: { layout } })
  console.log('mongo updateOne OK')

  // Verify the admin-style read serializes now.
  let ok = true
  for (const locale of ['en', 'bn'] as const) {
    const res = await payload.find({
      collection: 'pages' as never,
      where: { slug: { equals: 'careers' } } as never,
      locale: locale as never,
      depth: 1,
      limit: 1,
      pagination: false,
      overrideAccess: true,
    } as never)
    try {
      EJSON.stringify(res.docs[0])
      console.log(`verify locale=${locale}: serializes OK`)
    } catch (e) {
      ok = false
      console.error(`verify locale=${locale}: STILL FAILS -> ${(e as Error).message}`)
    }
  }
  // Also verify the broad find that originally reproduced it.
  const all = await payload.find({
    collection: 'pages' as never,
    locale: 'en' as never,
    depth: 1,
    limit: 100,
    pagination: false,
    overrideAccess: true,
  } as never)
  for (const d of all.docs as Record<string, unknown>[]) {
    try {
      EJSON.stringify(d)
    } catch (e) {
      ok = false
      console.error(`broad-find FAILS for slug=${d.slug}: ${(e as Error).message}`)
    }
  }
  console.log(ok ? 'broad-find: all 8 pages serialize OK' : 'broad-find: still failing')

  await new Promise((r) => setTimeout(r, 300))
  console.log(ok ? '\nFIXED' : '\nNOT fixed')
  process.exit(ok ? 0 : 2)
}

try {
  await run()
} catch (e) {
  console.error('FIX ERROR:', (e as Error).stack)
  process.exit(1)
}
