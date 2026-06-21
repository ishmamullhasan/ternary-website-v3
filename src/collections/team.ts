import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

const Team: CollectionConfig = {
  slug: 'team',
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
      localized: true,
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'position',
      label: 'Position',
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
      name: 'description',
      label: 'Description',
      type: 'richText',
      localized: true,
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
    {
      name: 'x',
      label: 'X / Twitter URL',
      type: 'text',
    },
    {
      name: 'github',
      label: 'GitHub URL',
      type: 'text',
    },
    {
      name: 'website',
      label: 'Website URL',
      type: 'text',
    },
  ],
}

export default Team
