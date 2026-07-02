import type { Block } from 'payload'

import { rowLabelAdmin } from '@/fields/rowLabel'
import { sectionHeader } from '@/fields/sectionHeader'

export const ContactRoutes: Block = {
  slug: 'contactRoutes',
  interfaceName: 'ContactRoutesBlock',
  labels: { singular: 'Contact Routes', plural: 'Contact Routes' },
  fields: [
    ...sectionHeader(),
    {
      name: 'items',
      label: 'Routes',
      type: 'array',
      admin: {
        ...rowLabelAdmin,
        description: 'The icon and gradient for each route is fixed in code by position.',
      },
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: false, localized: true, admin: { width: '50%' } },
        { name: 'email', label: 'Email', type: 'text', required: false, admin: { width: '50%' } },
        { name: 'description', label: 'Description', type: 'richText', required: false, localized: true },
        {
          name: 'replyWindow',
          label: 'Reply Window',
          type: 'text',
          required: false,
          localized: true,
          admin: { width: '50%' },
        },
        { name: 'cta', label: 'CTA Label', type: 'text', required: false, localized: true, admin: { width: '50%' } },
        {
          name: 'info',
          label: 'Show Info Icon',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'bestFor',
          label: 'Best For',
          type: 'array',
          admin: { ...rowLabelAdmin, description: 'Bullet points shown in the selected-route summary.' },
          fields: [{ name: 'item', label: 'Item', type: 'text', required: false, localized: true }],
        },
      ],
    },
  ],
}

export default ContactRoutes
