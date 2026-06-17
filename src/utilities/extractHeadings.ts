import type { RichText } from '@/components/richtext'

import { getNodeText, slugify } from '@/utilities/headings'

type LexicalNode = {
  type?: string
  tag?: string
  children?: LexicalNode[]
  text?: string
}

export function extractHeadings(content?: RichText | null): { label: string; id: string }[] {
  const children = (content?.root?.children ?? []) as LexicalNode[]

  return children
    .filter((node) => node.type === 'heading' && (node.tag === 'h2' || node.tag === 'h3'))
    .map((node) => {
      const label = getNodeText(node)
      return { label, id: slugify(label) }
    })
    .filter((item) => item.label && item.id)
}
