// Clear the subscribe preview's background image on the /stories page so the block renders its
// coded Figma gradient (node 1418:5117) instead of the uploaded MagicPattern placeholder. Targeted:
// only the `subscribe` block's preview.backgroundImage is nulled; every other block is preserved.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/clear-subscribe-bg.ts            # preview (DRY)
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/clear-subscribe-bg.ts # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const ctx = { disableRevalidate: true }

const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

const payload: Payload = await getPayload({ config })
payload.logger.info(`Clear subscribe bg ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

const page = (
  await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'stories' } },
    limit: 1,
    depth: 0,
    draft: false,
    overrideAccess: true,
  })
).docs[0] as any

if (!page) {
  payload.logger.error('  /stories page not found')
} else {
  const layout = Array.isArray(page.layout) ? page.layout : []
  let touched = 0
  const newLayout = layout.map((b: any) => {
    if (b.blockType !== 'subscribe') return b
    touched++
    return { ...b, preview: { ...(b.preview ?? {}), backgroundImage: null } }
  })
  payload.logger.info(`  subscribe blocks updated: ${touched}`)
  if (!DRY && touched > 0) {
    await ignoreRevalidate(() =>
      payload.update({
        collection: 'pages',
        id: page.id,
        data: { title: page.title || 'Stories', layout: newLayout, _status: 'published' },
        context: ctx,
      }),
    )
    payload.logger.info('  /stories updated')
  }
}

process.exit(0)
