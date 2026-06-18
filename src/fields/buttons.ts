import type { ArrayField } from 'payload'

import { rowLabelAdmin } from './rowLabel'

type ButtonsOptions = { name?: string; label?: string; max?: number }

/**
 * A repeatable list of CTA buttons {label, url, variant}. Replaces the hand-rolled
 * button_1/button_2 groups across the old blocks with one previewed, row-laid-out array.
 */
export const buttonsField = ({ name = 'buttons', label = 'Buttons', max = 2 }: ButtonsOptions = {}): ArrayField => ({
  name,
  label,
  type: 'array',
  maxRows: max,
  admin: {
    description: `Up to ${max} call-to-action button${max > 1 ? 's' : ''}.`,
    ...rowLabelAdmin,
  },
  fields: [
    { name: 'label', label: 'Label', type: 'text', required: true, admin: { width: '50%' } },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      admin: { width: '50%', description: 'Internal path (e.g. /contact) or a full URL.' },
    },
    {
      name: 'variant',
      label: 'Style',
      type: 'select',
      defaultValue: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Ghost', value: 'ghost' },
      ],
      admin: { width: '50%' },
    },
  ],
})
