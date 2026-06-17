import type { Block } from 'payload'

import { imageField } from '@/fields/image'
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
      label: 'Items',
      type: 'relationship',
      relationTo: ['capability', 'solution', 'industry', 'scale', 'model'],
      hasMany: true,
    },
    {
      name: 'organizations',
      label: 'Organizations',
      type: 'group',
      fields: [
        { name: 'heading', label: 'Heading', type: 'text' },
        {
          name: 'organization',
          label: 'Organization',
          type: 'array',
          fields: [
            imageField({ name: 'icon', label: 'Icon' }),
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'link', label: 'Link', type: 'text' },
          ],
        },
      ],
    },
    { name: 'bottomDescription', label: 'Bottom Description', type: 'textarea' },
  ],
}

export const SolutionsSection: Block = {
  slug: 'solutionsSection',
  interfaceName: 'SolutionsSectionBlock',
  labels: { singular: 'Solutions Section', plural: 'Solutions Sections' },
  fields: [
    ...sectionHeader(),
    imageField({ name: 'image' }),
    { name: 'items', label: 'Solutions', type: 'relationship', relationTo: 'solution', hasMany: true },
  ],
}

export const CapabilitiesSection: Block = {
  slug: 'capabilitiesSection',
  interfaceName: 'CapabilitiesSectionBlock',
  labels: { singular: 'Capabilities Section', plural: 'Capabilities Sections' },
  fields: [
    ...sectionHeader(),
    { name: 'capability', label: 'Capabilities', type: 'relationship', relationTo: 'capability', hasMany: true },
    { name: 'heading_2', label: 'Heading 2', type: 'text' },
    { name: 'description_2', label: 'Description 2', type: 'textarea' },
    imageField({ name: 'image' }),
  ],
}

export const ScalesSection: Block = {
  slug: 'scalesSection',
  interfaceName: 'ScalesSectionBlock',
  labels: { singular: 'Scales Section', plural: 'Scales Sections' },
  fields: [
    ...sectionHeader(),
    { name: 'scales', label: 'Scales', type: 'relationship', relationTo: 'scale', hasMany: true },
  ],
}

export const EngagementSection: Block = {
  slug: 'engagementSection',
  interfaceName: 'EngagementSectionBlock',
  labels: { singular: 'Engagement Section', plural: 'Engagement Sections' },
  fields: [
    ...sectionHeader(),
    { name: 'model', label: 'Models', type: 'relationship', relationTo: 'model', hasMany: true },
  ],
}

export const GlobalDeliverySection: Block = {
  slug: 'globalDeliverySection',
  interfaceName: 'GlobalDeliverySectionBlock',
  labels: { singular: 'Global Delivery Section', plural: 'Global Delivery Sections' },
  fields: [
    ...sectionHeader(),
    imageField({ name: 'image' }),
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
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
      label: 'Process',
      type: 'array',
      fields: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'description', label: 'Description', type: 'richText' },
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
    { name: 'members', label: 'Members', type: 'relationship', relationTo: 'team', hasMany: true },
  ],
}

export const OpportunitiesSection: Block = {
  slug: 'opportunitiesSection',
  interfaceName: 'OpportunitiesSectionBlock',
  labels: { singular: 'Opportunities Section', plural: 'Opportunities Sections' },
  fields: [
    ...sectionHeader(),
    { name: 'opportunity', label: 'Opportunities', type: 'relationship', relationTo: 'job', hasMany: true },
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
