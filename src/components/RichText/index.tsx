import React from 'react'
import serialize from '@/components/richtext/serialize'

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
}

export default function RichText({ content }: RichTextProps) {
  if (!content) {
    return null
  }

  // Extract the children array from the content.root structure
  const contentToSerialize = content.root?.children || content

  return <div>{serialize(contentToSerialize)}</div>
}
