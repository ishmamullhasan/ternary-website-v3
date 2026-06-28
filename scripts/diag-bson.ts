// Diagnostic (read-only-ish): patch bson so the moment `toLocalBufferType` throws
// "Cannot create Buffer from the passed potentialBuffer" we capture the FULL stack trace,
// then exercise the data paths the admin pages list / case-study route hit.
import config from '@payload-config'
import mongoose from 'mongoose'
import { getPayload } from 'payload'

// bson comes via the driver mongoose bundles — same instance Payload uses at runtime.
const BSON = (
  mongoose as unknown as { mongo: { BSON: typeof import('bson') & { EJSON: typeof import('bson').EJSON } } }
).mongo.BSON
const EJSON = BSON.EJSON

// Deep-walk a value to find every ObjectId-like whose toHexString() throws; report field path,
// constructor, and the raw internal `id` shape (what's actually stored in the bad buffer slot).
const findBadObjectIds = (root: unknown): string[] => {
  const hits: string[] = []
  const seen = new Set<unknown>()
  const walk = (node: unknown, path: string) => {
    if (node === null || typeof node !== 'object' || seen.has(node)) return
    seen.add(node)
    const oid = node as {
      toHexString?: () => string
      _bsontype?: string
      id?: unknown
      constructor?: { name?: string }
    }
    if (typeof oid.toHexString === 'function' || oid._bsontype === 'ObjectId') {
      try {
        oid.toHexString?.()
      } catch {
        const idVal = oid.id
        const shape =
          idVal == null
            ? String(idVal)
            : `${(idVal as object).constructor?.name ?? typeof idVal}` +
              (typeof idVal === 'object'
                ? ` keys=${JSON.stringify(Object.keys(idVal as object)).slice(0, 120)}`
                : ` val=${String(idVal)}`)
        hits.push(`${path}  [ctor=${oid.constructor?.name}]  id=${shape}`)
      }
      return
    }
    if (Array.isArray(node)) {
      node.forEach((c, i) => walk(c, `${path}[${i}]`))
      return
    }
    for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k)
  }
  walk(root, '')
  return hits
}

const tryEjson = (label: string, value: unknown) => {
  try {
    EJSON.stringify(value as never)
    BSON.serialize(value as never)
  } catch (e) {
    console.error(`\n### serialize FAILED for ${label}: ${(e as Error).message}`)
    const paths = findBadObjectIds(value)
    if (paths.length) {
      console.error(`    corrupt ObjectId field path(s):`)
      for (const p of paths) console.error(`      - ${p}`)
    } else {
      console.error(`    (walk found no throwing ObjectId — corruption may surface only inside EJSON traversal)`)
    }
  }
}

const run = async () => {
  const payload = await getPayload({ config })

  // 1) Admin-style page reads: drafts on, every locale, depth like the edit view.
  for (const locale of ['en', 'bn', 'all'] as const) {
    for (const draft of [false, true] as const) {
      try {
        const res = await payload.find({
          collection: 'pages' as never,
          locale: locale as never,
          draft,
          depth: 1,
          limit: 100,
          pagination: false,
          overrideAccess: true,
        } as never)
        console.log(`pages locale=${locale} draft=${draft}: ${res.docs.length} docs OK`)
        res.docs.forEach((d: { id?: unknown; slug?: unknown }, i: number) =>
          tryEjson(`pages[${i}] id=${d.id} slug=${d.slug}`, d),
        )
      } catch (e) {
        console.error(`pages locale=${locale} draft=${draft} FAILED:`, (e as Error).stack)
      }
    }
  }

  // 2) Versions + preferences (the admin loads these alongside the list).
  for (const collection of ['pages', 'story', 'analytics'] as const) {
    try {
      const v = await payload.findVersions({
        collection: collection as never,
        limit: 50,
        depth: 0,
        overrideAccess: true,
      } as never)
      console.log(`${collection} versions: ${v.docs.length} OK`)
      v.docs.forEach((d: unknown, i: number) => tryEjson(`${collection}.version[${i}]`, d))
    } catch (e) {
      console.error(`${collection} versions FAILED:`, (e as Error).message)
    }
  }

  await new Promise((r) => setTimeout(r, 300))
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error('DIAG ERROR:', (e as Error).stack)
  await new Promise((r) => setTimeout(r, 300))
  process.exit(1)
}
