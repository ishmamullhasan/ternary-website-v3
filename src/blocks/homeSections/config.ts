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
    ...sectionHeader(),
    {
      name: 'items',
      label: 'Highlighted Items',
      type: 'relationship',
      relationTo: ['capability', 'solution', 'industry', 'scale', 'model', 'insight', 'story', 'pressRelease'],
      hasMany: true,
      admin: {
        description:
          'Mixed list of records (capabilities, solutions, industries, scales, models, insights, stories or press releases) featured in the About section. Order here is the display order.',
      },
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
          admin: {
            ...rowLabelAdmin,
            description: 'Each entry is one organization logo with its name and an optional outbound link.',
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
      type: 'textarea',
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
      name: 'heading_2',
      label: 'Secondary Heading',
      type: 'text',
      localized: true,
      admin: {
        description: 'Heading for the secondary content block beside the capabilities list.',
      },
    },
    {
      name: 'description_2',
      label: 'Secondary Description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Body copy for the secondary content block.',
      },
    },
    imageField({ name: 'image' }),
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
