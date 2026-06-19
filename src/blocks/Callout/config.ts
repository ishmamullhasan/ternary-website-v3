import {
  BoldFeature,
  InlineToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  ParagraphFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

/**
 * Reusable Callout block, surfaced inside richText fields via BlocksFeature (see
 * src/payload.config.ts). Renders a small coloured box for asides / notes. The JSX
 * converter lives in src/components/richtext/index.tsx.
 */
export const Callout: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    {
      name: 'variant',
      label: 'Variant',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
        { label: 'Success', value: 'success' },
      ],
      admin: { description: 'Controls the colour/tone of the callout box.' },
    },
    {
      name: 'body',
      label: 'Body',
      type: 'richText',
      localized: true,
      // Sub-richText fields require an explicit editor (otherwise sanitize would
      // recurse infinitely). Use a deliberately small feature set for callout copy.
      editor: lexicalEditor({
        features: [
          ParagraphFeature(),
          BoldFeature(),
          ItalicFeature(),
          UnorderedListFeature(),
          LinkFeature({
            enabledCollections: ['pages', 'insight', 'pressRelease', 'story', 'capability'],
          }),
          InlineToolbarFeature(),
        ],
      }),
      admin: { description: 'Callout content. Supports inline formatting and links.' },
    },
  ],
}

export default Callout
