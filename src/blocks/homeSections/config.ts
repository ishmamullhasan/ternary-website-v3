import type { Block } from 'payload'

import { imageField } from '@/fields/image'
import { rowLabelAdmin } from '@/fields/rowLabel'
import { sectionHeader } from '@/fields/sectionHeader'

// Design-faithful blocks: each renders an existing hand-built homepage section component.
// The config captures the same content the component consumes.

export const AboutSection: Block = {
  slug: 'aboutSection',
  interfaceName: 'AboutSectionBlock',
  labels: { singular: 'About Section', plural: 'About Sections' },
  fields: [
    {
      name: 'content',
      label: 'Heading & Description',
      type: 'richText',
      localized: true,
      admin: {
        description:
          'Section intro rendered above the bento grid. Use a Heading (H2/H3) for the title line(s) and normal paragraphs for the supporting copy — headings get the display style, paragraphs the body style.',
      },
    },
    {
      name: 'items',
      label: 'Bento Cards',
      type: 'array',
      admin: {
        description:
          'Cards in the bento grid, in display order. The grid is 4 columns on desktop, 2 on tablet, 1 on mobile; cards pack densely, so mix sizes freely — smaller cards flow into the gaps left by larger ones.',
      },
      fields: [
        {
          name: 'item',
          label: 'Item',
          type: 'relationship',
          relationTo: ['capability', 'solution', 'industry', 'scale', 'model', 'story', 'insight', 'pressRelease'],
          required: true,
          admin: {
            description:
              'The record (capability, solution, industry, scale, model, story, insight or press release) this card features. The card shows its content-type label and links to it.',
          },
        },
        {
          name: 'size',
          label: 'Card Size',
          type: 'select',
          defaultValue: 'standard',
          options: [
            { label: 'Standard (1×1)', value: 'standard' },
            { label: 'Wide (2 columns)', value: 'wide' },
            { label: 'Tall (2 rows)', value: 'tall' },
            { label: 'Large (2×2)', value: 'large' },
          ],
          admin: {
            description:
              'Footprint in the bento grid. Wide/Large span 2 columns (from tablet up); Tall/Large span 2 rows.',
          },
        },
      ],
    },
    {
      name: 'organizations',
      label: 'Organizations',
      type: 'group',
      admin: {
        description: 'Logo wall of partner / member organizations shown within the About section.',
      },
      fields: [
        { name: 'heading', label: 'Heading', type: 'text', localized: true },
        {
          name: 'organization',
          label: 'Organizations',
          type: 'array',
          maxRows: 16,
          admin: {
            ...rowLabelAdmin,
            description:
              'Logo wall — only the icon is shown on the site (up to 8 per row, 2 rows). Max 16 entries. Name is used for the admin row label / alt text.',
          },
          fields: [
            imageField({ name: 'icon', label: 'Icon' }),
            { name: 'name', label: 'Name', type: 'text', localized: true, admin: { width: '50%' } },
            {
              name: 'link',
              label: 'Link',
              type: 'text',
              admin: {
                width: '50%',
                description: 'Optional URL the logo links to.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'bottomDescription',
      label: 'Bottom Description',
      type: 'richText',
      localized: true,
      admin: {
        description: 'Closing copy rendered below the organizations logo wall.',
      },
    },
  ],
}

export const SolutionsSection: Block = {
  slug: 'solutionsSection',
  interfaceName: 'SolutionsSectionBlock',
  labels: { singular: 'Solutions Section', plural: 'Solutions Sections' },
  fields: [
    ...sectionHeader(),
    imageField({ name: 'image' }),
    {
      name: 'items',
      label: 'Solutions',
      type: 'relationship',
      relationTo: 'solution',
      hasMany: true,
      admin: {
        description: 'Solutions to feature in this section, in display order.',
      },
    },
  ],
}

export const CapabilitiesSection: Block = {
  slug: 'capabilitiesSection',
  interfaceName: 'CapabilitiesSectionBlock',
  labels: { singular: 'Capabilities Section', plural: 'Capabilities Sections' },
  fields: [
    ...sectionHeader(),
    {
      name: 'capability',
      label: 'Capabilities',
      type: 'relationship',
      relationTo: 'capability',
      hasMany: true,
      admin: {
        description: 'Capabilities to feature in this section, in display order.',
      },
    },
    {
      name: 'slides',
      label: 'Intro Media Slides',
      type: 'array',
      admin: {
        description:
          'Media slides for the secondary intro carousel (shown on all screens). Add two or more to enable the slider; a single slide renders as a static panel.',
      },
      fields: [imageField({ name: 'image', required: true })],
    },
  ],
}

export const ScalesSection: Block = {
  slug: 'scalesSection',
  interfaceName: 'ScalesSectionBlock',
  labels: { singular: 'Scales Section', plural: 'Scales Sections' },
  fields: [
    ...sectionHeader(),
    {
      name: 'scales',
      label: 'Scales',
      type: 'relationship',
      relationTo: 'scale',
      hasMany: true,
      admin: {
        description: 'Scale records to feature in this section, in display order.',
      },
    },
  ],
}

export const EngagementSection: Block = {
  slug: 'engagementSection',
  interfaceName: 'EngagementSectionBlock',
  labels: { singular: 'Engagement Section', plural: 'Engagement Sections' },
  fields: [
    ...sectionHeader(),
    {
      name: 'model',
      label: 'Engagement Models',
      type: 'relationship',
      relationTo: 'model',
      hasMany: true,
      admin: {
        description: 'Engagement model records to feature in this section, in display order.',
      },
    },
  ],
}

export const GlobalDeliverySection: Block = {
  slug: 'globalDeliverySection',
  interfaceName: 'GlobalDeliverySectionBlock',
  labels: { singular: 'Global Delivery Section', plural: 'Global Delivery Sections' },
  fields: [
    ...sectionHeader(),
    imageField({ name: 'image' }),
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      localized: true,
      admin: {
        description: 'Title rendered alongside the image in the global delivery callout.',
      },
    },
    {
      name: 'excerpt',
      label: 'Excerpt',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Short supporting copy shown under the title.',
      },
    },
  ],
}

export const ProcessSection: Block = {
  slug: 'processSection',
  interfaceName: 'ProcessSectionBlock',
  labels: { singular: 'Process Section', plural: 'Process Sections' },
  fields: [
    ...sectionHeader(),
    {
      name: 'process',
      label: 'Process Steps',
      type: 'array',
      admin: {
        ...rowLabelAdmin,
        description: 'Ordered list of process steps. Each row is one step with a title and rich-text description.',
      },
      fields: [
        {
          name: 'number',
          label: 'Step Number',
          type: 'text',
          localized: true,
          admin: {
            width: '20%',
            description:
              'Editorial step number shown above the title, e.g. 03 — may repeat/skip; falls back to the row index when empty.',
          },
        },
        { name: 'title', label: 'Title', type: 'text', localized: true },
        { name: 'description', label: 'Description', type: 'richText', localized: true },
      ],
    },
  ],
}

export const TeamSection: Block = {
  slug: 'teamSection',
  interfaceName: 'TeamSectionBlock',
  labels: { singular: 'Team Section', plural: 'Team Sections' },
  fields: [
    ...sectionHeader(),
    {
      name: 'members',
      label: 'Team Members',
      type: 'relationship',
      relationTo: 'team',
      hasMany: true,
      admin: {
        description: 'Team member records to feature in this section, in display order.',
      },
    },
  ],
}

export const OpportunitiesSection: Block = {
  slug: 'opportunitiesSection',
  interfaceName: 'OpportunitiesSectionBlock',
  labels: { singular: 'Opportunities Section', plural: 'Opportunities Sections' },
  fields: [
    ...sectionHeader(),
    // Roles are pulled LIVE from the recruiting system (getJobs → GET /jobs, newest first) — they are
    // NOT hand-picked from the CMS `job` collection. Editors control the heading/description and,
    // optionally, how many of the open roles to feature here.
    {
      name: 'limit',
      label: 'Max roles to show',
      type: 'number',
      min: 1,
      admin: {
        description:
          'How many open roles to feature, newest first. Leave blank to show every open role from the recruiting system.',
      },
    },
  ],
}

export const homeSectionBlocks = [
  AboutSection,
  SolutionsSection,
  CapabilitiesSection,
  ScalesSection,
  EngagementSection,
  GlobalDeliverySection,
  ProcessSection,
  TeamSection,
  OpportunitiesSection,
]
