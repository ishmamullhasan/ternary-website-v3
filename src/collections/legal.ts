import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

import { ctaGroup } from '@/fields/ctaGroup'

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
    group: 'Legal',
    description: 'Legal documents shown in the Legal Center.',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'code', 'updatedAt'],
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
      name: 'menuLabel',
      label: 'Menu label',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional. Falls back to the page title in the Legal Center sidebar.',
      },
    },
    {
      name: 'menuIcon',
      label: 'Menu icon',
      type: 'select',
      required: false,
      options: [
        { label: 'Shield', value: 'shield' },
        { label: 'File text', value: 'file-text' },
        { label: 'Scale', value: 'scale' },
      ],
      admin: {
        description: 'Optional icon shown beside this page in the Legal Center sidebar.',
      },
    },
    {
      name: 'menuOrder',
      label: 'Menu order',
      type: 'number',
      required: false,
      admin: {
        description: 'Lower numbers appear first in the sidebar. Leave empty to sort by title.',
      },
    },
    {
      name: 'content',
      label: 'Page Content',
      type: 'richText',
    },
    ctaGroup(),
  ],
}

export default Legal
