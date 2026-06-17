import type { ContentBlock } from '@/payload-types'

import type { JSX } from 'react'

import RichTextComp, { type RichText } from '@/components/richtext'

export function ContentBlockComponent({ content }: ContentBlock): JSX.Element {
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <RichTextComp content={content as unknown as RichText} />
    </section>
  )
}
