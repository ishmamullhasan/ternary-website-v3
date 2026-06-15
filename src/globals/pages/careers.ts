import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

const CareersPage: GlobalConfig = {
  slug: 'careersPage',
  label: 'Careers',
  admin: {
    group: 'Pages',
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('careersPage', 'max')
      },
    ],
  },
  fields: [
    {
      type: 'group',
      name: 'hero',
      label: 'Hero',
      required: false,
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
          name: 'image',
          type: 'relationship',
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
              name: 'url',
              label: 'URL',
              type: 'text',
              required: false,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'section_2',
      label: 'Section 2',
      required: false,
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
          name: 'item_1',
          label: 'Item 1',
          type: 'group',
          required: false,
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
              name: 'image',
              label: 'Image',
              type: 'relationship',
              relationTo: 'media',
              required: false,
            },
          ],
        },
        {
          name: 'item_2',
          label: 'Item 2',
          type: 'group',
          required: false,
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
          ],
        },
        {
          name: 'item_3',
          label: 'Item 3',
          type: 'group',
          required: false,
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
          ],
        },
        {
          name: 'item_4',
          label: 'Item 4',
          type: 'group',
          required: false,
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
          ],
        },
        {
          name: 'item_5',
          label: 'Item 5',
          type: 'group',
          required: false,
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
          ],
        },
        {
          name: 'item_6',
          label: 'Item 6',
          type: 'group',
          required: false,
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
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'section_3',
      label: 'Section 3',
      required: false,
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
          name: 'item_1',
          label: 'Item 1',
          type: 'group',
          required: false,
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
              name: 'image',
              label: 'Image',
              type: 'relationship',
              relationTo: 'media',
              required: false,
            },
          ],
        },
        {
          name: 'item_2',
          label: 'Item 2',
          type: 'group',
          required: false,
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
              name: 'image',
              label: 'Image',
              type: 'relationship',
              relationTo: 'media',
              required: false,
            },
          ],
        },
        {
          name: 'item_3',
          label: 'Item 3',
          type: 'group',
          required: false,
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
          ],
        },
        {
          name: 'item_4',
          label: 'Item 4',
          type: 'group',
          required: false,
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
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'section_4',
      label: 'Section 4',
      required: false,
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
          name: 'item_1',
          label: 'Item 1',
          type: 'group',
          required: false,
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
              name: 'levels',
              label: 'Levels',
              type: 'array',
              required: false,
              maxRows: 4,
              fields: [
                {
                  name: 'name',
                  label: 'Name',
                  type: 'text',
                  required: false,
                },
              ],
            },
          ],
        },
        {
          name: 'item_2',
          label: 'Item 2',
          type: 'group',
          required: false,
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
              name: 'image',
              label: 'Image',
              type: 'relationship',
              relationTo: 'media',
              required: false,
            },
          ],
        },
        {
          name: 'item_3',
          label: 'Item 3',
          type: 'group',
          required: false,
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
              name: 'image',
              label: 'Image',
              type: 'relationship',
              relationTo: 'media',
              required: false,
            },
          ],
        },
        {
          name: 'item_4',
          label: 'Item 4',
          type: 'group',
          required: false,
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
              name: 'image',
              label: 'Image',
              type: 'relationship',
              relationTo: 'media',
              required: false,
            },
          ],
        },
        {
          name: 'item_5',
          label: 'Item 5',
          type: 'group',
          required: false,
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
              name: 'image',
              label: 'Image',
              type: 'relationship',
              relationTo: 'media',
              required: false,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'team',
      label: 'Team',
      required: false,
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
          name: 'members',
          label: 'Members',
          type: 'relationship',
          relationTo: 'team',
          hasMany: true,
          required: false,
        },
      ],
    },
    {
      type: 'group',
      name: 'jobs',
      label: 'Jobs',
      required: false,
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
          name: 'list',
          label: 'Jobs',
          type: 'relationship',
          relationTo: 'job',
          hasMany: true,
          required: false,
        },
      ],
    },
  ],
}

export default CareersPage
