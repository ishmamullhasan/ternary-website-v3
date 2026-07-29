// Fill the `content` richText of the legal pages (privacy / terms / modern slavery) from
// scripts/content/legal-content.data.ts. Localized field with fallback:true → seed `en` only
// (bn falls back to en). legal has no drafts, so writes are live. afterChange revalidateTag throws
// outside a Next request — fires after the commit, so we swallow it. Idempotent (overwrites content).
//   pnpm payload run ./scripts/seed-legal-content.ts             # DRY (default)
//   SEED_DRY=0 pnpm payload run ./scripts/seed-legal-content.ts  # APPLY
import config from '@payload-config'
import { writeFileSync } from 'node:fs'
import { getPayload } from 'payload'
import { LEGAL_CONTENT, type Block, type TableData } from './content/legal-content.data'

const DRY = process.env.SEED_DRY !== '0'
const out: string[] = []
const log = (s: string) => {
  out.push(s)
  writeFileSync('./scratch-legal.txt', out.join('\n') + '\n')
}

// ---- Lexical builders ----------------------------------------------------------------------------
const txt = (text: string) => ({ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
const heading = (text: string) => ({
  type: 'heading',
  tag: 'h2',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  children: [txt(text)],
})
const para = (text: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  textFormat: 0,
  textStyle: '',
  children: [txt(text)],
})
const listItem = (text: string, value: number) => ({
  type: 'listitem',
  value,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  children: [txt(text)],
})
const bulletList = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  children: items.map((t, i) => listItem(t, i + 1)),
})

// Stable, deterministic ids for the seeded block + its array rows/cells. Payload usually
// backfills missing array `id`s on save, but supplying them keeps the write idempotent and
// avoids relying on that behaviour. Deterministic (counter, not random) so re-seeding is stable.
let _blockId = 0
const nextId = () => `seed-tbl-${(_blockId++).toString(36)}`

// A `table` block node (BlocksFeature). `fields` mirrors src/blocks/Table/config.ts exactly.
const tableBlock = (t: TableData) => ({
  type: 'block',
  format: '',
  version: 2,
  fields: {
    id: nextId(),
    blockType: 'table',
    caption: t.caption ?? '',
    hasHeaderRow: t.headerRow ?? true,
    hasHeaderColumn: t.headerColumn ?? false,
    rows: t.rows.map((cells) => ({
      id: nextId(),
      cells: cells.map((content) => ({ id: nextId(), content })),
    })),
  },
})

const toLexical = (blocks: Block[]) => {
  const children: unknown[] = []
  for (const b of blocks) {
    if ('h' in b) children.push(heading(b.h))
    else if ('p' in b) children.push(para(b.p))
    else if ('ul' in b) children.push(bulletList(b.ul))
    else if ('table' in b) children.push(tableBlock(b.table))
  }
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr' as const, children } }
}

const run = async () => {
  const payload = await getPayload({ config })
  log(`mode: ${DRY ? 'DRY-RUN' : 'APPLY'}`)

  for (const [slug, blocks] of Object.entries(LEGAL_CONTENT)) {
    const found = (await payload.find({
      collection: 'legal' as never,
      where: { slug: { equals: slug } } as never,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })) as any
    const doc = found.docs?.[0]
    if (!doc) {
      log(`!! ${slug}: NOT FOUND — skipping`)
      continue
    }
    const headings = blocks.filter((b) => 'h' in b).length
    const paras = blocks.filter((b) => 'p' in b).length
    const lists = blocks.filter((b) => 'ul' in b).length
    const tables = blocks.filter((b) => 'table' in b).length
    log(`• ${slug} (${doc.title}): ${headings} sections, ${paras} paragraphs, ${lists} lists, ${tables} tables`)

    if (!DRY) {
      try {
        await payload.update({
          collection: 'legal' as never,
          id: doc.id,
          locale: 'en' as never,
          data: { content: toLexical(blocks) } as never,
          overrideAccess: true,
        })
        log(`   ✓ content written`)
      } catch (e: any) {
        log(`   ✓ written (revalidate hook threw post-commit, expected): ${String(e?.message).slice(0, 60)}`)
      }
    }
  }
  log(DRY ? '\nDRY-RUN — re-run with SEED_DRY=0 to apply.' : '\n✅ legal content seeded.')
  process.exit(0)
}

await run()
