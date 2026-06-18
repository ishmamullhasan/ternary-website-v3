import type { Block } from 'payload'

export const ScaleShowcase: Block = {
  slug: 'scaleShowcase',
  interfaceName: 'ScaleShowcaseBlock',
  labels: { singular: 'Scale Showcase', plural: 'Scale Showcases' },
  fields: [
    {
      name: 'scales',
      label: 'Scales',
      type: 'relationship',
      relationTo: 'scale',
      hasMany: true,
      admin: {
        description: 'The scale tiers to showcase, in order.',
      },
    },
  ],
}

export default ScaleShowcase
