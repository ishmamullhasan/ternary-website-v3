'use client'

import { RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

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
  data?: RichText | null
  className?: string
  enableGutter?: boolean
  enableProse?: boolean
}

export default function RichText({
  content,
  data,
  className,
}: RichTextProps) {
  const richContent = (content ?? data) as SerializedEditorState | null | undefined
  if (!richContent) {
    return null
  }

  return (
    <div className={className}>
      <PayloadRichText data={richContent} />
    </div>
  )
}
