// READ-ONLY: dump the current content inventory so the canonical seed knows what to
// delete and where the homepage StoriesArchive block lives. Writes nothing.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/inspect-content.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const collections = ['capability', 'scale', 'model', 'story', 'insight', 'pressRelease', 'team']
for (const c of collections) {
  const res = await payload.find({ collection: c as any, locale: 'en', depth: 0, limit: 200, overrideAccess: true })
  const ids = res.docs.map((d: any) => `${d.slug ?? d.name ?? d.id}`)
  console.log(`\n[${c}] ${res.totalDocs} docs:`)
  console.log('  ' + ids.join(', '))
}

// Pages: show layout block types; for any storiesArchive block, show item counts.
const pages = await payload.find({
  collection: 'pages',
  locale: 'en',
  depth: 0,
  limit: 50,
  overrideAccess: true,
  draft: false,
})
console.log(`\n[pages] ${pages.totalDocs} docs:`)
for (const p of pages.docs as any[]) {
  const layout = Array.isArray(p.layout) ? p.layout : []
  const types = layout.map((b: any) => b.blockType)
  console.log(`  - "${p.title}" (slug=${p.slug}, _status=${p._status}) layout: [${types.join(', ')}]`)
  layout.forEach((b: any, i: number) => {
    if (b.blockType === 'storiesArchive') {
      const items = Array.isArray(b.items) ? b.items : []
      const pr = Array.isArray(b.pressRelease) ? b.pressRelease : []
      console.log(`      storiesArchive[${i}]: items=${items.length} pressRelease=${pr.length}`)
      console.log(`        items raw: ${JSON.stringify(items).slice(0, 300)}`)
    }
  })
}
process.exit(0)
