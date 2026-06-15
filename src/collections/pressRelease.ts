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
      admin: {
        description: 'e.g. CS-014',
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
      name: 'content',
      label: 'Content',
      type: 'richText',
    },
  ],
}

export default PressRelease
