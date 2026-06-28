// Companion to fix-careers-bson.ts. The careers page's version snapshots (_pages_versions) carry
// the same careersTeam corruption, but stored as a raw 12-byte Buffer in `members[].id` (not an
// ObjectId). With drafts enabled, admin reads (draft:false published snapshot AND draft:true latest)
// pull from these version docs, so they must be normalized too: members[].id -> 24-char hex string.
import config from '@payload-config'
import { getPayload } from 'payload'

// Recover a 24-char hex string id from whatever shape the row id is stored as.
const toHexId = (v: unknown): string | null => {
  if (typeof v === 'string') return /^[a-f0-9]{24}$/i.test(v) ? null : v // already a plain string; leave unless odd
  if (!v || typeof v !== 'object') return null
  const o = v as { _bsontype?: string; toHexString?: () => string; type?: string; data?: number[] }
  if (o._bsontype === 'ObjectId' && typeof o.toHexString === 'function') return o.toHexString()
  if (Buffer.isBuffer(v)) return (v as Buffer).toString('hex')
  if (o.type === 'Buffer' && Array.isArray(o.data)) return Buffer.from(o.data).toString('hex')
  // Buffer-like: numeric-keyed object of 12 bytes
  const keys = Object.keys(o)
  if (keys.length === 12 && keys.every((k) => /^\d+$/.test(k))) {
    return Buffer.from(keys.map((k) => (o as Record<string, number>)[k])).toString('hex')
  }
  return null
}

const run = async () => {
  const payload = await getPayload({ config })
  const conn = (payload.db as unknown as { connection: import('mongoose').Connection }).connection
  const coll = conn.db!.collection('_pages_versions')

  // Scan ALL pages version snapshots (not just slug==careers) — some snapshots predate the slug or
  // are autosaves, so filtering by slug misses them. We only touch careersTeam members[].id anyway.
  const docs = await coll.find({}).toArray()
  console.log(`pages version docs scanned: ${docs.length}`)
  let docsFixed = 0
  let totalConverted = 0

  for (const doc of docs) {
    const version = (doc as { version?: { layout?: Record<string, unknown>[] } }).version
    const layout = version?.layout ?? []
    let n = 0
    for (const block of layout) {
      if (block?.blockType !== 'careersTeam') continue
      for (const row of (block.members as Record<string, unknown>[]) ?? []) {
        if (typeof row.id === 'string') continue
        const hex = toHexId(row.id)
        if (hex) {
          row.id = hex
          n++
        }
      }
    }
    if (n > 0) {
      await coll.updateOne({ _id: (doc as { _id: unknown })._id }, { $set: { 'version.layout': layout } })
      docsFixed++
      totalConverted += n
      console.log(`  fixed _id=${String((doc as { _id: unknown })._id)}: ${n} members[].id`)
    }
  }
  console.log(`\nversion docs fixed: ${docsFixed}; members[].id converted: ${totalConverted}`)

  await new Promise((r) => setTimeout(r, 300))
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error('FIX-VERSIONS ERROR:', (e as Error).stack)
  process.exit(1)
}
