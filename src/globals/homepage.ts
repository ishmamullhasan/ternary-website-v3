import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_homepage')
      },
    ],
  },
  fields: [
    {
      name: 'about',
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
          type: 'relationship',
          relationTo: ['capability', 'solution', 'industry', 'scale', 'model'],
          hasMany: true,
          required: false,
        },
        {
          name: 'organizations',
          type: 'group',
          fields: [
            {
              name: 'heading',
              label: 'Heading',
              type: 'text',
              required: false,
            },
            {
              name: 'organization',
              type: 'array',
              fields: [
                {
                  name: 'icon',
                  label: 'Icon',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                },
                {
                  name: 'name',
                  label: 'Name',
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
        {
          name: 'bottomDescription',
          label: 'Bottom Description',
          type: 'textarea',
          required: false,
        },
      ],
    },
    {
      name: 'solutions',
      label: 'Solutions',
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
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'items',
          label: 'Solution',
          type: 'relationship',
          hasMany: true,
          relationTo: 'solution',
          required: false,
        },
      ],
    },
    {
      name: 'capabilities',
      label: 'Capabilities',
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
          name: 'capability',
          label: 'capability',
          type: 'relationship',
          relationTo: 'capability',
          hasMany: true,
          required: false,
        },
        {
          name: 'heading_2',
          label: 'Leadership',
          type: 'text',
          required: false,
        },
        {
          name: 'description_2',
          label: 'Leadership Description',
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
    {
      name: 'industries',
      label: 'Industries',
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
          label: 'Industry',
          type: 'relationship',
          relationTo: 'industry',
          hasMany: true,
          required: false,
        },
      ],
    },
    {
      name: 'scales',
      label: 'Scales',
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
          name: 'scale',
          label: 'Scale',
          type: 'relationship',
          relationTo: 'scale',
          hasMany: true,
          required: false,
        },
      ],
    },
    {
      name: 'engagement',
      label: 'Engagement',
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
          name: 'model',
          label: 'model',
          type: 'relationship',
          relationTo: 'model',
          hasMany: true,
          required: false,
        },
      ],
    },
    {
      name: 'globalDelivery',
      label: 'Global Delivery',
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
    {
      name: 'processes',
      label: 'Processes',
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
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'process',
          label: 'Process',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'richText',
              required: false,
            },
          ],
        },
      ],
    },

    {
      name: 'team',
      label: 'Team',
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
          name: 'members',
          label: 'Members',
          type: 'array',
          required: false,
          fields: [
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: false,
            },
            {
              name: 'position',
              label: 'Position',
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
            {
              name: 'linkedin',
              label: 'LinkedIn URL',
              type: 'text',
              required: false,
            },
          ],
        },
      ],
    },
    {
      name: 'opportunities',
      label: 'Opportunities',
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
          name: 'opportunity',
          label: 'opportunity',
          type: 'relationship',
          relationTo: 'job',
          hasMany: true,
          required: false,
        },
      ],
    },
    // {
    //   name: 'timeline',
    //   label: 'Timeline',
    //   type: 'group',
    //   fields: [
    //     {
    //       name: 'items',
    //       label: 'Items',
    //       type: 'array',
    //       required: false,
    //       fields: [
    //         {
    //           name: 'date',
    //           label: 'Date',
    //           type: 'text',
    //           required: false,
    //         },
    //         {
    //           name: 'title',
    //           label: 'Title',
    //           type: 'text',
    //           required: false,
    //         },
    //       ],
    //     },
    //   ],
    // },
  ],
}

export default Homepage
