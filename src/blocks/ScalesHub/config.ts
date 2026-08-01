import type { Block } from 'payload'

import { rowLabelAdmin } from '@/fields/rowLabel'

/**
 * Scales hub (CMS build-out 2026-08-01) — the whole /scales landing as ONE editable block, same
 * contract as SolutionsHub: design in code, copy CMS-first, empty fields fall back to the authored
 * default so a half-edited doc can never render broken. Design is unchanged.
 */
export const ScalesHub: Block = {
  slug: 'scalesHub',
  interfaceName: 'ScalesHubBlock',
  labels: { singular: 'Scales Hub', plural: 'Scales Hubs' },
  fields: [
    { name: 'heroHeading', label: 'Hero heading', type: 'text', localized: true },
    { name: 'heroSub', label: 'Hero subline', type: 'textarea', localized: true },
    {
      name: 'scales',
      label: 'Scales (order = hero index order)',
      type: 'array',
      maxRows: 4,
      admin: rowLabelAdmin,
      fields: [
        { name: 'name', label: 'Name', type: 'text', localized: true },
        { name: 'title', label: 'Title', type: 'text', localized: true },
        { name: 'lede', label: 'Lede', type: 'textarea', localized: true },
        {
          name: 'facts',
          label: 'Facts',
          type: 'array',
          maxRows: 5,
          fields: [
            { name: 'k', label: 'Label', type: 'text', localized: true },
            { name: 'v', label: 'Value', type: 'textarea', localized: true },
            { name: 'lead', label: 'Emphasised (cream)', type: 'checkbox', defaultValue: false },
          ],
        },
        {
          name: 'proof',
          label: 'Recently at this scale',
          type: 'array',
          maxRows: 6,
          fields: [{ name: 'name', label: 'Client', type: 'text' }],
        },
      ],
    },
    { name: 'pointLead', label: 'The point — statement', type: 'text', localized: true },
    { name: 'pointLeadMuted', label: 'The point — statement (muted clause)', type: 'text', localized: true },
    { name: 'pointBody1', label: 'The point — paragraph 1', type: 'textarea', localized: true },
    { name: 'pointBody2', label: 'The point — paragraph 2 (lead sentence bolded in code)', type: 'textarea', localized: true },
    { name: 'pointBody2Lead', label: 'The point — paragraph 2 bolded opener', type: 'text', localized: true },
    { name: 'movesHeading', label: 'What moves heading', type: 'text', localized: true },
    {
      name: 'neverMoves',
      label: 'Never moves (list)',
      type: 'array',
      maxRows: 8,
      fields: [{ name: 'item', label: 'Item', type: 'text', localized: true }],
    },
    {
      name: 'shapedToYou',
      label: 'Shaped to you (list)',
      type: 'array',
      maxRows: 8,
      fields: [{ name: 'item', label: 'Item', type: 'text', localized: true }],
    },
    { name: 'constantHeading', label: 'The constant heading', type: 'text', localized: true },
    { name: 'constantBlurb', label: 'The constant blurb', type: 'textarea', localized: true },
    {
      name: 'constant',
      label: 'The constant (3 cards)',
      type: 'array',
      maxRows: 4,
      admin: rowLabelAdmin,
      fields: [
        { name: 'title', label: 'Title', type: 'text', localized: true },
        { name: 'body', label: 'Body', type: 'textarea', localized: true },
      ],
    },
    { name: 'ctaHeading', label: 'CTA heading', type: 'text', localized: true },
    { name: 'ctaBody', label: 'CTA body', type: 'textarea', localized: true },
  ],
}

export default ScalesHub
