import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

const ScalesPage: GlobalConfig = {
  slug: 'scalesPage',
  label: 'Scales Page',
  admin: {
    group: 'Pages',
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_scalesPage', 'max')
      },
    ],
  },
  fields: [
    {
      name: 'heroSection',
      label: 'Hero Section',
      type: 'group',
      fields: [
        {
          name: 'heading',
          label: 'Heading',
          type: 'text',
          required: false,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: false,
        },
        {
          name: 'items',
          label: 'Items',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'image',
              label: 'Image',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },
          ],
        },
      ],
    },

    {
      name: 'qualityBar',
      label: 'Quality Bar',
      type: 'group',
      fields: [
        {
          name: 'heading',
          label: 'Heading',
          type: 'text',
          required: false,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: false,
        },

        {
          name: 'items',
          label: 'Items',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'excerpt',
              label: 'Excerpt',
              type: 'textarea',
              required: false,
            },
            {
              name: 'icon',
              label: 'Icon',
              type: 'select',
              required: false,
              options: [
                { label: 'Activity', value: 'activity' },
                { label: 'Shield check', value: 'shield-check' },
                { label: 'Workflow', value: 'workflow' },
                { label: 'Book check', value: 'book-check' },
              ],
              admin: {
                description: 'Lucide icon shown at the top of the quality bar card.',
              },
            },
          ],
        },
      ],
    },

    {
      name: 'scale',
      label: 'Scale',
      type: 'relationship',
      relationTo: 'scale',
      hasMany: true,
      required: false,
    },

    {
      name: 'cta',
      label: 'CTA',
      type: 'group',
      fields: [
        {
          name: 'heading',
          label: 'Heading',
          type: 'text',
          required: false,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: false,
        },
        {
          name: 'backgroundImage',
          label: 'Background Image',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },

        {
          name: 'button_1',
          label: 'Button 1',
          type: 'group',
          required: false,
          fields: [
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: false,
            },
            {
              name: 'link',
              label: 'Link',
              type: 'text',
              required: false,
            },
          ],
        },

        {
          name: 'button_2',
          label: 'Button 2',
          type: 'group',
          required: false,
          fields: [
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: false,
            },
            {
              name: 'link',
              label: 'Link',
              type: 'text',
              required: false,
            },
          ],
        },
      ],
    },
  ],
}

export default ScalesPage
