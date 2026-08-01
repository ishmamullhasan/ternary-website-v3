import type { Block } from 'payload'

import { rowLabelAdmin } from '@/fields/rowLabel'

/**
 * Industries hub (CMS build-out 2026-08-01) — the /industries landing as ONE editable block. The
 * design is the existing CSS-driven `.hub` layout with the interactive sector explorer
 * (SectorIndex) intact; only the copy becomes CMS-first, with the previous hardcoded content as
 * the fallback so a half-edited doc can never render broken. Design is unchanged.
 */
export const IndustriesHub: Block = {
  slug: 'industriesHub',
  interfaceName: 'IndustriesHubBlock',
  labels: { singular: 'Industries Hub', plural: 'Industries Hubs' },
  fields: [
    { name: 'heroHeading', label: 'Hero heading', type: 'text', localized: true },
    { name: 'heroSub', label: 'Hero subline', type: 'textarea', localized: true },
    { name: 'sectorsHeading', label: 'Sectors heading', type: 'text', localized: true },
    { name: 'sectorsSub', label: 'Sectors subline', type: 'textarea', localized: true },
    {
      name: 'sectors',
      label: 'Sectors (order = rail order)',
      type: 'array',
      maxRows: 12,
      admin: rowLabelAdmin,
      fields: [
        { name: 'name', label: 'Name', type: 'text', localized: true },
        { name: 'desc', label: 'One-line description', type: 'textarea', localized: true },
        { name: 'label', label: 'Proof label (e.g. "In the sector" / "Posture")', type: 'text', localized: true },
        {
          name: 'clients',
          label: 'Named clients',
          type: 'array',
          maxRows: 8,
          fields: [{ name: 'name', label: 'Client', type: 'text', localized: true }],
        },
        { name: 'none', label: 'No-client placeholder (e.g. "Named work under NDA")', type: 'text', localized: true },
        {
          name: 'caps',
          label: 'Capabilities drawn on',
          type: 'array',
          maxRows: 8,
          fields: [{ name: 'cap', label: 'Capability', type: 'text', localized: true }],
        },
      ],
    },
    { name: 'approachHeading', label: 'Approach heading', type: 'text', localized: true },
    {
      name: 'approach',
      label: 'Approach steps (a sequence)',
      type: 'array',
      maxRows: 6,
      admin: rowLabelAdmin,
      fields: [
        { name: 'title', label: 'Title', type: 'text', localized: true },
        { name: 'body', label: 'Body', type: 'textarea', localized: true },
      ],
    },
    { name: 'postureHeading', label: 'Regulatory-posture heading', type: 'text', localized: true },
    {
      name: 'posture',
      label: 'Regulatory posture (standing guarantees)',
      type: 'array',
      maxRows: 6,
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

export default IndustriesHub
