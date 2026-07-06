// Merge aboutSection's `heading` + `description` richText pair into the single `content` richText
// (config change WEB: about bento). Heading paragraph nodes are promoted to <h2> heading nodes so
// the merged doc still renders title lines in the display style and description paragraphs in the
// body style.
//
// Old field values are sourced from RAW Mongo docs — the new block schema no longer describes
// heading/description, so a schema-sanitized read drops them. Both fields are localized ({en,bn}
// keyed in raw form), so the merge runs PER LOCALE and each locale with data gets its own update
// (read that locale with fallbackLocale:false, pass title explicitly — see memory / seed-content).
//
// DRY by default; set SEED_DRY=0 to apply.
//   DATABASE_URI=<uri> pnpm payload run ./scripts/migrate-about-heading-merge.ts            # preview
//   DATABASE_URI=<uri> SEED_DRY=0 pnpm payload run ./scripts/migrate-about-heading-merge.ts # apply
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'
const LOCALES = ['en', 'bn'] as const

const payload: Payload = await getPayload({ config })
payload.logger.info(`Merge aboutSection heading+description → content ${DRY ? '(DRY RUN — no writes)' : '(WRITING)'}`)

const ignoreRevalidate = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m.includes('revalidateTag') || m.includes('static generation store')) return
    throw e
  }
}

type LexNode = { type?: string; children?: unknown[]; format?: unknown; indent?: number; direction?: unknown }
type LexDoc = { root?: LexNode & { children?: LexNode[] } }

const hasText = (doc: unknown): doc is LexDoc =>
  !!(doc as LexDoc)?.root?.children?.some((c) => (c.children as unknown[])?.length)

// Promote a heading-field paragraph to an <h2>; real heading nodes pass through. Built clean
// (no paragraph-only keys like textFormat) so lexical validation accepts the node.
const toHeadingNode = (n: LexNode): LexNode =>
  n.type === 'paragraph'
    ? {
        type: 'heading',
        // @ts-expect-error -- tag is a heading-node key not in the minimal LexNode shape
        tag: 'h2',
        format: n.format ?? '',
        indent: n.indent ?? 0,
        version: 1,
        direction: n.direction ?? 'ltr',
        children: n.children ?? [],
      }
    : n

const mergeDocs = (heading: unknown, description: unknown): LexDoc => {
  const h = hasText(heading) ? (heading as LexDoc).root!.children!.map(toHeadingNode) : []
  const d = hasText(description) ? (description as LexDoc).root!.children! : []
  return {
    root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [...h, ...d] } as never,
  }
}

const rawDocs = await payload.db.connection.collection('pages').find({ 'layout.blockType': 'aboutSection' }).toArray()

payload.logger.info(`  found ${rawDocs.length} page(s) with an aboutSection block`)

for (const rawDoc of rawDocs) {
  const id = String(rawDoc._id)
  // Per-block, per-locale merged content, keyed by block id (old values live only in the raw doc).
  const mergedByBlockId = new Map<string, Partial<Record<(typeof LOCALES)[number], LexDoc>>>()
  for (const b of rawDoc.layout ?? []) {
    if (b?.blockType !== 'aboutSection') continue
    const perLocale: Partial<Record<(typeof LOCALES)[number], LexDoc>> = {}
    for (const loc of LOCALES) {
      const h = b.heading?.[loc]
      const d = b.description?.[loc]
      if (hasText(h) || hasText(d)) perLocale[loc] = mergeDocs(h, d)
    }
    mergedByBlockId.set(String(b.id), perLocale)
  }

  for (const loc of LOCALES) {
    const blocksWithData = [...mergedByBlockId.entries()].filter(([, m]) => m[loc])
    if (blocksWithData.length === 0) {
      payload.logger.info(`  page ${rawDoc.slug ?? id} [${loc}]: no heading/description content — skipped`)
      continue
    }

    const doc = (await payload.findByID({
      collection: 'pages',
      id,
      depth: 0,
      locale: loc,
      fallbackLocale: false,
      draft: false,
      overrideAccess: true,
    })) as any

    const newLayout = (doc.layout ?? []).map((b: any) => {
      if (b.blockType !== 'aboutSection') return b
      const merged = mergedByBlockId.get(String(b.id))?.[loc]
      return merged ? { ...b, content: merged } : b
    })

    payload.logger.info(`  page ${doc.slug ?? id} [${loc}]: merging ${blocksWithData.length} block(s)`)
    if (DRY) continue

    // Pages.title is required+localized; a per-locale update that omits it fails re-validation.
    await ignoreRevalidate(() =>
      payload.update({
        collection: 'pages',
        id,
        locale: loc,
        data: { title: doc.title || rawDoc.title?.[loc] || 'Home', layout: newLayout, _status: 'published' },
        context: { disableRevalidate: true },
      }),
    )
    payload.logger.info(`  page ${doc.slug ?? id} [${loc}]: updated + published`)
  }
}

payload.logger.info(DRY ? 'DRY RUN complete — re-run with SEED_DRY=0 to apply.' : 'Migration complete.')
process.exit(0)
