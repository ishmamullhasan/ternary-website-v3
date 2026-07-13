import type { Block, Field } from 'payload'

import { DEFAULT_LANE_COLOR, LANE_COLORS } from '@/components/sections/laneColors'
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
          'Section intro rendered above the card grid. Use a Heading (H2/H3) for the title line(s) and normal paragraphs for the supporting copy — headings get the display style, paragraphs the body style.',
      },
    },
    {
      name: 'items',
      label: 'Cards',
      type: 'array',
      admin: {
        description:
          'Cards in the grid, in display order. Every card is the same size: a uniform 4-column grid on desktop, and a swipeable carousel below that.',
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

/**
 * One end of a shipping lane. `label` is what a screen reader announces (so it is localized);
 * the coordinates are geography, identical in every locale, so they are not.
 */
const lanePoint = (name: 'from' | 'to', label: string): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    {
      name: 'label',
      label: 'Place name',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'e.g. Dhaka. Announced to screen readers; never drawn on the globe.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'lat',
          label: 'Latitude',
          type: 'number',
          required: true,
          min: -90,
          max: 90,
          admin: { width: '50%', step: 0.0001 },
        },
        {
          name: 'lng',
          label: 'Longitude',
          type: 'number',
          required: true,
          min: -180,
          max: 180,
          admin: { width: '50%', step: 0.0001 },
        },
      ],
    },
  ],
})

export const GlobalDeliverySection: Block = {
  slug: 'globalDeliverySection',
  interfaceName: 'GlobalDeliverySectionBlock',
  labels: { singular: 'Global Delivery Section', plural: 'Global Delivery Sections' },
  fields: [
    ...sectionHeader(),
    {
      // The map itself stores nothing — it is a picker over the `lanes` array below, which is the
      // single source of truth. See LaneMapField.
      name: 'map',
      type: 'ui',
      admin: {
        components: { Field: '@/components/admin/globe/LaneMapField' },
      },
    },
    {
      name: 'lanes',
      label: 'Shipping Lanes',
      type: 'array',
      maxRows: 6,
      admin: {
        description:
          'Each row is one lane the 3D globe draws, from one point to another. Add a row, then pin both ends on the map above (or type the coordinates). With no lanes the globe falls back to its built-in Dhaka → US routes.',
        components: { RowLabel: '@/blocks/_ui/LaneRowLabel#LaneRowLabel' },
      },
      fields: [
        lanePoint('from', 'From'),
        lanePoint('to', 'To'),
        {
          name: 'color',
          label: 'Flare Colour',
          type: 'select',
          defaultValue: DEFAULT_LANE_COLOR,
          options: LANE_COLORS.map((c) => ({ label: c.label, value: c.value })),
          admin: {
            description:
              'Tint of this lane and of the comet that travels it. The map above previews it. Muted pastels only — a saturated hue fights the globe.',
          },
        },
      ],
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
