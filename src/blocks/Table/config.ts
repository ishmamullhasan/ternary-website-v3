import type { Block } from 'payload'

/**
 * Reusable Table block, surfaced inside richText fields via BlocksFeature (see
 * src/payload.config.ts). Renders an accessible data table for structured legal /
 * reference content (e.g. the privacy sub-processor and data-retention tables). The
 * JSX converter + styling live in src/components/richtext/index.tsx.
 *
 * The editor has no native Lexical TableFeature, so this block is the supported way to
 * author tables. Because it is a plain block, its shape is also safe to hand-seed from
 * scripts (scripts/seed-legal-content.ts).
 */
export const Table: Block = {
  slug: 'table',
  interfaceName: 'TableBlock',
  labels: { singular: 'Table', plural: 'Tables' },
  fields: [
    {
      name: 'caption',
      label: 'Caption',
      type: 'text',
      admin: { description: 'Optional caption shown above the table (also read by screen readers).' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'hasHeaderRow',
          label: 'First row is a header',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
        },
        {
          name: 'hasHeaderColumn',
          label: 'First column is a header',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '50%',
            description: 'Enable for key/value tables where the first column labels each row.',
          },
        },
      ],
    },
    {
      name: 'rows',
      label: 'Rows',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Row', plural: 'Rows' },
      admin: { description: 'Each row holds one or more cells, left to right.' },
      fields: [
        {
          name: 'cells',
          label: 'Cells',
          type: 'array',
          minRows: 1,
          labels: { singular: 'Cell', plural: 'Cells' },
          fields: [
            {
              name: 'content',
              label: 'Content',
              type: 'textarea',
            },
          ],
        },
      ],
    },
  ],
}

export default Table
