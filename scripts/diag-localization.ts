// READ-ONLY diagnostic: after flipping fields to localized, does Payload still return
// existing (pre-localization) content at locale 'en', or is it orphaned?
// Compares Payload's local-API read (locale=en) against the RAW Mongo storage shape.
//   pnpm payload run ./scripts/diag-localization.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const COLLECTIONS = ['pages', 'story', 'capability', 'insight', 'legal'] as const

const shape = (v: unknown): string => {
  if (v == null) return String(v)
  if (typeof v === 'string') return `string(${v.slice(0, 24)}…)`
  if (typeof v === 'object') {
    const keys = Object.keys(v as object)
    const localeish = keys.some((k) => k === 'en' || k === 'bn')
    return `object{${keys.slice(0, 6).join(',')}}${localeish ? ' <-LOCALE-KEYED' : ''}`
  }
  return typeof v
}

async function run() {
  const payload = await getPayload({ config })
  for (const slug of COLLECTIONS) {
    try {
      const count = (await payload.count({ collection: slug as never })).totalDocs
      console.log(`\n=== ${slug} (count=${count}) ===`)
      if (!count) {
        console.log('  (empty — nothing to diagnose)')
        continue
      }
      // Payload API read at locale 'en'
      const res = await payload.find({ collection: slug as never, locale: 'en', limit: 1, depth: 0 })
      const doc = res.docs[0] as Record<string, unknown> | undefined
      const titleish = doc?.title ?? doc?.name ?? doc?.heading
      console.log(`  Payload(locale=en) title/name => ${shape(titleish)}`)
      if ('content' in (doc ?? {})) console.log(`  Payload(locale=en) content    => ${shape(doc?.content)}`)
      // RAW Mongo storage of the same first doc
      const coll = payload.db.connection.collection(slug)
      const raw = (await coll.findOne({})) as Record<string, unknown> | null
      const rawTitle = raw?.title ?? raw?.name ?? raw?.heading
      console.log(`  RAW mongo title/name          => ${shape(rawTitle)}`)
      if (raw && 'content' in raw) console.log(`  RAW mongo content             => ${shape(raw?.content)}`)
    } catch (e) {
      console.log(`  ERROR on ${slug}: ${(e as Error).message}`)
    }
  }
  console.log('\nINTERPRETATION: if Payload(locale=en) returns the value but RAW is a bare string')
  console.log('(NOT locale-keyed), Payload is reading legacy data gracefully → backfill may be unneeded.')
  console.log('If Payload(locale=en) is null/undefined while RAW has a bare string → backfill REQUIRED.')
  process.exit(0)
}
await run()
