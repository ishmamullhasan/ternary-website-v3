// Wrap plain-string values of the newly-converted richText fields into minimal Lexical JSON so
// existing content still renders. IDEMPOTENT: a value that is already a Lexical object (has `.root`)
// is skipped; blank strings become `null`; multi-line strings split (on blank lines) into multiple
// paragraph nodes. Runs against DATABASE_URI from .env — the LOCAL dev tunnel only.
//   DATABASE_URI from .env (tunnel). DRY by default:
//     CONTENT_DRY=1 pnpm payload run ./scripts/migrate-richtext.ts   # preview / count (default)
//     CONTENT_DRY=0 pnpm payload run ./scripts/migrate-richtext.ts   # apply
import config from '@payload-config'
import { getPayload } from 'payload'
import { LOCALES } from '../src/lib/i18n/locales'

const DRY = process.env.CONTENT_DRY !== '0'
// afterChange hooks call revalidateTag, which throws outside a Next request — the write commits first.
const BENIGN = (e: unknown) => {
  const m = String((e as Error)?.message || e)
  return m.includes('static generation store missing') || m.includes('revalidateTag')
}
const save = async (fn: () => Promise<unknown>) => {
  try {
    await fn()
  } catch (e) {
    // Payload validation errors bury the per-field detail in e.data.errors — dump it before rethrowing.
    const errs = (e as { data?: { errors?: unknown[] } })?.data?.errors
    if (errs) console.dir(errs, { depth: 6 })
    if (!BENIGN(e)) throw e
  }
}

// ---- minimal Lexical builders -------------------------------------------------------------------
type LexText = {
  type: 'text'
  version: 1
  text: string
  format: 0
  style: ''
  detail: 0
}
type LexParagraph = {
  type: 'paragraph'
  version: 1
  format: ''
  indent: 0
  direction: 'ltr'
  children: LexText[]
}
type LexState = {
  root: {
    type: 'root'
    format: ''
    indent: 0
    version: 1
    direction: 'ltr'
    children: LexParagraph[]
  }
}

const paragraph = (text: string): LexParagraph => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  children: [{ type: 'text', version: 1, text, format: 0, style: '', detail: 0 }],
})

/**
 * Convert a plain string to a minimal Lexical editor state. Blank/empty → null. Multi-line strings
 * are split on blank lines (one or more empty lines) into separate paragraph nodes; single newlines
 * inside a block are preserved as-is within one text node.
 */
export function textToLexical(str: string): LexState | null {
  if (typeof str !== 'string' || str.trim() === '') return null
  const blocks = str
    .split(/\n[ \t]*\n+/) // blank-line separated paragraphs
    .map((b) => b.replace(/^\s+|\s+$/g, ''))
    .filter((b) => b !== '')
  const children = (blocks.length ? blocks : [str.trim()]).map(paragraph)
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    },
  }
}

const isLexical = (v: unknown): boolean =>
  !!v && typeof v === 'object' && !Array.isArray(v) && 'root' in (v as Record<string, unknown>)

// ---- target field paths -------------------------------------------------------------------------
// `paths` use a tiny mini-syntax: `a.b` = nested group; `a[].b` = iterate array `a`, field `b` on
// each element; `a[k=v].b` = iterate array `a` but only elements whose `k` equals `v` (used to
// target one block type inside a `blocks` field). All target fields are `localized: true`, so the
// per-locale doc holds plain values.
type Target = { collection: string; paths: string[] }

const TARGETS: Target[] = [
  {
    collection: 'capability',
    paths: [
      'whatThisMeansToUs.description',
      'howWeDoIt.description',
      'caseStudies.description',
      'caseStudies.items[].problem',
      'caseStudies.items[].approach',
      'caseStudies.items[].outcome',
      'practiceLead.bio',
      // textarea→richText description sweep: hero + CTA descriptions.
      'heroSection.description',
      'cta.description',
    ],
  },
  { collection: 'insight', paths: ['leadParagraph', 'relatedInsights.description', 'cta.description'] },
  {
    collection: 'pressRelease',
    paths: ['leadParagraph', 'pressContact.description', 'relatedPressReleases.description'],
  },
  { collection: 'team', paths: ['description'] },
  { collection: 'scale', paths: ['description'] },
  // legal uses the shared ctaGroup(), whose description became richText.
  { collection: 'legal', paths: ['cta.description'] },
  {
    collection: 'pages',
    // Every layout block's `description` (sectionHeader/ctaGroup/inline) is now richText, so the
    // blanket `layout[].description` is safe: strings convert, Lexical values are idempotently
    // skipped. Headings stay plain text except aboutSection's, so that one keeps a filtered path.
    // The nested-array paths cover per-item descriptions (solutionsEngage.cards,
    // contactRoutes/industryPanels.items, categoryLanding.categories); blocks whose arrays lack a
    // description field are no-ops.
    paths: [
      'layout[blockType=aboutSection].heading',
      'layout[blockType=aboutSection].bottomDescription',
      'layout[blockType=capabilitiesSection].description_2',
      'layout[].description',
      'layout[].cards[].description',
      'layout[].items[].description',
      'layout[].categories[].description',
    ],
  },
  {
    collection: 'industry',
    paths: ['layout[].description', 'layout[].items[].description'],
  },
]

// Globals with converted description fields — handled via findGlobal/updateGlobal per locale
// (per-locale writes: `locale: 'all'` is known to drop nested-group localized values).
const GLOBAL_TARGETS: Target[] = [{ collection: 'footer', paths: ['menu_1.description'] }]

type Change = { collection: string; id: string; field: string; locale: string }
const changes: Change[] = []
// skipped[c] counts values already in Lexical form (idempotency hits), per collection.
const skipped = new Map<string, number>()
const bump = (c: string) => skipped.set(c, (skipped.get(c) ?? 0) + 1)

/**
 * Walk a dotted/`[]` path on `doc`, applying `fn(parentObj, leafKey)` at every leaf the path
 * resolves to (array segments fan out to every element). Returns true if the doc was mutated.
 * Missing intermediate keys are skipped (no-op), so partially-populated docs are safe.
 */
function applyPath(
  doc: Record<string, unknown>,
  segments: string[],
  fn: (parent: Record<string, unknown>, key: string, concretePath: string) => boolean,
  prefix = '',
): boolean {
  const [head, ...rest] = segments
  // `a[]` iterates every element; `a[k=v]` iterates only elements where el.k === v.
  const arrayMatch = head.match(/^(\w+)\[(?:(\w+)=(\w+))?\]$/)
  const key = arrayMatch ? arrayMatch[1] : head
  const at = prefix ? `${prefix}.${key}` : key

  if (rest.length === 0) {
    // leaf — `concretePath` is the fully-indexed dotted path (e.g. `layout.3.items.2.description`),
    // usable as a direct Mongo $set key.
    if (!(key in doc)) return false
    return fn(doc, key, at)
  }

  const next = doc[key]
  if (arrayMatch) {
    if (!Array.isArray(next)) return false
    const [, , filterKey, filterVal] = arrayMatch
    let changed = false
    next.forEach((el, i) => {
      if (el && typeof el === 'object') {
        if (filterKey && (el as Record<string, unknown>)[filterKey] !== filterVal) return
        if (applyPath(el as Record<string, unknown>, rest, fn, `${at}.${i}`)) changed = true
      }
    })
    return changed
  }
  if (!next || typeof next !== 'object' || Array.isArray(next)) return false
  return applyPath(next as Record<string, unknown>, rest, fn, at)
}

const run = async () => {
  const payload = await getPayload({ config })

  for (const { collection, paths } of TARGETS) {
    for (const locale of LOCALES) {
      const res = await payload.find({
        collection: collection as never,
        locale: locale as never,
        // No fallback: a locale with no OWN value must come back empty, not as the default-locale
        // value — otherwise the per-locale write would materialize a copied-from-en value there.
        fallbackLocale: false,
        depth: 0,
        limit: 500,
        pagination: false,
      })
      for (const raw of res.docs as Record<string, unknown>[]) {
        const { id, createdAt: _c, updatedAt: _u, ...data } = raw
        const before = changes.length
        // Fully-indexed leaf paths + converted values, kept for the direct-$set fallback below.
        const leafSets: { path: string; value: unknown }[] = []

        for (const path of paths) {
          const segments = path.split('.')
          applyPath(data as Record<string, unknown>, segments, (parent, key, concretePath) => {
            const val = parent[key]
            if (typeof val === 'string') {
              const lex = textToLexical(val)
              parent[key] = lex // null for blank — clears the stale string
              leafSets.push({ path: concretePath, value: lex })
              changes.push({ collection, id: String(id), field: path, locale })
              console.log(
                `  [${collection}] ${String(id)} · ${path} · ${locale}  →  ${lex ? 'lexical' : 'null (blank)'}`,
              )
              return true
            }
            if (isLexical(val)) bump(collection) // already migrated — idempotent skip
            return false
          })
        }

        const docChanged = changes.length > before
        if (docChanged && !DRY) {
          try {
            await payload.update({
              collection: collection as never,
              id: id as never,
              locale: locale as never,
              data: data as never,
            })
          } catch (e) {
            if (BENIGN(e)) {
              // revalidateTag outside a request — the write already committed.
            } else if ((e as { name?: string }).name === 'ValidationError') {
              // A per-locale full-doc update re-validates EVERY required field in that locale, and
              // some docs legitimately lack unrelated required values there (e.g. bn item titles on
              // the about page). Fall back to a direct Mongo $set of ONLY the converted leaves —
              // localized leaves are stored as `{ en, bn }` objects, so `<path>.<locale>` targets
              // exactly the value we transformed and touches nothing else.
              const model = (payload.db as unknown as { collections: Record<string, { updateOne: CallableFunction }> })
                .collections[collection]
              const $set = Object.fromEntries(leafSets.map(({ path, value }) => [`${path}.${locale}`, value]))
              // strict:false is required — mongoose's schema strict mode silently strips dotted
              // paths into blocks arrays (updateOne reports modifiedCount:1 but writes nothing).
              await model.updateOne({ _id: id }, { $set }, { strict: false })
              console.log(
                `  [${collection}] ${String(id)} · ${locale} — full update blocked by unrelated required fields; direct $set of ${leafSets.length} leaf value(s) instead`,
              )
            } else throw e
          }
        }
      }
    }
  }

  for (const { collection: slug, paths } of GLOBAL_TARGETS) {
    for (const locale of LOCALES) {
      const raw = (await payload.findGlobal({
        slug: slug as never,
        locale: locale as never,
        fallbackLocale: false,
        depth: 0,
      })) as Record<string, unknown>
      const { id: _id, globalType: _g, createdAt: _c, updatedAt: _u, ...data } = raw
      const before = changes.length

      for (const path of paths) {
        applyPath(data as Record<string, unknown>, path.split('.'), (parent, key) => {
          const val = parent[key]
          if (typeof val === 'string') {
            const lex = textToLexical(val)
            parent[key] = lex
            changes.push({ collection: `global:${slug}`, id: slug, field: path, locale })
            console.log(`  [global:${slug}] ${path} · ${locale}  →  ${lex ? 'lexical' : 'null (blank)'}`)
            return true
          }
          if (isLexical(val)) bump(`global:${slug}`)
          return false
        })
      }

      if (changes.length > before && !DRY) {
        await save(() =>
          payload.updateGlobal({
            slug: slug as never,
            locale: locale as never,
            data: data as never,
          }),
        )
      }
    }
  }

  // ---- report ----
  const byKey = new Map<string, number>()
  for (const c of changes) {
    const k = `${c.collection}.${c.field} [${c.locale}]`
    byKey.set(k, (byKey.get(k) ?? 0) + 1)
  }
  console.log(`\n=== ${DRY ? 'DRY RUN — counts of values that WOULD change' : 'APPLIED — values changed'} ===`)
  for (const [k, n] of [...byKey.entries()].sort()) console.log(`  ${k}: ${n}`)
  if (byKey.size === 0) console.log('  (none — nothing to migrate)')

  console.log('\n=== already-Lexical (idempotent skips) per collection ===')
  if (skipped.size === 0) console.log('  (none)')
  for (const [c, n] of [...skipped.entries()].sort()) console.log(`  ${c}: ${n}`)

  console.log(
    `\n${DRY ? 'DRY RUN — no writes.' : 'APPLIED.'} Total values ${DRY ? 'to change' : 'changed'}: ${changes.length}`,
  )
  await new Promise((r) => setTimeout(r, 500))
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error('MIGRATE-RICHTEXT ERROR:', e)
  await new Promise((r) => setTimeout(r, 400))
  process.exit(1)
}
