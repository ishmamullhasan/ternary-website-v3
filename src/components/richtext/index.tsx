import type { CalloutBlock } from '@/payload-types'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { type JSXConvertersFunction, RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { JSX, ReactNode } from 'react'

import { getNodeText, slugify } from '@/utilities/headings'
import { cn } from '@/utilities/ui'

// Tailwind tone classes per Callout variant (WEB-455). Kept inline so the styled box
// works without a dedicated stylesheet.
const calloutVariantStyles: Record<NonNullable<CalloutBlock['variant']>, string> = {
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-100',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
}

// Local shape of the Table block's fields. The generated `TableBlock` type in payload-types
// is only produced by `pnpm generate:types` after the block is added; typing the converter
// against this local interface keeps the file compiling until that regeneration runs.
type TableCell = { content?: string | null }
type TableRow = { cells?: TableCell[] | null }
interface TableBlockFields {
  caption?: string | null
  hasHeaderRow?: boolean | null
  hasHeaderColumn?: boolean | null
  rows?: TableRow[] | null
}

// Renders any `[CONFIRM: …]` marker left in draft copy as an obvious bold "fill-in" chip, so an
// unfinished legal page reads clearly ("what goes here") instead of leaking raw bracket syntax. The
// markers stay verbatim in the CMS content, so replacing them later is a plain find-and-replace.
// Opt-in per render via RichTextComp's `highlightPlaceholders` prop (off everywhere else).
const CONFIRM_RE = /\[CONFIRM:\s*([\s\S]*?)\]/g
const PLACEHOLDER_CLS =
  'not-prose mx-0.5 inline rounded border border-amber-400/50 bg-amber-400/10 px-1.5 py-0.5 align-baseline font-semibold not-italic text-amber-100'

function renderWithPlaceholders(text: string): ReactNode {
  if (!text || !text.includes('[CONFIRM')) return text
  const out: ReactNode[] = []
  let last = 0
  let key = 0
  let m: RegExpExecArray | null
  CONFIRM_RE.lastIndex = 0
  while ((m = CONFIRM_RE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(
      <span key={key++} className={PLACEHOLDER_CLS}>
        <span className="mr-1.5 font-mono text-[0.7em] uppercase tracking-wider text-amber-300/80">input needed</span>
        {m[1].trim()}
      </span>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

// Add slugified ids to headings so in-page anchors / tables of contents resolve
// (the default Lexical converter renders headings without an id). Also renders the
// reusable Callout and Table blocks (BlocksFeature) with on-brand styling. When
// `highlightPlaceholders` is set, `[CONFIRM: …]` markers in text + table cells render as
// bold fill-in chips (see renderWithPlaceholders).
const buildConverters =
  ({ highlightPlaceholders }: { highlightPlaceholders?: boolean }): JSXConvertersFunction =>
  ({ defaultConverters }) => {
    const fmt = (s: string): ReactNode => (highlightPlaceholders ? renderWithPlaceholders(s) : s)

    return {
      ...defaultConverters,
      heading: ({ node, nodesToJSX }) => {
        const Tag = (node.tag || 'h2') as keyof JSX.IntrinsicElements
        return <Tag id={slugify(getNodeText(node))}>{nodesToJSX({ nodes: node.children })}</Tag>
      },
      // Only override text rendering when highlighting is on. The override preserves the common
      // inline formats (bold/italic/underline/strike/code) via the Lexical format bitfield — legal
      // draft copy has none, but this keeps the override safe if reused elsewhere.
      ...(highlightPlaceholders
        ? {
            text: ({ node }: { node: { text: string; format?: number } }) => {
              let el: ReactNode = renderWithPlaceholders(node.text)
              const f = node.format ?? 0
              if (f & 1) el = <strong>{el}</strong>
              if (f & 2) el = <em>{el}</em>
              if (f & 8) el = <u>{el}</u>
              if (f & 4) el = <s>{el}</s>
              if (f & 16) el = <code>{el}</code>
              return el
            },
          }
        : {}),
      blocks: {
        callout: ({ node }: { node: SerializedBlockNode<CalloutBlock> }) => {
          const { variant, body } = node.fields
          const tone = calloutVariantStyles[variant ?? 'info']
          return (
            <div className={cn('not-prose my-6 rounded-md border px-5 py-4', tone)}>
              {body ? <RichTextComp content={body as RichText} className="prose-sm prose-invert max-w-none" /> : null}
            </div>
          )
        },
        // Accessible data table. `not-prose` opts out of the prose table styling so the tokens
        // below own the look; the wrapper scrolls horizontally on narrow viewports. Header cells
        // use scope="col"/"row" so screen readers announce the right association. Cell text keeps
        // authored line breaks (whitespace-pre-line). Colours are dark-theme tokens — text-body on
        // bg-badge sits at the AAA contrast floor documented in CLAUDE.md.
        table: ({ node }: { node: SerializedBlockNode<TableBlockFields> }) => {
          const { caption, hasHeaderRow, hasHeaderColumn, rows } = node.fields
          if (!rows?.length) return null
          const headerRow = hasHeaderRow ? rows[0] : null
          const bodyRows = hasHeaderRow ? rows.slice(1) : rows

          return (
            <div className="not-prose my-8 w-full overflow-x-auto rounded-md border border-line">
              <table className="w-full border-collapse text-left align-top text-[15px] leading-relaxed">
                {caption ? (
                  <caption className="border-b border-line px-4 py-3 text-left text-[13px] text-subtle">
                    {fmt(caption)}
                  </caption>
                ) : null}
                {headerRow ? (
                  <thead>
                    <tr>
                      {headerRow.cells?.map((cell, i) => (
                        <th key={i} scope="col" className="bg-badge px-4 py-3 font-medium text-cream">
                          {fmt(cell?.content ?? '')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody>
                  {bodyRows.map((row, r) => (
                    <tr key={r} className="border-t border-line">
                      {row.cells?.map((cell, c) =>
                        hasHeaderColumn && c === 0 ? (
                          <th
                            key={c}
                            scope="row"
                            className="whitespace-pre-line bg-badge/50 px-4 py-3 text-left align-top font-medium text-cream"
                          >
                            {fmt(cell?.content ?? '')}
                          </th>
                        ) : (
                          <td key={c} className="whitespace-pre-line px-4 py-3 align-top text-body">
                            {fmt(cell?.content ?? '')}
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        },
      },
    }
  }

/**
 * Shape of a Lexical rich-text field value. Kept as a named export because callers
 * annotate/cast their CMS content with it (`content as RichText`).
 */
export interface RichText {
  root: {
    type: string
    children: {
      type: string
      version: number
      [k: string]: unknown
    }[]
    direction: ('ltr' | 'rtl') | null
    format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
    indent: number
    version: number
  }
  [k: string]: unknown
}

interface RichTextProps {
  // Accepts a plain string too: fields newly converted to richText may still hold a plain string in
  // the DB until the production data migration runs, so render those gracefully instead of crashing.
  content?: RichText | string | null
  className?: string
  // When true, `[CONFIRM: …]` draft markers in the content render as bold amber "fill-in" chips
  // (see renderWithPlaceholders). Used by unfinished pages (e.g. the legal docs) so blanks are
  // obvious. Off by default — every other surface renders content as-is.
  highlightPlaceholders?: boolean
}

/**
 * Renders Lexical rich text using Payload's official converter (handles the format
 * bitfield, links, uploads, lists, and escaping correctly) — replaces the previous
 * hand-rolled Slate serializer, which silently dropped inline formatting.
 */
export default function RichTextComp({ content, className, highlightPlaceholders }: RichTextProps): JSX.Element | null {
  if (!content) return null

  // Defensive fallback: a field converted to richText may still contain a plain string in the DB
  // until the production migration wraps it into Lexical state. Render it as paragraphs (split on
  // blank lines) so content shows correctly rather than disappearing or throwing in the converter.
  if (typeof content === 'string') {
    const text = content.trim()
    if (!text) return null
    return (
      <div className={cn('prose prose-invert max-w-none', className)}>
        {text.split(/\n[ \t]*\n+/).map((para, i) => (
          <p key={i}>{para.trim()}</p>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      <LexicalRichText
        converters={buildConverters({ highlightPlaceholders })}
        data={content as unknown as SerializedEditorState}
      />
    </div>
  )
}
