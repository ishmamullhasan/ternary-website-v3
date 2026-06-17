import type { Block } from 'payload'

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: { singular: 'Content', plural: 'Content Sections' },
  fields: [{ name: 'content', label: 'Content', type: 'richText' }],
}
