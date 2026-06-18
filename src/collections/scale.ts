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
    },
    slugField(),
    {
      name: 'excerpts',
      label: 'Excerpts',
      type: 'textarea',
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
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'tags',
      type: 'text',
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
        },
        {
          name: 'value',
          label: 'Value',
          type: 'text',
        },
      ],
    },
  ],
}

export default Scale
