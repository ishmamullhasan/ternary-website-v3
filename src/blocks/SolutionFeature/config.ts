import type { Block } from 'payload'

import { imageField } from '@/fields/image'
import { rowLabelAdmin } from '@/fields/rowLabel'
import { sectionHeader } from '@/fields/sectionHeader'

/**
 * Reusable two-column solution feature section. Renders one of four marketing
 * sections (Product Engineering, Enterprise Transform, Engineering Augmentation,
 * Managed Services) verbatim, switching its middle widget on `widget` and the
 * who/shape pair layout on `detailStyle`.
 */
export const SolutionFeature: Block = {
  slug: 'solutionFeature',
  interfaceName: 'SolutionFeatureBlock',
  labels: { singular: 'Solution Feature', plural: 'Solution Features' },
  fields: [
    {
      name: 'eyebrow',
      label: 'Eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small pill/badge rendered above the heading.' },
    },
    ...sectionHeader(),
    imageField({ name: 'image', label: 'Image' }),
    {
      name: 'stat',
      label: 'Stat',
      type: 'group',
      admin: { description: 'Large stat shown inside the aside rings, e.g. 10x.' },
      fields: [
        { name: 'value', label: 'Value', type: 'text', localized: true, admin: { width: '50%' } },
        { name: 'caption', label: 'Caption', type: 'text', localized: true, admin: { width: '50%' } },
      ],
    },
    {
      name: 'mainSide',
      label: 'Main column side',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
      admin: { description: 'Which side the text column sits on at large breakpoints (image takes the other).' },
    },
    {
      name: 'widget',
      label: 'Middle widget',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Trajectory steps', value: 'trajectory' },
        { label: 'Tech stack avatars', value: 'techStack' },
        { label: 'Incident history grid', value: 'incident' },
      ],
      admin: { description: 'Optional widget rendered between the header and the who/shape cards.' },
    },
    {
      name: 'trajectory',
      label: 'Trajectory',
      type: 'group',
      admin: { condition: (_, sibling) => sibling?.widget === 'trajectory' },
      fields: [
        { name: 'label', label: 'Label', type: 'text', localized: true },
        {
          name: 'steps',
          label: 'Steps',
          type: 'array',
          maxRows: 4,
          admin: { ...rowLabelAdmin },
          fields: [
            { name: 'label', label: 'Label', type: 'text', localized: true, admin: { width: '50%' } },
            { name: 'active', label: 'Highlighted', type: 'checkbox', defaultValue: false, admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      name: 'techStack',
      label: 'Tech Stack',
      type: 'group',
      admin: { condition: (_, sibling) => sibling?.widget === 'techStack' },
      fields: [
        { name: 'label', label: 'Label', type: 'text', localized: true },
        {
          name: 'items',
          label: 'Items',
          type: 'array',
          admin: { ...rowLabelAdmin },
          fields: [
            { name: 'label', label: 'Label', type: 'text', localized: true, admin: { width: '50%' } },
            { name: 'highlight', label: 'Highlighted', type: 'checkbox', defaultValue: false, admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      name: 'incident',
      label: 'Incident Response',
      type: 'group',
      admin: { condition: (_, sibling) => sibling?.widget === 'incident' },
      fields: [
        { name: 'label', label: 'Label', type: 'text', localized: true },
        { name: 'historyLabel', label: 'History Label', type: 'text', localized: true },
        {
          name: 'totalCells',
          label: 'Total Cells',
          type: 'number',
          admin: { description: 'Number of cells in the history grid.' },
        },
        {
          name: 'activeCells',
          label: 'Active Cells',
          type: 'array',
          admin: { ...rowLabelAdmin, description: 'Cell positions (1-based) to highlight as incidents.' },
          fields: [{ name: 'position', label: 'Position', type: 'number' }],
        },
      ],
    },
    // --- Aside panel (the large gradient illustration beside the text column) ---
    // The panel is chosen by `widget`, so exactly one of the four groups below is ever visible.
    // Everything the panel renders is authored here; the component falls back to its built-in
    // defaults only when a field is left empty.
    {
      name: 'outcomes',
      label: 'Panel — Outcomes footer',
      type: 'group',
      admin: {
        condition: (_, sibling) => sibling?.widget !== 'none',
        description: 'Frosted footer band at the bottom of the panel. The Migration panel has no footer.',
      },
      fields: [
        { name: 'label', label: 'Label', type: 'text', localized: true },
        { name: 'text', label: 'Text', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'panelStat',
      label: 'Panel — Stat (rings)',
      type: 'group',
      admin: {
        condition: (_, sibling) => sibling?.widget === 'trajectory',
        description: 'The big figure itself is the "Stat" group above.',
      },
      fields: [
        { name: 'label', label: 'Caption row', type: 'text', localized: true, admin: { width: '50%' } },
        { name: 'liveLabel', label: 'Live badge', type: 'text', localized: true, admin: { width: '50%' } },
      ],
    },
    {
      name: 'panelMigration',
      label: 'Panel — Migration plan',
      type: 'group',
      admin: { condition: (_, sibling) => sibling?.widget === 'none' },
      fields: [
        { name: 'label', label: 'Caption row', type: 'text', localized: true, admin: { width: '50%' } },
        {
          name: 'connector',
          label: 'Connector label',
          type: 'text',
          localized: true,
          admin: { width: '50%', description: 'Between the two stacks, e.g. "Dual-run".' },
        },
        {
          name: 'legacy',
          label: 'Legacy card',
          type: 'group',
          fields: [
            { name: 'title', label: 'Title', type: 'text', localized: true },
            {
              name: 'items',
              label: 'Items',
              type: 'array',
              admin: { ...rowLabelAdmin },
              fields: [{ name: 'label', label: 'Label', type: 'text', localized: true }],
            },
          ],
        },
        {
          name: 'modern',
          label: 'Modern card',
          type: 'group',
          fields: [
            { name: 'title', label: 'Title', type: 'text', localized: true },
            {
              name: 'items',
              label: 'Items',
              type: 'array',
              admin: { ...rowLabelAdmin },
              fields: [{ name: 'label', label: 'Label', type: 'text', localized: true }],
            },
          ],
        },
        {
          name: 'metric',
          label: 'Before/after metric',
          type: 'group',
          fields: [
            { name: 'label', label: 'Label', type: 'text', localized: true, admin: { width: '50%' } },
            { name: 'delta', label: 'Delta', type: 'text', localized: true, admin: { width: '50%' } },
            { name: 'beforeLabel', label: 'Before row label', type: 'text', localized: true, admin: { width: '25%' } },
            { name: 'before', label: 'Before value', type: 'text', localized: true, admin: { width: '25%' } },
            { name: 'afterLabel', label: 'After row label', type: 'text', localized: true, admin: { width: '25%' } },
            { name: 'after', label: 'After value', type: 'text', localized: true, admin: { width: '25%' } },
            {
              name: 'afterPct',
              label: 'After bar width (%)',
              type: 'number',
              min: 0,
              max: 100,
              admin: { description: 'The "before" bar is always full width; this is the after bar, 0–100.' },
            },
          ],
        },
      ],
    },
    {
      name: 'panelCommits',
      label: 'Panel — Commit feed',
      type: 'group',
      admin: { condition: (_, sibling) => sibling?.widget === 'techStack' },
      fields: [
        { name: 'label', label: 'Repo / branch', type: 'text', localized: true },
        {
          name: 'commits',
          label: 'Commits',
          type: 'array',
          admin: { ...rowLabelAdmin },
          fields: [
            { name: 'message', label: 'Message', type: 'text', localized: true },
            { name: 'author', label: 'Author', type: 'text', localized: true, admin: { width: '33%' } },
            { name: 'added', label: 'Added', type: 'text', localized: true, admin: { width: '33%' } },
            { name: 'removed', label: 'Removed', type: 'text', localized: true, admin: { width: '33%' } },
          ],
        },
        {
          name: 'footer',
          label: 'Velocity footer',
          type: 'group',
          fields: [
            { name: 'label', label: 'Label', type: 'text', localized: true, admin: { width: '33%' } },
            { name: 'value', label: 'Value', type: 'text', localized: true, admin: { width: '33%' } },
            { name: 'caption', label: 'Caption', type: 'text', localized: true, admin: { width: '33%' } },
          ],
        },
      ],
    },
    {
      name: 'panelReliability',
      label: 'Panel — Reliability console',
      type: 'group',
      admin: { condition: (_, sibling) => sibling?.widget === 'incident' },
      fields: [
        { name: 'label', label: 'Caption row', type: 'text', localized: true, admin: { width: '50%' } },
        { name: 'statusLabel', label: 'Status badge', type: 'text', localized: true, admin: { width: '50%' } },
        {
          name: 'uptime',
          label: 'Headline uptime',
          type: 'group',
          fields: [
            { name: 'value', label: 'Value', type: 'text', localized: true, admin: { width: '50%' } },
            { name: 'caption', label: 'Caption', type: 'text', localized: true, admin: { width: '50%' } },
          ],
        },
        {
          name: 'chart',
          label: 'Uptime chart',
          type: 'group',
          admin: {
            description:
              'Bar heights are generated deterministically; you control how many bars there are and which ones dip amber.',
          },
          fields: [
            {
              name: 'barCount',
              label: 'Number of bars',
              type: 'number',
              min: 1,
              max: 120,
              admin: { width: '50%' },
            },
            {
              name: 'dips',
              label: 'Amber dips',
              type: 'array',
              admin: { ...rowLabelAdmin, description: 'Bar positions (1-based) to render as an amber dip.' },
              fields: [{ name: 'position', label: 'Position', type: 'number' }],
            },
            { name: 'startLabel', label: 'Axis start', type: 'text', localized: true, admin: { width: '50%' } },
            { name: 'endLabel', label: 'Axis end', type: 'text', localized: true, admin: { width: '50%' } },
          ],
        },
        {
          name: 'metrics',
          label: 'SLO cards',
          type: 'array',
          maxRows: 3,
          admin: { ...rowLabelAdmin },
          fields: [
            { name: 'label', label: 'Label', type: 'text', localized: true, admin: { width: '50%' } },
            { name: 'value', label: 'Value', type: 'text', localized: true, admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      name: 'detailStyle',
      label: 'Who/Shape card style',
      type: 'select',
      defaultValue: 'compactGrid',
      options: [
        { label: 'Big panels (2-up, tall)', value: 'bigPanel' },
        { label: 'Large stacked', value: 'largeStacked' },
        { label: 'Compact 2-up grid', value: 'compactGrid' },
      ],
      admin: { description: 'Layout used for the two detail cards below the widget.' },
    },
    {
      name: 'detail',
      label: 'Detail cards',
      type: 'array',
      maxRows: 2,
      admin: {
        ...rowLabelAdmin,
        description: 'Two cards: row 1 = "Who it\'s for", row 2 = "Shape / Engagement shape".',
      },
      fields: [
        { name: 'label', label: 'Title', type: 'text', localized: true, admin: { width: '50%' } },
        { name: 'value', label: 'Description', type: 'textarea', localized: true, admin: { width: '50%' } },
      ],
    },
  ],
}

export default SolutionFeature
