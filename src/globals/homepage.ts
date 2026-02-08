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
      name: 'hero',
      label: 'Hero',
      type: 'group',
      fields: [
        {
          name: 'heading',
          label: 'Heading',
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
    {
      name: 'capabilities',
      label: 'Capabilities',
      type: 'group',
      fields: [
        {
          name: 'sectionTitle',
          label: 'Section Title',
          type: 'text',
          required: false,
        },
        {
          name: 'sectionDescription',
          label: 'Section Description',
          type: 'textarea',
          required: false,
        },
        {
          name: 'items',
          label: 'Items',
          type: 'array',
          required: false,
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
              type: 'textarea',
              required: false,
            },
          ],
        },
      ],
    },
    {
      name: 'solutions',
      label: 'Solutions',
      type: 'group',
      fields: [
        {
          name: 'sectionTitle',
          label: 'Section Title',
          type: 'text',
          required: false,
        },
        {
          name: 'sectionDescription',
          label: 'Section Description',
          type: 'textarea',
          required: false,
        },
        {
          name: 'items',
          label: 'Items',
          type: 'array',
          required: false,
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
              type: 'textarea',
              required: false,
            },
            {
              name: 'icon',
              label: 'Icon',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },
          ],
        },
      ],
    },
    {
      name: 'incubations',
      label: 'Incubations',
      type: 'group',
      fields: [
        {
          name: 'sectionTitle',
          label: 'Section Title',
          type: 'text',
          required: false,
        },
        {
          name: 'sectionDescription',
          label: 'Section Description',
          type: 'textarea',
          required: false,
        },
        {
          name: 'items',
          label: 'Items',
          type: 'array',
          required: false,
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
      name: 'company',
      label: 'Company',
      type: 'group',
      fields: [
        {
          name: 'sectionTitle',
          label: 'Section Title',
          type: 'text',
          required: false,
        },
        {
          name: 'sectionDescription',
          label: 'Section Description',
          type: 'textarea',
          required: false,
        },
        {
          name: 'teamSubtitle',
          label: 'Team Subtitle',
          type: 'text',
          required: false,
        },
        {
          name: 'teamDescription',
          label: 'Team Description',
          type: 'text',
          required: false,
        },
        {
          name: 'journeySubtitle',
          label: 'Journey Subtitle',
          type: 'text',
          required: false,
        },
        {
          name: 'journeyDescription',
          label: 'Journey Description',
          type: 'text',
          required: false,
        },
        {
          name: 'opportunitiesSubtitle',
          label: 'Opportunities Subtitle',
          type: 'text',
          required: false,
        },
        {
          name: 'opportunitiesDescription',
          label: 'Opportunities Description',
          type: 'text',
          required: false,
        },
      ],
    },
    {
      name: 'team',
      label: 'Team',
      type: 'group',
      fields: [
        {
          name: 'items',
          label: 'Items',
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
      name: 'timeline',
      label: 'Timeline',
      type: 'group',
      fields: [
        {
          name: 'items',
          label: 'Items',
          type: 'array',
          required: false,
          fields: [
            {
              name: 'date',
              label: 'Date',
              type: 'text',
              required: false,
            },
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
          ],
        },
      ],
    },
  ],
}

export default Homepage
