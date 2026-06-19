// READ-ONLY: extract every localized English field value across all collections + globals,
// walking nested group/array/blocks/tabs/row containers. Output -> /tmp/bn-en-extract.json,
// the input for the AI Bangla translation pass. Honors DATABASE_URI from the environment.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/extract-localized-en.ts
import config from '@payload-config'
import { writeFileSync } from 'node:fs'
import { getPayload } from 'payload'

type Leaf = { path: string; type: 'text' | 'richText'; value: unknown }

// Recurse the field tree + the doc data in parallel, collecting localized leaf values.
function walk(fields: any[], data: any, path: string, out: Leaf[]): void {
  for (const f of fields || []) {
    if (!f || typeof f !== 'object') continue
    const name: string | undefined = f.name
    const at = name ? `${path}${name}` : path
    switch (f.type) {
      case 'text':
      case 'textarea':
        if (f.localized && typeof data?.[name] === 'string' && data[name].trim()) {
          out.push({ path: at, type: 'text', value: data[name] })
        }
        break
      case 'richText':
        if (f.localized && data?.[name]) out.push({ path: at, type: 'richText', value: data[name] })
        break
      case 'group':
        walk(f.fields, data?.[name], `${at}.`, out)
        break
      case 'array':
        ;(Array.isArray(data?.[name]) ? data[name] : []).forEach((item: any, i: number) =>
          walk(f.fields, item, `${at}[${i}].`, out),
        )
        break
      case 'blocks':
        ;(Array.isArray(data?.[name]) ? data[name] : []).forEach((item: any, i: number) => {
          const block = (f.blocks || []).find((b: any) => b.slug === item?.blockType)
          if (block) walk(block.fields, item, `${at}[${i}].`, out)
        })
        break
      case 'tabs':
        for (const tab of f.tabs || []) {
          walk(tab.fields, tab.name ? data?.[tab.name] : data, tab.name ? `${path}${tab.name}.` : path, out)
        }
        break
      case 'row':
      case 'collapsible':
        walk(f.fields, data, path, out)
        break
    }
  }
}

async function run() {
  const payload = await getPayload({ config })
  const result: any[] = []
  let docCount = 0,
    textCount = 0,
    richCount = 0

  // Collections
  for (const coll of payload.config.collections) {
    const slug = coll.slug
    if (['media', 'users', 'payload-locked-documents', 'payload-preferences', 'payload-migrations'].includes(slug))
      continue
    let page = 1
    while (true) {
      const res = await payload.find({ collection: slug as any, locale: 'en', depth: 0, limit: 100, page })
      for (const doc of res.docs as any[]) {
        const leaves: Leaf[] = []
        walk(coll.fields, doc, '', leaves)
        if (leaves.length) {
          result.push({
            kind: 'collection',
            slug,
            id: doc.id,
            title: doc.title ?? doc.name ?? doc.slug ?? doc.id,
            leaves,
          })
          docCount++
          for (const l of leaves) l.type === 'richText' ? richCount++ : textCount++
        }
      }
      if (!res.hasNextPage) break
      page++
    }
  }
  // Globals
  for (const g of payload.config.globals) {
    const doc = await payload.findGlobal({ slug: g.slug as any, locale: 'en', depth: 0 })
    const leaves: Leaf[] = []
    walk(g.fields, doc, '', leaves)
    if (leaves.length) {
      result.push({ kind: 'global', slug: g.slug, leaves })
      docCount++
      for (const l of leaves) l.type === 'richText' ? richCount++ : textCount++
    }
  }

  writeFileSync('/tmp/bn-en-extract.json', JSON.stringify(result, null, 2))
  console.log(`EXTRACT: ${docCount} docs, ${textCount} text/textarea, ${richCount} richText -> /tmp/bn-en-extract.json`)
  process.exit(0)
}
await run()
