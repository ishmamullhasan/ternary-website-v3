import type { Block } from 'payload'

import { rowLabelAdmin } from '@/fields/rowLabel'
import { sectionHeader } from '@/fields/sectionHeader'

export const ContactOffices: Block = {
  slug: 'contactOffices',
  interfaceName: 'ContactOfficesBlock',
  labels: { singular: 'Contact Offices', plural: 'Contact Offices' },
  fields: [
    ...sectionHeader(),
    {
      name: 'items',
      label: 'Offices',
      type: 'array',
      admin: {
        ...rowLabelAdmin,
        description: 'Office cards shown in the map carousel. Use the arrows to switch between them.',
      },
      fields: [
        { name: 'city', label: 'City', type: 'text', required: false, localized: true, admin: { width: '50%' } },
        { name: 'tag', label: 'Tag', type: 'text', required: false, localized: true, admin: { width: '50%' } },
        {
          name: 'timezone',
          label: 'Timezone',
          type: 'text',
          required: false,
          localized: true,
          admin: { width: '50%' },
        },
        { name: 'hours', label: 'Hours', type: 'text', required: false, localized: true, admin: { width: '50%' } },
        { name: 'email', label: 'Email', type: 'text', required: false, admin: { width: '50%' } },
        { name: 'phone', label: 'Phone', type: 'text', required: false, admin: { width: '50%' } },
        {
          name: 'address',
          label: 'Address',
          type: 'array',
          admin: { ...rowLabelAdmin, description: 'One line per row (street, suite, city/zip, …).' },
          fields: [{ name: 'line', label: 'Line', type: 'text', required: false, localized: true }],
        },
      ],
    },
  ],
}

export default ContactOffices
