import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

const Team: CollectionConfig = {
  slug: 'team',
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`team_${doc.slug}`, 'max')
        }
        revalidateTag('team', 'max')
      },
    ],
  },
  admin: {
    group: 'Careers',
    description: 'Team member profiles shown across the site.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'position',
      label: 'Position',
      type: 'text',
    },
    {
      name: 'excerpt',
      label: 'Excerpt',
      type: 'textarea',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
    },
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'linkedin',
      label: 'LinkedIn URL',
      type: 'text',
    },
  ],
}

export default Team
