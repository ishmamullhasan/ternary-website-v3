import type { CalloutBlock } from '@/payload-types'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { type JSXConvertersFunction, RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { JSX } from 'react'

import { getNodeText, slugify } from '@/utilities/headings'
import { cn } from '@/utilities/ui'

// Tailwind tone classes per Callout variant (WEB-455). Kept inline so the styled box
// works without a dedicated stylesheet.
const calloutVariantStyles: Record<NonNullable<CalloutBlock['variant']>, string> = {
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-100',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
}

// Add slugified ids to headings so in-page anchors / tables of contents resolve
// (the default Lexical converter renders headings without an id). Also renders the
// reusable Callout block (BlocksFeature) as a small styled box.
const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const Tag = (node.tag || 'h2') as keyof JSX.IntrinsicElements
    return <Tag id={slugify(getNodeText(node))}>{nodesToJSX({ nodes: node.children })}</Tag>
  },
  blocks: {
    callout: ({ node }: { node: SerializedBlockNode<CalloutBlock> }) => {
      const { variant, body } = node.fields
      const tone = calloutVariantStyles[variant ?? 'info']
      return (
        <div className={cn('not-prose my-6 rounded-lg border px-5 py-4', tone)}>
          {body ? <RichTextComp content={body as RichText} className="prose-sm prose-invert max-w-none" /> : null}
        </div>
      )
    },
  },
})

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
  content?: RichText | null
  className?: string
}

/**
 * Renders Lexical rich text using Payload's official converter (handles the format
 * bitfield, links, uploads, lists, and escaping correctly) — replaces the previous
 * hand-rolled Slate serializer, which silently dropped inline formatting.
 */
export default function RichTextComp({ content, className }: RichTextProps): JSX.Element | null {
  if (!content) return null

  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      <LexicalRichText converters={jsxConverters} data={content as unknown as SerializedEditorState} />
    </div>
  )
}
