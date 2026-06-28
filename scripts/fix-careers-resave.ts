// Proper re-save of the careers page through Payload's API (not raw mongo), per locale, so the main
// doc AND a fresh published version snapshot are written in Payload's canonical shape — eliminating
// the main/version row-id mismatch that makes the draft-merge regenerate malformed ObjectIds.
//
// Reads at depth 0 with draft:false (clean post data-fix), strips system fields, updates per locale.
import config from '@payload-config'
import { getPayload } from 'payload'

const SYSTEM = new Set([
  'id',
  '_id',
  'createdAt',
  'updatedAt',
  '_status',
  'breadcrumbs',
  'sizes',
  'filename',
  'mimeType',
  'filesize',
  'width',
  'height',
  'focalX',
  'focalY',
  'url',
  'thumbnailURL',
])

const run = async () => {
  const payload = await getPayload({ config })
  const { EJSON } = (await import('mongoose')).default.mongo.BSON as unknown as {
    EJSON: { stringify: (v: unknown) => string }
  }

  // Resolve the careers page id.
  const probe = await payload.find({
    collection: 'pages' as never,
    where: { slug: { equals: 'careers' } } as never,
    locale: 'en' as never,
    depth: 0,
    limit: 1,
    draft: false,
    overrideAccess: true,
  } as never)
  const careers = probe.docs[0] as Record<string, unknown> | undefined
  if (!careers) {
    console.log('careers not found')
    process.exit(1)
  }
  const id = String(careers.id)

  for (const locale of ['en', 'bn'] as const) {
    const doc = (await payload.findByID({
      collection: 'pages' as never,
      id,
      locale: locale as never,
      depth: 0,
      draft: false,
      overrideAccess: true,
    } as never)) as Record<string, unknown>
    const data: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(doc)) if (!SYSTEM.has(k)) data[k] = v

    try {
      await payload.update({
        collection: 'pages' as never,
        id,
        locale: locale as never,
        data: data as never,
        depth: 0,
        overrideAccess: true,
      } as never)
    } catch (e) {
      // The DB write + version write complete before the afterChange revalidateTag hook, which
      // needs a Next request store we don't have in a script. Swallow only that invariant.
      if (!/static generation store missing/i.test((e as Error).message)) throw e
    }
    console.log(`re-saved careers (locale=${locale}, ${Object.keys(data).length} fields)`)
  }

  // Verify: non-draft AND draft reads, both locales.
  let ok = true
  for (const locale of ['en', 'bn'] as const) {
    for (const draft of [false, true] as const) {
      const res = await payload.find({
        collection: 'pages' as never,
        where: { slug: { equals: 'careers' } } as never,
        locale: locale as never,
        depth: 1,
        limit: 1,
        draft,
        overrideAccess: true,
      } as never)
      try {
        EJSON.stringify(res.docs[0])
        console.log(`verify locale=${locale} draft=${draft}: OK`)
      } catch (e) {
        ok = false
        console.error(`verify locale=${locale} draft=${draft}: FAILS -> ${(e as Error).message}`)
      }
    }
  }

  await new Promise((r) => setTimeout(r, 300))
  console.log(ok ? '\nFIXED (draft + non-draft serialize cleanly)' : '\nNOT fixed (draft path still regenerates)')
  process.exit(ok ? 0 : 2)
}

try {
  await run()
} catch (e) {
  console.error('RESAVE ERROR:', (e as Error).stack)
  process.exit(1)
}
