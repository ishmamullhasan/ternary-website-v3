import type { Block } from 'payload'

import { statsArray } from '@/fields/arrays'
import { sectionHeader } from '@/fields/sectionHeader'

export const FeatureCaseStudy: Block = {
  slug: 'featureCaseStudy',
  interfaceName: 'FeatureCaseStudyBlock',
  labels: { singular: 'Feature Case Study', plural: 'Feature Case Studies' },
  fields: [
    ...sectionHeader(),
    {
      name: 'story',
      label: 'Featured Story',
      type: 'relationship',
      relationTo: 'story',
    },
    statsArray({ label: 'Overlay Stats' }),
    {
      name: 'highlights',
      label: 'Highlights',
      type: 'array',
      fields: [{ name: 'text', label: 'Text', type: 'text', required: true, localized: true }],
    },
    {
      name: 'readTime',
      label: 'Read Time',
      type: 'text',
      localized: true,
      admin: { description: 'e.g. "12 min"' },
    },
    {
      name: 'categoryLabel',
      label: 'Category Label',
      type: 'text',
      localized: true,
      admin: { description: 'e.g. "Engineering Studio"' },
    },
    {
      name: 'buttonLabel',
      label: 'Button Label',
      type: 'text',
      localized: true,
    },
  ],
}

export default FeatureCaseStudy
