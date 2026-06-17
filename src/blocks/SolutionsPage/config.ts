import type { Block } from 'payload'

export const SolutionsPageSection: Block = {
  slug: 'solutionsPageSection',
  interfaceName: 'SolutionsPageBlock',
  labels: { singular: 'Solutions Page', plural: 'Solutions Page' },
  fields: [
    {
      name: 'hero',
      label: 'Hero Section',
      type: 'group',
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
          name: 'backgroundImage',
          label: 'Background Image',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'cards',
          label: 'Cards',
          type: 'array',
          admin: {
            description:
              'Four cards shown over the hero image. The isometric icon for each card is fixed in code by position.',
          },
          fields: [
            {
              name: 'title',
              label: 'Title',
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
      name: 'section_2',
      label: 'Section 2 — Product Engineering',
      type: 'group',
      admin: {
        description: 'Layout: main on left. Decorative isometric graphic is fixed in code.',
      },
      fields: [
        {
          name: 'badge',
          label: 'Badge',
          type: 'text',
          required: false,
        },
        {
          name: 'title',
          label: 'Title',
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
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'trajectory',
          label: 'Trajectory',
          type: 'group',
          fields: [
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: false,
            },
            {
              name: 'steps',
              label: 'Steps',
              type: 'array',
              maxRows: 4,
              fields: [
                {
                  name: 'label',
                  label: 'Label',
                  type: 'text',
                  required: false,
                },
                {
                  name: 'active',
                  label: 'Highlighted',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
        {
          name: 'whoTitle',
          label: "Who It's For — Title",
          type: 'text',
          required: false,
        },
        {
          name: 'whoDescription',
          label: "Who It's For — Description",
          type: 'textarea',
          required: false,
        },
        {
          name: 'shapeTitle',
          label: 'Shape — Title',
          type: 'text',
          required: false,
        },
        {
          name: 'shapeDescription',
          label: 'Shape — Description',
          type: 'textarea',
          required: false,
        },
      ],
    },

    {
      name: 'section_3',
      label: 'Section 3 — Enterprise Transform',
      type: 'group',
      admin: {
        description: 'Layout: main on right. Decorative isometric graphic is fixed in code.',
      },
      fields: [
        {
          name: 'badge',
          label: 'Badge',
          type: 'text',
          required: false,
        },
        {
          name: 'title',
          label: 'Title',
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
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'whoTitle',
          label: "Who It's For — Title",
          type: 'text',
          required: false,
        },
        {
          name: 'whoDescription',
          label: "Who It's For — Description",
          type: 'textarea',
          required: false,
        },
        {
          name: 'shapeTitle',
          label: 'Engagement Shape — Title',
          type: 'text',
          required: false,
        },
        {
          name: 'shapeDescription',
          label: 'Engagement Shape — Description',
          type: 'textarea',
          required: false,
        },
      ],
    },

    {
      name: 'section_4',
      label: 'Section 4 — Engineering Augmentation',
      type: 'group',
      admin: {
        description: 'Layout: main on left. Decorative isometric graphic is fixed in code.',
      },
      fields: [
        {
          name: 'badge',
          label: 'Badge',
          type: 'text',
          required: false,
        },
        {
          name: 'title',
          label: 'Title',
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
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'techStack',
          label: 'Tech Stack',
          type: 'group',
          fields: [
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: false,
            },
            {
              name: 'items',
              label: 'Items',
              type: 'array',
              fields: [
                {
                  name: 'label',
                  label: 'Label',
                  type: 'text',
                  required: false,
                },
                {
                  name: 'highlight',
                  label: 'Highlighted',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
        {
          name: 'whoTitle',
          label: "Who It's For — Title",
          type: 'text',
          required: false,
        },
        {
          name: 'whoDescription',
          label: "Who It's For — Description",
          type: 'textarea',
          required: false,
        },
        {
          name: 'shapeTitle',
          label: 'Shape — Title',
          type: 'text',
          required: false,
        },
        {
          name: 'shapeDescription',
          label: 'Shape — Description',
          type: 'textarea',
          required: false,
        },
      ],
    },

    {
      name: 'section_5',
      label: 'Section 5 — Managed Services',
      type: 'group',
      admin: {
        description: 'Layout: main on right. Decorative isometric graphic is fixed in code.',
      },
      fields: [
        {
          name: 'badge',
          label: 'Badge',
          type: 'text',
          required: false,
        },
        {
          name: 'title',
          label: 'Title',
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
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'incident',
          label: 'Incident Response',
          type: 'group',
          fields: [
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: false,
            },
            {
              name: 'historyLabel',
              label: 'History Label',
              type: 'text',
              required: false,
            },
            {
              name: 'totalCells',
              label: 'Total Cells',
              type: 'number',
              required: false,
              admin: {
                description: 'Number of cells in the history grid.',
              },
            },
            {
              name: 'activeCells',
              label: 'Active Cells',
              type: 'array',
              admin: {
                description: 'Cell positions (1-based) to highlight as incidents.',
              },
              fields: [
                {
                  name: 'position',
                  label: 'Position',
                  type: 'number',
                  required: false,
                },
              ],
            },
          ],
        },
        {
          name: 'whoTitle',
          label: "Who It's For — Title",
          type: 'text',
          required: false,
        },
        {
          name: 'whoDescription',
          label: "Who It's For — Description",
          type: 'textarea',
          required: false,
        },
        {
          name: 'shapeTitle',
          label: 'Shape — Title',
          type: 'text',
          required: false,
        },
        {
          name: 'shapeDescription',
          label: 'Shape — Description',
          type: 'textarea',
          required: false,
        },
      ],
    },

    {
      name: 'engage',
      label: 'How We Engage',
      type: 'group',
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
          name: 'cards',
          label: 'Cards',
          type: 'array',
          admin: {
            description: 'Three engagement models. Card colors are fixed in code by position.',
          },
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'subtitle',
              label: 'Subtitle',
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
      name: 'cta',
      label: 'CTA',
      type: 'group',
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
          name: 'button_1',
          label: 'Button 1',
          type: 'group',
          fields: [
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: false,
            },
            {
              name: 'link',
              label: 'Link',
              type: 'text',
              required: false,
            },
          ],
        },
        {
          name: 'button_2',
          label: 'Button 2',
          type: 'group',
          fields: [
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: false,
            },
            {
              name: 'link',
              label: 'Link',
              type: 'text',
              required: false,
            },
          ],
        },
      ],
    },
  ],
}

export default SolutionsPageSection
