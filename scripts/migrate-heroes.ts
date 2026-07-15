// Consolidate the SIMILAR heroes (storiesHero / aboutHero / industriesHero) into the shared `hero`
// block, in place, across the 5 pages that use them. `layout` is NOT a localized field, so a
// block's blockType is shared across locales and its localized heading/description stay keyed to the
// block id — flipping blockType with a single en-locale write preserves both locales' text.
//
// Writes are attributed to ashemul@ternary.solutions so the activity log records the real actor.
// Each page is verified after the write: hero flipped in BOTH locales, hero text intact in both,
// and a control (non-hero) block's bn heading unchanged (guards against clobbering bn content).
//
//   pnpm payload run ./scripts/migrate-heroes.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const SIMILAR = new Set(['storiesHero', 'aboutHero', 'industriesHero'])
const TARGETS = ['insights', 'capabilities', 'stories', 'about', 'industries'] as const

const payload = await getPayload({ config })

const actorRes = (await payload.find({
  collection: 'users' as never,
  where: { email: { equals: 'ashemul@ternary.solutions' } } as never,
  depth: 0,
  limit: 1,
  overrideAccess: true,
})) as any
const actor = actorRes.docs?.[0]
if (!actor) throw new Error('actor ashemul@ternary.solutions not found')
console.log('actor:', actor.email, actor.id)

const ignoreRevalidate = async (fn: () => Promise<unknown>, tag: string) => {
  try {
    await fn()
    console.log(`  ${tag}: OK`)
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) {
      console.log(`  ${tag}: OK (revalidate throw swallowed)`)
      return
    }
    throw e
  }
}

const readPage = async (slug: string, locale: 'en' | 'bn') =>
  (
    (await payload.find({
      collection: 'pages' as never,
      where: { slug: { equals: slug } } as never,
      locale: locale as never,
      fallbackLocale: false as never,
      draft: false,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })) as any
  ).docs?.[0]

for (const slug of TARGETS) {
  console.log(`\n===== ${slug} =====`)
  const enDoc = await readPage(slug, 'en')
  const bnDoc = await readPage(slug, 'bn')
  if (!enDoc) {
    console.log('  SKIP: no en doc')
    continue
  }

  const layoutEn = (enDoc.layout ?? []) as any[]
  const idx = layoutEn.findIndex((b) => SIMILAR.has(b.blockType))
  if (idx < 0) {
    console.log('  SKIP: no similar hero in layout')
    continue
  }
  const oldType = layoutEn[idx].blockType

  // Control: the first non-hero block that carries a plain-string bn heading — used to prove the
  // write didn't touch other blocks' bn content.
  const controlBn = (bnDoc?.layout ?? []).find(
    (b: any) => !SIMILAR.has(b.blockType) && typeof b.heading === 'string' && b.heading,
  )
  const controlKey = controlBn ? `${controlBn.blockType}#${controlBn.id}` : null
  const controlBefore = controlBn?.heading

  const newLayoutEn = layoutEn.map((b, i) => (i === idx ? { ...b, blockType: 'hero' } : b))

  await ignoreRevalidate(
    () =>
      payload.update({
        collection: 'pages' as never,
        id: enDoc.id,
        locale: 'en' as never,
        draft: false,
        overrideAccess: true,
        user: actor as never,
        data: { title: enDoc.title, layout: newLayoutEn, _status: 'published' } as never,
      }),
    `${slug}[en] ${oldType}->hero`,
  )

  // Verify both locales.
  const enAfter = await readPage(slug, 'en')
  const bnAfter = await readPage(slug, 'bn')
  const hEn = (enAfter?.layout ?? [])[idx]
  const hBn = (bnAfter?.layout ?? [])[idx]
  const controlAfter = controlKey
    ? (bnAfter?.layout ?? []).find((b: any) => `${b.blockType}#${b.id}` === controlKey)
    : null

  const ok =
    hEn?.blockType === 'hero' &&
    hBn?.blockType === 'hero' &&
    (controlKey ? controlAfter?.heading === controlBefore : true)
  console.log(`  hero.blockType: en=${hEn?.blockType} bn=${hBn?.blockType}`)
  console.log(`  hero.heading en=${JSON.stringify(hEn?.heading)}`)
  console.log(`  hero.heading bn=${JSON.stringify(hBn?.heading)}`)
  if (controlKey)
    console.log(
      `  control ${controlKey} bn: before=${JSON.stringify(controlBefore)} after=${JSON.stringify(controlAfter?.heading)}`,
    )
  console.log(`  RESULT: ${ok ? 'OK' : '*** MISMATCH — investigate ***'}`)
}

process.exit(0)
