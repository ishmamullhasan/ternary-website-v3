import type { Block } from 'payload'

export const IndustriesPageSection: Block = {
  slug: 'industriesPageSection',
  interfaceName: 'IndustriesPageBlock',
  labels: { singular: 'Industries Page', plural: 'Industries Page' },
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
      ],
    },

    {
      name: 'industryList',
      label: 'Industry List',
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
          name: 'industry',
          label: 'Industries',
          type: 'relationship',
          relationTo: 'industry',
          hasMany: true,
          required: false,
        },
      ],
    },

    {
      name: 'details',
      label: 'Details',
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
          name: 'content',
          label: 'Content',
          type: 'richText',
          required: false,
        },
      ],
    },

    {
      name: 'perIndustryPanels',
      label: 'Per-industry Panels',
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
          label: 'Panels',
          type: 'array',
          fields: [
            {
              name: 'industry',
              label: 'Industry',
              type: 'relationship',
              relationTo: 'industry',
              required: false,
            },
            {
              name: 'title',
              label: 'Title',
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
              name: 'image',
              label: 'Image',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },
            {
              name: 'tags',
              label: 'Tags',
              type: 'array',
              fields: [
                {
                  name: 'name',
                  label: 'Name',
                  type: 'text',
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    },

    {
      name: 'crossIndustryPatterns',
      label: 'Cross-industry Patterns',
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
      name: 'regulatoryPosture',
      label: 'Regulatory Posture',
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
                { label: 'Lock', value: 'lock' },
                { label: 'Activity', value: 'activity' },
                { label: 'Check', value: 'check' },
              ],
              admin: {
                description: 'Lucide icon shown at the top of the regulatory posture card.',
              },
            },
          ],
        },
      ],
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

export default IndustriesPageSection
