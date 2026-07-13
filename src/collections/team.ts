import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

const Team: CollectionConfig = {
  slug: 'team',
  // Drag-and-drop manual ordering in the admin list view (adds the `_order` field). Frontend
  // reads must `sort: '_order'` to respect it (see app/(frontend)/[locale]/team/page.tsx).
  orderable: true,
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
          revalidateTag(`team_${doc.slug}`, { expire: 0 })
        }
        revalidateTag('team', { expire: 0 })
      },
    ],
    // Deletes must bust the same tags, or list pages / embedding pages keep serving the removed doc.
    afterDelete: [
      ({ doc }) => {
        if (doc?.slug) {
          revalidateTag(`team_${doc.slug}`, { expire: 0 })
        }
        revalidateTag('team', { expire: 0 })
      },
    ],
  },
  admin: {
    group: 'Careers',
    description: 'Team member profiles shown across the site.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'memberId', 'category', 'position', 'updatedAt'],
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
      name: 'memberId',
      label: 'Member ID',
      type: 'text',
      admin: {
        description: 'Ternary-internal ID for this member (from our own records).',
      },
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: [
        { label: 'Leader', value: 'leader' },
        { label: 'General', value: 'general' },
        { label: 'Advisor', value: 'advisor' },
      ],
    },
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
