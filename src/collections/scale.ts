import { landingPreviewURL } from '@/utilities/livePreview'
import { revalidateTag } from 'next/cache'
import { CollectionConfig, slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { rowLabelAdmin } from '@/fields/rowLabel'

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
    // Deletes must bust the same tags, or list pages / embedding pages keep serving the removed doc.
    afterDelete: [
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
    {
      name: 'panelType',
      type: 'select',
      defaultValue: 'generic',
      options: [
        { label: 'Generic (current)', value: 'generic' },
        { label: 'Sprint log', value: 'sprint' },
        { label: 'Program roadmap', value: 'roadmap' },
        { label: 'Procurement path', value: 'procurement' },
      ],
      admin: {
        description: 'Which bespoke data panel this tier renders.',
      },
    },
    {
      name: 'sprintMeta',
      type: 'group',
      admin: {
        condition: (data) => data?.panelType === 'sprint',
      },
      fields: [
        {
          name: 'statusLabel',
          type: 'text',
          localized: true,
          admin: {
            description: 'e.g. Live sprint day 23',
          },
        },
        {
          name: 'cadenceLabel',
          type: 'text',
          localized: true,
          admin: {
            description: 'e.g. cycle 1.8d lead 6h',
          },
        },
      ],
    },
    {
      name: 'showUp',
      type: 'array',
      admin: {
        ...rowLabelAdmin,
        condition: (data) => data?.panelType === 'sprint',
        description: 'How we show up numbered list',
      },
      fields: [
        {
          name: 'number',
          type: 'text',
          admin: {
            width: '20%',
          },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            width: '40%',
          },
        },
        {
          name: 'subtext',
          type: 'text',
          localized: true,
          admin: {
            width: '40%',
          },
        },
      ],
    },
    {
      name: 'sprintLog',
      type: 'array',
      admin: {
        ...rowLabelAdmin,
        condition: (data) => data?.panelType === 'sprint',
      },
      fields: [
        {
          name: 'day',
          type: 'text',
          admin: {
            width: '25%',
            description: 'e.g. D23',
          },
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
          admin: {
            width: '45%',
          },
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'queued',
          options: [
            { label: 'Shipped', value: 'shipped' },
            { label: 'In review', value: 'in-review' },
            { label: 'In build', value: 'in-build' },
            { label: 'Queued', value: 'queued' },
          ],
          admin: {
            width: '30%',
          },
        },
      ],
    },
    {
      name: 'roadmapMeta',
      type: 'group',
      admin: {
        condition: (data) => data?.panelType === 'roadmap',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          admin: {
            description: 'e.g. Program roadmap',
          },
        },
        {
          name: 'span',
          type: 'text',
          localized: true,
          admin: {
            description: 'e.g. 4 quarters FY2026',
          },
        },
      ],
    },
    {
      name: 'roadmap',
      type: 'array',
      admin: {
        ...rowLabelAdmin,
        condition: (data) => data?.panelType === 'roadmap',
      },
      fields: [
        {
          name: 'phase',
          type: 'text',
          localized: true,
          admin: {
            width: '40%',
          },
        },
        {
          name: 'startQuarter',
          type: 'select',
          options: [
            { label: 'Q1', value: 'Q1' },
            { label: 'Q2', value: 'Q2' },
            { label: 'Q3', value: 'Q3' },
            { label: 'Q4', value: 'Q4' },
          ],
          admin: {
            width: '20%',
          },
        },
        {
          name: 'endQuarter',
          type: 'select',
          options: [
            { label: 'Q1', value: 'Q1' },
            { label: 'Q2', value: 'Q2' },
            { label: 'Q3', value: 'Q3' },
            { label: 'Q4', value: 'Q4' },
          ],
          admin: {
            width: '20%',
          },
        },
        {
          name: 'progress',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            width: '20%',
          },
        },
      ],
    },
    {
      name: 'footnotes',
      type: 'array',
      admin: {
        ...rowLabelAdmin,
        condition: (data) => data?.panelType === 'roadmap',
      },
      fields: [
        {
          name: 'number',
          type: 'text',
          admin: {
            width: '20%',
          },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            width: '40%',
          },
        },
        {
          name: 'subtext',
          type: 'text',
          localized: true,
          admin: {
            width: '40%',
          },
        },
      ],
    },
    {
      name: 'capability',
      type: 'array',
      admin: {
        ...rowLabelAdmin,
        condition: (data) => data?.panelType === 'procurement',
      },
      fields: [
        {
          name: 'term',
          type: 'text',
          localized: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'value',
          type: 'text',
          localized: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'procurementPath',
      type: 'array',
      admin: {
        ...rowLabelAdmin,
        condition: (data) => data?.panelType === 'procurement',
      },
      fields: [
        {
          name: 'number',
          type: 'text',
          admin: {
            width: '20%',
          },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            width: '40%',
          },
        },
        {
          name: 'subtext',
          type: 'text',
          localized: true,
          admin: {
            width: '40%',
          },
        },
      ],
    },
  ],
}

export default Scale
