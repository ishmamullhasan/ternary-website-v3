import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

const Capability: CollectionConfig = {
  slug: 'capability',
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`capability_${doc.slug}`, 'max')
        }
        revalidateTag('capability', 'max')
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      localized: true,
    },
    slugField(),
    {
      name: 'excerpts',
      label: 'Excerpts',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'thumbnail',
      label: 'Thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'heroSection',
              label: 'Hero Section',
              type: 'group',
              fields: [
                {
                  name: 'badge',
                  label: 'Badge',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Pill label shown above the heading (e.g. Digital Experiences).',
                  },
                },
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
                  name: 'heroImage',
                  label: 'Hero Image',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'button',
                  label: 'Button',
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
        {
          label: 'What This Means To Us',
          fields: [
            {
              name: 'whatThisMeansToUs',
              label: 'What This Means To Us',
              type: 'group',
              fields: [
                {
                  name: 'sectionLabel',
                  label: 'Section Label',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'e.g. Section 01',
                  },
                },
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
                  name: 'items',
                  label: 'Items',
                  type: 'array',
                  fields: [
                    {
                      name: 'title',
                      label: 'Title',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'excerpt',
                      label: 'Excerpt',
                      type: 'textarea',
                      localized: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'How We Do It',
          fields: [
            {
              name: 'howWeDoIt',
              label: 'How We Do It',
              type: 'group',
              fields: [
                {
                  name: 'sectionLabel',
                  label: 'Section Label',
                  type: 'text',
                  localized: true,
                },
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
                  name: 'items',
                  label: 'Practice Items',
                  type: 'array',
                  fields: [
                    {
                      name: 'title',
                      label: 'Title',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'excerpt',
                      label: 'Excerpt',
                      type: 'textarea',
                      localized: true,
                    },
                    {
                      name: 'stack',
                      label: 'Stack Tags',
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
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Case Studies',
          fields: [
            {
              name: 'caseStudies',
              label: 'Case Studies',
              type: 'group',
              fields: [
                {
                  name: 'sectionLabel',
                  label: 'Section Label',
                  type: 'text',
                  localized: true,
                },
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
                  name: 'items',
                  label: 'Case Study Items',
                  type: 'array',
                  fields: [
                    {
                      name: 'meta',
                      label: 'Meta',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'e.g. 2025 · Insurance',
                      },
                    },
                    {
                      name: 'title',
                      label: 'Title',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'problem',
                      label: 'Problem',
                      type: 'textarea',
                      localized: true,
                    },
                    {
                      name: 'approach',
                      label: 'Approach',
                      type: 'textarea',
                      localized: true,
                    },
                    {
                      name: 'outcome',
                      label: 'Outcome',
                      type: 'textarea',
                      localized: true,
                    },
                    {
                      name: 'metricValue',
                      label: 'Metric Value',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'e.g. 4h',
                      },
                    },
                    {
                      name: 'metricLabel',
                      label: 'Metric Label',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'e.g. from 6 days',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Practice Lead',
          fields: [
            {
              name: 'practiceLead',
              label: 'Practice Lead',
              type: 'group',
              fields: [
                {
                  name: 'sectionLabel',
                  label: 'Section Label',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'member',
                  label: 'Team Member',
                  type: 'relationship',
                  relationTo: 'team',
                },
                {
                  name: 'bio',
                  label: 'Bio',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'credentials',
                  label: 'Credentials',
                  type: 'array',
                  fields: [
                    {
                      name: 'text',
                      label: 'Text',
                      type: 'text',
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'writings',
                  label: 'Recent Writing & Talks',
                  type: 'array',
                  fields: [
                    {
                      name: 'title',
                      label: 'Title',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'category',
                      label: 'Category',
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
                  name: 'email',
                  label: 'Email',
                  type: 'text',
                },
                {
                  name: 'github',
                  label: 'GitHub URL',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Related & CTA',
          fields: [
            {
              name: 'relatedCapabilities',
              label: 'Related Capabilities',
              type: 'group',
              fields: [
                {
                  name: 'sectionLabel',
                  label: 'Section Label',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'heading',
                  label: 'Heading',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'capabilities',
                  label: 'Capabilities',
                  type: 'relationship',
                  relationTo: 'capability',
                  hasMany: true,
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
                  type: 'text' as const,
                  required: false,
                  localized: true,
                },
                {
                  name: 'description',
                  label: 'Description',
                  type: 'textarea' as const,
                  required: false,
                  localized: true,
                },
                {
                  name: 'backgroundImage',
                  label: 'Background Image',
                  type: 'upload' as const,
                  relationTo: 'media' as const,
                  required: false,
                },
                {
                  name: 'button_1',
                  label: 'Button 1',
                  type: 'group' as const,
                  required: false,
                  fields: [
                    {
                      name: 'label',
                      label: 'Label',
                      type: 'text' as const,
                      required: false,
                      localized: true,
                    },
                    {
                      name: 'link',
                      label: 'Link',
                      type: 'text' as const,
                      required: false,
                    },
                  ],
                },
                {
                  name: 'button_2',
                  label: 'Button 2',
                  type: 'group' as const,
                  required: false,
                  fields: [
                    {
                      name: 'label',
                      label: 'Label',
                      type: 'text' as const,
                      required: false,
                      localized: true,
                    },
                    {
                      name: 'link',
                      label: 'Link',
                      type: 'text' as const,
                      required: false,
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

export default Capability
