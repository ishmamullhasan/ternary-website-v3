import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { JSX } from 'react'

import { cn } from '@/utilities/ui'

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
      <LexicalRichText data={content as unknown as SerializedEditorState} />
    </div>
  )
}
