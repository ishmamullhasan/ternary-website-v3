import { landingPreviewURL } from '@/utilities/livePreview'
import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

const Scale: CollectionConfig = {
  slug: 'scale',
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
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
    // Scale tiers have no per-slug detail route; they render via the ScaleShowcase block on the
    // /scales landing page. Live preview routes through /next/preview so draft mode is on (WEB-449).
    livePreview: {
      url: ({ data }) => landingPreviewURL('scale', '/scales', data),
    },
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
      type: 'richText',
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
