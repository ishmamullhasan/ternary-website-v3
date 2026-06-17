// READ-ONLY: recover the original home "top 8 cards" (homePage.about.items) from the most recent
// pages/home version that still has 8 items, and resolve each to {relationTo, slug, title} so the
// references can be pinned back into the seed portably (slugs, not db-specific ids).
//   DATABASE_URI=... pnpm payload run ./scripts/inspect-home-about.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const home = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0 })
const doc = home.docs[0]
if (!doc) {
  payload.logger.error('No pages/home doc found')
  process.exit(1)
}

const versions = await payload.findVersions({
  collection: 'pages',
  where: { parent: { equals: doc.id } },
  limit: 200,
  sort: '-updatedAt',
  depth: 0,
})

const itemsOf = (layout: any): any[] => {
  const about = Array.isArray(layout) ? layout.find((b: any) => b?.blockType === 'aboutSection') : null
  return Array.isArray(about?.items) ? about.items : []
}

// Most recent version with exactly 8 about items = the original "top 8 cards".
let original: any[] = []
for (const v of versions.docs as any[]) {
  const items = itemsOf(v.version?.layout)
  if (items.length === 8) {
    original = items
    payload.logger.info(`Original 8-card version: updatedAt=${v.updatedAt}`)
    break
  }
}
if (!original.length) {
  payload.logger.error('No 8-item version found')
  process.exit(1)
}

// Resolve each polymorphic ref to its collection + slug + title.
for (const it of original) {
  const relationTo = it.relationTo
  const id = it.value
  try {
    const d: any = await payload.findByID({ collection: relationTo, id, depth: 0 })
    const titleOrName = d?.title ?? d?.name ?? '(untitled)'
    payload.logger.info(`  ${relationTo} / ${d?.slug ?? '(no slug)'} — "${titleOrName}"  [id ${id}]`)
  } catch {
    payload.logger.warn(`  ${relationTo} / id ${id} — could not resolve (doc missing?)`)
  }
}
payload.logger.info(`RAW: ${JSON.stringify(original)}`)
process.exit(0)
