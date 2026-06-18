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
      admin: { description: 'Small pill/badge rendered above the heading.' },
    },
    ...sectionHeader(),
    imageField({ name: 'image', label: 'Image' }),
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
        { name: 'label', label: 'Label', type: 'text' },
        {
          name: 'steps',
          label: 'Steps',
          type: 'array',
          maxRows: 4,
          admin: { ...rowLabelAdmin },
          fields: [
            { name: 'label', label: 'Label', type: 'text', admin: { width: '50%' } },
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
        { name: 'label', label: 'Label', type: 'text' },
        {
          name: 'items',
          label: 'Items',
          type: 'array',
          admin: { ...rowLabelAdmin },
          fields: [
            { name: 'label', label: 'Label', type: 'text', admin: { width: '50%' } },
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
        { name: 'label', label: 'Label', type: 'text' },
        { name: 'historyLabel', label: 'History Label', type: 'text' },
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
        { name: 'label', label: 'Title', type: 'text', admin: { width: '50%' } },
        { name: 'value', label: 'Description', type: 'textarea', admin: { width: '50%' } },
      ],
    },
  ],
}

export default SolutionFeature
