import type { Block } from 'payload'

import { rowLabelAdmin } from '@/fields/rowLabel'

/**
 * Capabilities hub (CMS build-out 2026-08-01) — the whole /capabilities landing as ONE editable
 * block, same contract as SolutionsHub: design lives in code, copy is CMS-first, and every field
 * left empty falls back to the authored default so a half-edited doc can never render broken.
 * The index items' `slug` matches the capability detail route (/capabilities/<slug>).
 */
export const CapabilitiesHub: Block = {
  slug: 'capabilitiesHub',
  interfaceName: 'CapabilitiesHubBlock',
  labels: { singular: 'Capabilities Hub', plural: 'Capabilities Hubs' },
  fields: [
    { name: 'heroHeading', label: 'Hero heading', type: 'text', localized: true },
    { name: 'heroSub', label: 'Hero subline', type: 'textarea', localized: true },
    { name: 'framingLead', label: 'Framing — statement', type: 'text', localized: true },
    { name: 'framingLeadMuted', label: 'Framing — statement (muted second clause)', type: 'text', localized: true },
    { name: 'framingBody', label: 'Framing — supporting sentence', type: 'textarea', localized: true },
    { name: 'indexHeading', label: 'Index heading', type: 'text', localized: true },
    { name: 'indexBlurb', label: 'Index blurb', type: 'textarea', localized: true },
    {
      name: 'capabilities',
      label: 'Capabilities (order = index order = hero chips)',
      type: 'array',
      maxRows: 12,
      admin: rowLabelAdmin,
      fields: [
        { name: 'name', label: 'Name', type: 'text', localized: true },
        { name: 'slug', label: 'Detail-page slug', type: 'text' },
        { name: 'body', label: 'Body', type: 'textarea', localized: true },
        {
          name: 'tags',
          label: 'Tags',
          type: 'array',
          maxRows: 8,
          fields: [{ name: 'tag', label: 'Tag', type: 'text', localized: true }],
        },
      ],
    },
    { name: 'combosHeading', label: 'Combinations heading', type: 'text', localized: true },
    { name: 'combosBlurb', label: 'Combinations blurb', type: 'textarea', localized: true },
    {
      name: 'combinations',
      label: 'Combinations (case-study cards)',
      type: 'array',
      maxRows: 6,
      admin: rowLabelAdmin,
      fields: [
        { name: 'tag', label: 'Eyebrow tag', type: 'text', localized: true },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'body', label: 'Body', type: 'textarea', localized: true },
        {
          name: 'caps',
          label: 'Capabilities used',
          type: 'array',
          maxRows: 6,
          fields: [{ name: 'cap', label: 'Capability', type: 'text', localized: true }],
        },
      ],
    },
    { name: 'standardHeading', label: 'Standard heading', type: 'text', localized: true },
    {
      name: 'standard',
      label: 'The standard (3 cards)',
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

export default CapabilitiesHub
