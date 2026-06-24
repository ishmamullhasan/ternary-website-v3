// PROD finish: (1) set the header CTA button (empty on prod), (2) remove the redundant `aboutSection`
// block from the home layout — it's the OLD hero that the new <HeroFeatured> replaces; on this DB the
// layout is [0] storiesArchive, [1] aboutSection, so slice(1) drops storiesArchive and aboutSection
// still renders → the "8 cards a second time + logos". Removing it leaves: new hero + solutions + ….
// CONTENT_DRY=1 preview (default) / CONTENT_DRY=0 apply.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.CONTENT_DRY !== '0'
const BENIGN = (e: unknown) => String((e as Error)?.message || e).includes('static generation store missing')
const save = async (fn: () => Promise<unknown>) => {
  try {
    await fn()
  } catch (e) {
    if (!BENIGN(e)) throw e
  }
}

const run = async () => {
  const payload = await getPayload({ config })

  // (1) header CTA button
  const header = (await payload.findGlobal({ slug: 'header' as never, locale: 'en', depth: 0 })) as Record<
    string,
    unknown
  >
  const btn = (header.button ?? {}) as { label?: string; link?: string }
  console.log('current button:', JSON.stringify(btn))
  if (!btn.label) {
    const { id: _i, globalType: _g, createdAt: _c, updatedAt: _u, ...data } = header
    console.log('→ set button = { label: "Get in Touch", link: "/contact" }')
    if (!DRY)
      await save(() =>
        payload.updateGlobal({
          slug: 'header' as never,
          locale: 'en',
          data: { ...data, button: { label: 'Get in Touch', link: '/contact' } } as never,
        }),
      )
  }

  // (2) remove aboutSection from the home layout
  const homeRes = await payload.find({
    collection: 'pages' as never,
    where: { slug: { equals: 'home' } } as never,
    locale: 'en',
    depth: 0,
    limit: 1,
  })
  const home = homeRes.docs?.[0] as { id: string; layout?: { blockType?: string }[] } | undefined
  if (home) {
    const before = (home.layout ?? []).map((b) => b.blockType)
    const layout = (home.layout ?? []).filter((b) => b.blockType !== 'aboutSection')
    console.log('\nhome layout before:', before.join(', '))
    console.log('home layout after :', layout.map((b) => b.blockType).join(', '))
    if (layout.length !== before.length) {
      console.log(`→ removing ${before.length - layout.length} aboutSection block(s)`)
      if (!DRY)
        await save(() =>
          payload.update({
            collection: 'pages' as never,
            id: home.id as never,
            locale: 'en',
            data: { layout } as never,
          }),
        )
    } else {
      console.log('(no aboutSection block to remove)')
    }
  }

  console.log(`\n${DRY ? 'DRY RUN — no writes.' : 'APPLIED.'}`)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error('FINISH ERROR:', e)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(1)
}
