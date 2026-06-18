import type { Block } from 'payload'

import { imageField } from '@/fields/image'
import { iconSelect } from '@/fields/iconSelect'
import { rowLabelAdmin } from '@/fields/rowLabel'
import { sectionHeader } from '@/fields/sectionHeader'

export const CategoryLanding: Block = {
  slug: 'categoryLanding',
  interfaceName: 'CategoryLandingBlock',
  labels: { singular: 'Category Landing', plural: 'Category Landings' },
  fields: [
    ...sectionHeader(),
    {
      name: 'categories',
      label: 'Categories',
      type: 'array',
      admin: { ...rowLabelAdmin },
      fields: [
        { name: 'title', label: 'Title', type: 'text', admin: { width: '50%' } },
        {
          ...iconSelect(['newspaper', 'flask-conical', 'lightbulb', 'file-text'], {
            description: 'Lucide icon shown at the top of the category card.',
          }),
          admin: {
            description: 'Lucide icon shown at the top of the category card.',
            width: '50%',
          },
        },
        { name: 'description', label: 'Description', type: 'textarea' },
        imageField({ name: 'image', label: 'Image' }),
        {
          name: 'link',
          label: 'Link',
          type: 'text',
          admin: { width: '50%', description: 'URL the category card links to.' },
        },
        {
          name: 'linkLabel',
          label: 'Link Label',
          type: 'text',
          admin: { width: '50%', description: 'e.g. "Open section"' },
        },
      ],
    },
  ],
}

export default CategoryLanding
