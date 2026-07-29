// Throwaway: dump the stored `content` of the legal docs from whatever DATABASE_URI is set,
// so we can confirm a seed actually landed in the DB the site reads.
import config from '@payload-config'
import { getPayload } from 'payload'

const run = async () => {
  const payload = await getPayload({ config })
  const found: any = await payload.find({
    collection: 'legal' as never,
    where: {} as never,
    depth: 0,
    limit: 20,
    overrideAccess: true,
  })
  for (const d of found.docs ?? []) {
    const children = d?.content?.root?.children ?? []
    const blocks = children.filter((c: any) => c?.type === 'block')
    const headings = children.filter((c: any) => c?.type === 'heading')
    const firstHeading = headings[0]?.children?.[0]?.text ?? '(none)'
    // Pull any [CONFIRM markers from text/table nodes by JSON-scanning.
    const json = JSON.stringify(d?.content ?? {})
    const confirmCount = (json.match(/CONFIRM:/g) ?? []).length
    const tableCount = blocks.filter((b: any) => b?.fields?.blockType === 'table').length
    console.log(
      `SLUG=${d.slug} | updatedAt=${d.updatedAt} | topChildren=${children.length} | tables=${tableCount} | CONFIRM=${confirmCount} | firstHeading="${firstHeading}"`,
    )
  }
  process.exit(0)
}
await run()
