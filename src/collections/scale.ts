import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

const Scale: CollectionConfig = {
  slug: 'scale',
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`scale_${doc.slug}`, 'max')
        }
        revalidateTag('scale', 'max')
      },
    ],
  },
  admin: {
    group: 'Content',
    description: 'Engagement scale tiers and their showcase content.',
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
      name: 'subTitle',
      label: 'Sub Title',
      type: 'text',
      localized: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      localized: true,
    },
    {
      name: 'tags',
      type: 'text',
      localized: true,
    },

    {
      name: 'image',
      label: 'Scale Image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'podSize',
      type: 'array',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          localized: true,
        },
        {
          name: 'value',
          label: 'Value',
          type: 'text',
          localized: true,
        },
      ],
    },
  ],
}

export default Scale
