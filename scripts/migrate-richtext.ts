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
// each element. All target fields are `localized: true`, so the per-locale doc holds plain values.
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
    ],
  },
  { collection: 'insight', paths: ['leadParagraph', 'relatedInsights.description', 'cta.description'] },
  {
    collection: 'pressRelease',
    paths: ['leadParagraph', 'pressContact.description', 'relatedPressReleases.description'],
  },
  { collection: 'team', paths: ['description'] },
  { collection: 'scale', paths: ['description'] },
]

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
  fn: (parent: Record<string, unknown>, key: string) => boolean,
): boolean {
  const [head, ...rest] = segments
  const isArray = head.endsWith('[]')
  const key = isArray ? head.slice(0, -2) : head

  if (rest.length === 0) {
    // leaf
    if (!(key in doc)) return false
    return fn(doc, key)
  }

  const next = doc[key]
  if (isArray) {
    if (!Array.isArray(next)) return false
    let changed = false
    for (const el of next) {
      if (el && typeof el === 'object') {
        if (applyPath(el as Record<string, unknown>, rest, fn)) changed = true
      }
    }
    return changed
  }
  if (!next || typeof next !== 'object' || Array.isArray(next)) return false
  return applyPath(next as Record<string, unknown>, rest, fn)
}

const run = async () => {
  const payload = await getPayload({ config })

  for (const { collection, paths } of TARGETS) {
    for (const locale of LOCALES) {
      const res = await payload.find({
        collection: collection as never,
        locale: locale as never,
        depth: 0,
        limit: 500,
        pagination: false,
      })
      for (const raw of res.docs as Record<string, unknown>[]) {
        const { id, createdAt: _c, updatedAt: _u, ...data } = raw
        const before = changes.length

        for (const path of paths) {
          const segments = path.split('.')
          applyPath(data as Record<string, unknown>, segments, (parent, key) => {
            const val = parent[key]
            if (typeof val === 'string') {
              const lex = textToLexical(val)
              parent[key] = lex // null for blank — clears the stale string
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
          await save(() =>
            payload.update({
              collection: collection as never,
              id: id as never,
              locale: locale as never,
              data: data as never,
            }),
          )
        }
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
