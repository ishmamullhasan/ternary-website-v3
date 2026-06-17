import type { RichText } from '@/components/richtext'

type LexicalNode = {
  type?: string
  tag?: string
  children?: LexicalNode[]
  text?: string
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function getTextFromNode(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  if (!node.children?.length) return ''
  return node.children.map(getTextFromNode).join('')
}

export function extractHeadings(content?: RichText | null): { label: string; id: string }[] {
  const children = (content?.root?.children ?? []) as LexicalNode[]

  return children
    .filter((node) => node.type === 'heading' && (node.tag === 'h2' || node.tag === 'h3'))
    .map((node) => {
      const label = getTextFromNode(node)
      return { label, id: slugify(label) }
    })
    .filter((item) => item.label && item.id)
}
