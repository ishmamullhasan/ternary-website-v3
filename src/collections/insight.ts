import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

const Insight: CollectionConfig = {
  slug: 'insight',
  labels: {
    singular: 'Insight',
    plural: 'Insights',
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`insight_${doc.slug}`, 'max')
        }
        revalidateTag('insight', 'max')
      },
    ],
  },
  admin: {
    group: 'Newsroom',
    description: 'Thought-leadership articles and insights.',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedDate', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField(),
    {
      name: 'code',
      label: 'Code',
      type: 'text',
      admin: {
        description: 'e.g. CS-014',
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      label: 'Author',
      type: 'relationship',
      relationTo: 'team',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedDate',
      label: 'Published Date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'readTime',
      label: 'Read Time',
      type: 'text',
      localized: true,
      admin: {
        description: 'e.g. "8 min"',
        position: 'sidebar',
      },
    },
    {
      name: 'categoryLabel',
      label: 'Category Label',
      type: 'text',
      localized: true,
      admin: {
        description: 'e.g. "Engineering Studio"',
        position: 'sidebar',
      },
    },
    {
      name: 'excerpts',
      label: 'Excerpt',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Short summary used on listing cards.',
      },
    },
    {
      name: 'thumbnail',
      label: 'Thumbnail',
      type: 'upload',
      relationTo: 'media',
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
          localized: true,
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Lead & Content',
          fields: [
            {
              name: 'leadParagraph',
              label: 'Lead Paragraph',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Opening paragraph shown beside the article body.',
              },
            },
            {
              name: 'content',
              label: 'Content',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          label: 'Related',
          fields: [
            {
              name: 'relatedInsights',
              label: 'Related Insights',
              type: 'group',
              fields: [
                {
                  name: 'heading',
                  label: 'Heading',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'description',
                  label: 'Description',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'insights',
                  label: 'Insights',
                  type: 'relationship',
                  relationTo: 'insight',
                  hasMany: true,
                },
              ],
            },
          ],
        },
        {
          label: 'CTA',
          fields: [
            {
              name: 'cta',
              label: 'CTA',
              type: 'group',
              fields: [
                {
                  name: 'heading',
                  label: 'Heading',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'description',
                  label: 'Description',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'backgroundImage',
                  label: 'Background Image',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'button_1',
                  label: 'Button 1',
                  type: 'group',
                  fields: [
                    {
                      name: 'label',
                      label: 'Label',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'link',
                      label: 'Link',
                      type: 'text',
                    },
                  ],
                },
                {
                  name: 'button_2',
                  label: 'Button 2',
                  type: 'group',
                  fields: [
                    {
                      name: 'label',
                      label: 'Label',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'link',
                      label: 'Link',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default Insight
