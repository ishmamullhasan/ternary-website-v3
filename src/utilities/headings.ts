/** Slugify a heading label into a stable anchor id. */
export const slugify = (str: string): string =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

type TextNode = { text?: string; children?: readonly unknown[] }

/** Recursively extract plain text from a Lexical node's subtree. */
export const getNodeText = (node: TextNode): string => {
  if (typeof node.text === 'string') return node.text
  return (node.children ?? []).map((child) => getNodeText(child as TextNode)).join('')
}
