import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

const Legal: CollectionConfig = {
  slug: 'legal',
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`legal_${doc.slug}`, 'max')
        }
        revalidateTag('legal', 'max')
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    slugField(),

    {
      name: 'code',
      label: 'Code',
      type: 'text',
    },
    {
      name: 'lastupdated',
      label: 'Last Updated',
      type: 'text',
      required: false,
    },
    {
      name: 'downloadLink',
      label: 'Download Link',
      type: 'text',
      required: false,
    },
    {
      name: 'legalMenu',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'description', type: 'text' },

        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: false,
        },
        {
          name: 'menuItems',
          type: 'array',
          required: false,
          fields: [
            {
              name: 'label',
              type: 'text',
              admin: {
                description: 'Optional. Falls back to the linked legal page title.',
              },
            },
            {
              name: 'icon',
              label: 'Icon',
              type: 'select',
              required: false,
              options: [
                { label: 'Shield', value: 'shield' },
                { label: 'File text', value: 'file-text' },
                { label: 'Scale', value: 'scale' },
              ],
              admin: {
                description: 'Lucide icon shown beside the menu label.',
              },
            },
            {
              name: 'page',
              label: 'Legal page',
              type: 'relationship',
              relationTo: 'legal',
              required: true,
            },
          ],
        },

        {
          name: 'noticeTitle',
          label: 'Notice Title',
          type: 'text',
          required: false,
        },
        {
          name: 'noticeDescription',
          label: 'Notice Description',
          type: 'text',
          required: false,
        },
      ],
    },

    {
      name: 'content',
      label: 'Page Content',
      type: 'richText',
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
          name: 'button',
          label: 'Button',
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

export default Legal
