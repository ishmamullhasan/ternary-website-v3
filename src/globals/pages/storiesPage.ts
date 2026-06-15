import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

const StoriesPage: GlobalConfig = {
  slug: 'storiesPage',
  label: 'Stories Page',
  admin: {
    group: 'Pages',
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_storiesPage', 'max')
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
      ],
    },

    {
      name: 'featureCaseStudy',
      label: 'Feature Case Study',
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
          name: 'story',
          label: 'Featured Story',
          type: 'relationship',
          relationTo: 'story',
          required: false,
        },
        {
          name: 'stats',
          label: 'Stats',
          type: 'array',
          fields: [
            {
              name: 'value',
              label: 'Value',
              type: 'text',
              required: false,
            },
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: false,
            },
          ],
        },
        {
          name: 'highlights',
          label: 'Highlights',
          type: 'array',
          fields: [
            {
              name: 'text',
              label: 'Text',
              type: 'text',
              required: false,
            },
          ],
        },
        {
          name: 'readTime',
          label: 'Read Time',
          type: 'text',
          required: false,
          admin: {
            description: 'e.g. "12 min"',
          },
        },
        {
          name: 'categoryLabel',
          label: 'Category Label',
          type: 'text',
          required: false,
          admin: {
            description: 'e.g. "Engineering Studio"',
          },
        },
        {
          name: 'buttonLabel',
          label: 'Button Label',
          type: 'text',
          required: false,
        },
      ],
    },

    {
      name: 'allStoriesGrid',
      label: 'All Stories Grid',
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
          relationTo: ['story', 'insight'],
          hasMany: true,
          required: false,
        },
        {
          name: 'pressRelease',
          label: 'Press Release',
          type: 'relationship',
          relationTo: 'pressRelease',
          hasMany: true,
          required: false,
          admin: {
            description: 'Press releases shown at the bottom of the stories grid.',
          },
        },
      ],
    },

    {
      name: 'categoryLanding',
      label: 'Category Landing',
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
          name: 'categories',
          label: 'Categories',
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
              type: 'textarea',
              required: false,
            },
            {
              name: 'icon',
              label: 'Icon',
              type: 'select',
              required: false,
              options: [
                { label: 'Newspaper', value: 'newspaper' },
                { label: 'Flask conical', value: 'flask-conical' },
                { label: 'Lightbulb', value: 'lightbulb' },
                { label: 'File text', value: 'file-text' },
              ],
              admin: {
                description: 'Lucide icon shown at the top of the category card.',
              },
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
            {
              name: 'linkLabel',
              label: 'Link Label',
              type: 'text',
              required: false,
              admin: {
                description: 'e.g. "Open section"',
              },
            },
          ],
        },
      ],
    },

    {
      name: 'subscribe',
      label: 'Subscribe',
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
          name: 'followHint',
          label: 'Follow Hint',
          type: 'text',
          required: false,
        },
        {
          name: 'followOptions',
          label: 'Follow Options',
          type: 'array',
          fields: [
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: false,
            },
          ],
        },
        {
          name: 'emailPlaceholder',
          label: 'Email Placeholder',
          type: 'text',
          required: false,
        },
        {
          name: 'buttonLabel',
          label: 'Button Label',
          type: 'text',
          required: false,
        },
        {
          name: 'disclaimer',
          label: 'Disclaimer',
          type: 'text',
          required: false,
        },
        {
          name: 'preview',
          label: 'Preview Panel',
          type: 'group',
          fields: [
            {
              name: 'issueLabel',
              label: 'Issue Label',
              type: 'text',
              required: false,
            },
            {
              name: 'heading',
              label: 'Heading',
              type: 'text',
              required: false,
            },
            {
              name: 'items',
              label: 'Items',
              type: 'array',
              fields: [
                {
                  name: 'text',
                  label: 'Text',
                  type: 'text',
                  required: false,
                },
              ],
            },
            {
              name: 'subscribersLabel',
              label: 'Subscribers Label',
              type: 'text',
              required: false,
            },
            {
              name: 'readTimeLabel',
              label: 'Read Time Label',
              type: 'text',
              required: false,
            },
            {
              name: 'backgroundImage',
              label: 'Background Image',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },
          ],
        },
      ],
    },
  ],
}

export default StoriesPage
