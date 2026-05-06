import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

const About: GlobalConfig = {
  slug: 'about',
  label: 'About',
  admin: {
    group: 'Pages',
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_about', 'max')
      },
    ],
  },
  fields: [
    {
      name: 'heroSection',
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
      ],
    },
    {
      name: 'fundingStory',
      label: 'Funding Story',
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
      ],
    },
    {
      name: 'about',
      label: 'About',
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
          name: 'paragraph',
          label: 'Paragraph',
          type: 'textarea',
          required: false,
        },
      ],
    },
    {
      name: 'ourThesis',
      label: 'Our Thesis',
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
          name: 'items',
          label: 'Items',
          type: 'array',
          required: false,
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'excerpt',
              label: 'Excerpt',
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
          ],
        },
      ],
    },

    {
      name: 'whatWeBelieve',
      label: 'What We Believe',
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
          name: 'items',
          label: 'Items',
          type: 'array',
          required: false,
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'excerpt',
              label: 'Excerpt',
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
          ],
        },
      ],
    },

    {
      name: 'ourApproach',
      label: 'Our Approach',
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
          name: 'items',
          label: 'Items',
          type: 'array',
          required: false,
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: false,
            },
            {
              name: 'excerpt',
              label: 'Excerpt',
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
          ],
        },
      ],
    },

    {
      name: 'proofOfScale',
      label: 'Proof of Scale',
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
          name: 'items',
          label: 'Items',
          type: 'array',
          required: false,
          fields: [
            {
              name: 'title',
              label: 'Lable',
              type: 'text',
              required: false,
            },
            {
              name: 'value',
              label: 'Value',
              type: 'text',
              required: false,
            },
          ],
        },

        {
          name: 'company',
          label: 'Companies We Works With',
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
              name: 'items',
              label: 'Items',
              type: 'array',
              required: false,
              fields: [
                {
                  name: 'name',
                  label: 'Name',
                  type: 'text',
                  required: false,
                },
                {
                  name: 'excerpt',
                  label: 'Excerpt',
                  type: 'text',
                  required: false,
                },
                {
                  name: 'stack',
                  label: 'Stack',
                  type: 'array',
                  required: false,
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
          ],
        },
      ],
    },
    {
      name: 'leadership',
      label: 'Leadership',
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
          name: 'members',
          label: 'Members',
          type: 'array',
          required: false,
          fields: [
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: false,
            },
            {
              name: 'position',
              label: 'Position',
              type: 'text',
              required: false,
            },
            {
              name: 'story',
              label: 'Story',
              type: 'textarea',
              required: false,
            },
            {
              name: 'specialization',
              label: 'Specialization',
              type: 'text',
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
              name: 'socials',
              label: 'Socials',
              type: 'array',
              required: false,
              fields: [
                {
                  name: 'linkedin',
                  label: 'LinkedIn',
                  type: 'text',
                  required: false,
                },
                {
                  name: 'facebook',
                  label: 'Facebook',
                  type: 'text',
                  required: false,
                },
                {
                  name: 'instagram',
                  label: 'Instagram',
                  type: 'text',
                  required: false,
                },
                {
                  name: 'twitter',
                  label: 'Twitter',
                  type: 'text',
                  required: false,
                },
              ],
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
          name: 'subheading',
          label: 'Subheading',
          type: 'text',
          required: false,
        },
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
          name: 'button_1',
          label: 'Button 1',
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
          required: false,
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

export default About
