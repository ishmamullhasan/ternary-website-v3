// Same hero consolidation, for the `industry` collection's layout (industriesHero → hero).
// Detail pages render industry.layout through the shared RenderBlocks, so a flipped blockType
// renders via the new Hero component. Attributed to ashemul@ternary.solutions; verified per locale.
//
//   pnpm payload run ./scripts/migrate-industry-heroes.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const actor = (
  (await payload.find({
    collection: 'users' as never,
    where: { email: { equals: 'ashemul@ternary.solutions' } } as never,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })) as any
).docs?.[0]
if (!actor) throw new Error('actor not found')

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

const list =
  (
    (await payload.find({
      collection: 'industry' as never,
      locale: 'en' as never,
      draft: true,
      depth: 0,
      limit: 500,
      overrideAccess: true,
    })) as any
  ).docs ?? []

let touched = 0
for (const doc of list) {
  const layout = (doc.layout ?? []) as any[]
  const idx = layout.findIndex((b) => b.blockType === 'industriesHero')
  console.log(
    `- ${doc.slug} (id=${doc.id}) blocks=[${layout.map((b) => b.blockType).join(', ') || 'none'}]${idx >= 0 ? '  <== has industriesHero' : ''}`,
  )
  if (idx < 0) continue
  touched++

  const newLayout = layout.map((b, i) => (i === idx ? { ...b, blockType: 'hero' } : b))
  await ignoreRevalidate(
    () =>
      payload.update({
        collection: 'industry' as never,
        id: doc.id,
        locale: 'en' as never,
        draft: false,
        overrideAccess: true,
        user: actor as never,
        data: { title: doc.title, layout: newLayout, _status: 'published' } as never,
      }),
    `${doc.slug}[en] industriesHero->hero`,
  )

  for (const locale of ['en', 'bn'] as const) {
    const after = (
      (await payload.find({
        collection: 'industry' as never,
        where: { slug: { equals: doc.slug } } as never,
        locale: locale as never,
        fallbackLocale: false as never,
        draft: false,
        depth: 0,
        limit: 1,
        overrideAccess: true,
      })) as any
    ).docs?.[0]
    const hero = (after?.layout ?? [])[idx]
    console.log(`    [${locale}] hero.blockType=${hero?.blockType} heading=${JSON.stringify(hero?.heading)}`)
  }
}
console.log(`\n${touched} industry doc(s) migrated.`)
process.exit(0)
