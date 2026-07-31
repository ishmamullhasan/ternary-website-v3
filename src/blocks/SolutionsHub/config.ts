import type { Block } from 'payload'

import { rowLabelAdmin } from '@/fields/rowLabel'

/**
 * Solutions hub (Phase 1 CMS build-out) — the whole /solutions landing as ONE editable block.
 * The component keeps the page's original design verbatim and falls back to the previous
 * hardcoded copy for any field left empty, so a half-authored doc can never render broken.
 * The compare table's columns are the solutions' own names; cells are plain text and the
 * component bolds the model names (Frame/Flow/Orchestra) automatically.
 */
export const SolutionsHub: Block = {
  slug: 'solutionsHub',
  interfaceName: 'SolutionsHubBlock',
  labels: { singular: 'Solutions Hub', plural: 'Solutions Hubs' },
  fields: [
    { name: 'heroHeading', label: 'Hero heading', type: 'text', localized: true },
    { name: 'heroSub', label: 'Hero subline', type: 'textarea', localized: true },
    {
      name: 'solutions',
      label: 'Solutions (order = hub order = compare columns)',
      type: 'array',
      maxRows: 6,
      admin: rowLabelAdmin,
      fields: [
        { name: 'name', label: 'Name', type: 'text', localized: true },
        { name: 'tagline', label: 'Tagline', type: 'text', localized: true },
        { name: 'who', label: 'Who it is for', type: 'textarea', localized: true },
        { name: 'what', label: 'What we do', type: 'textarea', localized: true },
        { name: 'get', label: 'What you get', type: 'textarea', localized: true },
        { name: 'proofClient', label: 'Proof — client name', type: 'text' },
        { name: 'proofBody', label: 'Proof — one line', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'models',
      label: 'Engagement models',
      type: 'array',
      maxRows: 4,
      admin: rowLabelAdmin,
      fields: [
        { name: 'name', label: 'Name (no ™ — added in code)', type: 'text' },
        { name: 'tag', label: 'Tag line', type: 'text', localized: true },
        { name: 'body', label: 'Body', type: 'text', localized: true },
        { name: 'ideal', label: 'Ideal for', type: 'text', localized: true },
      ],
    },
    {
      name: 'compareRows',
      label: 'Compare table rows (cells in solution order)',
      type: 'array',
      admin: rowLabelAdmin,
      fields: [
        { name: 'label', label: 'Row label', type: 'text', localized: true },
        { name: 'tabular', label: 'Tabular numerals', type: 'checkbox', defaultValue: false },
        {
          name: 'cells',
          label: 'Cells',
          type: 'array',
          maxRows: 6,
          fields: [{ name: 'cell', label: 'Cell', type: 'text', localized: true }],
        },
      ],
    },
    { name: 'ctaHeading', label: 'CTA heading', type: 'text', localized: true },
    { name: 'ctaBody', label: 'CTA body', type: 'textarea', localized: true },
  ],
}

export default SolutionsHub
