import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

const PressRelease: CollectionConfig = {
  slug: 'pressRelease',
  labels: {
    singular: 'Press Release',
    plural: 'Press Releases',
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`pressRelease_${doc.slug}`, 'max')
        }
        revalidateTag('pressRelease', 'max')
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'code', 'releaseDate', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      label: 'Headline',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'badge',
      label: 'Badge',
      type: 'text',
      admin: {
        description: 'Pill label shown above the headline (e.g. Product Launch).',
      },
    },
    {
      name: 'code',
      label: 'Release ID',
      type: 'text',
      admin: {
        description: 'e.g. PR-026',
        position: 'sidebar',
      },
    },
    {
      name: 'releaseDate',
      label: 'Release Date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'datelineLocation',
      label: 'Dateline Location',
      type: 'text',
      admin: {
        description: 'e.g. Dhaka, Bangladesh',
      },
    },
    {
      name: 'excerpts',
      label: 'Excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary used on listing cards.',
      },
    },
    {
      name: 'readTime',
      label: 'Read Time',
      type: 'text',
      admin: {
        description: 'e.g. "12 min"',
        position: 'sidebar',
      },
    },
    {
      name: 'categoryLabel',
      label: 'Category Label',
      type: 'text',
      admin: {
        description: 'e.g. "Engineering Studio"',
        position: 'sidebar',
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
              admin: {
                description: 'Opening paragraphs shown in The release section. Separate paragraphs with a blank line.',
              },
            },
            {
              name: 'content',
              label: 'Content',
              type: 'richText',
            },
            {
              name: 'quotes',
              label: 'Quotes',
              type: 'array',
              fields: [
                {
                  name: 'quote',
                  label: 'Quote',
                  type: 'textarea',
                },
                {
                  name: 'name',
                  label: 'Name',
                  type: 'text',
                },
                {
                  name: 'role',
                  label: 'Role',
                  type: 'text',
                  admin: {
                    description: 'e.g. Chief Revenue Officer · Counterfoil',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Release Facts',
          fields: [
            {
              name: 'releaseFacts',
              label: 'Release Facts',
              type: 'group',
              fields: [
                {
                  name: 'forImmediateRelease',
                  label: 'For Immediate Release',
                  type: 'text',
                  admin: {
                    description: 'e.g. Yes',
                  },
                },
                {
                  name: 'embargo',
                  label: 'Embargo',
                  type: 'text',
                  admin: {
                    description: 'e.g. None',
                  },
                },
                {
                  name: 'distribution',
                  label: 'Distribution',
                  type: 'text',
                  admin: {
                    description: 'e.g. Global',
                  },
                },
                {
                  name: 'mediaKit',
                  label: 'Media Kit',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'mediaKitSizeLabel',
                  label: 'Media Kit Size Label',
                  type: 'text',
                  admin: {
                    description: 'e.g. 24 MB',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Press & Analyst Contact',
          fields: [
            {
              name: 'pressContact',
              label: 'Press & Analyst Contact',
              type: 'group',
              fields: [
                {
                  name: 'heading',
                  label: 'Heading',
                  type: 'text',
                },
                {
                  name: 'description',
                  label: 'Description',
                  type: 'textarea',
                },
                {
                  name: 'press',
                  label: 'Press Inquiries',
                  type: 'group',
                  fields: [
                    {
                      name: 'name',
                      label: 'Name',
                      type: 'text',
                    },
                    {
                      name: 'title',
                      label: 'Title',
                      type: 'text',
                    },
                    {
                      name: 'email',
                      label: 'Email',
                      type: 'text',
                    },
                    {
                      name: 'phone',
                      label: 'Phone',
                      type: 'text',
                    },
                  ],
                },
                {
                  name: 'analyst',
                  label: 'Analyst Relations',
                  type: 'group',
                  fields: [
                    {
                      name: 'name',
                      label: 'Name',
                      type: 'text',
                    },
                    {
                      name: 'title',
                      label: 'Title',
                      type: 'text',
                    },
                    {
                      name: 'email',
                      label: 'Email',
                      type: 'text',
                    },
                    {
                      name: 'website',
                      label: 'Website',
                      type: 'text',
                    },
                  ],
                },
                {
                  name: 'mediaKitDescription',
                  label: 'Media Kit Description',
                  type: 'text',
                  admin: {
                    description: 'e.g. Logos, executive headshots, product screenshots, brand guidelines',
                  },
                },
                {
                  name: 'socialLinks',
                  label: 'Social Links',
                  type: 'group',
                  fields: [
                    {
                      name: 'twitter',
                      label: 'Twitter / X',
                      type: 'text',
                    },
                    {
                      name: 'linkedin',
                      label: 'LinkedIn',
                      type: 'text',
                    },
                    {
                      name: 'website',
                      label: 'Website',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Related',
          fields: [
            {
              name: 'relatedPressReleases',
              label: 'Related Press Releases',
              type: 'group',
              fields: [
                {
                  name: 'heading',
                  label: 'Heading',
                  type: 'text',
                },
                {
                  name: 'description',
                  label: 'Description',
                  type: 'textarea',
                },
                {
                  name: 'pressReleases',
                  label: 'Press Releases',
                  type: 'relationship',
                  relationTo: 'pressRelease',
                  hasMany: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default PressRelease
