import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

/** A heading + a grid of team members (the "team voices" section). */
export const Team: Block = {
  slug: 'teamBlock',
  interfaceName: 'TeamBlock',
  labels: { singular: 'Team', plural: 'Teams' },
  fields: [
    ...sectionHeader(),
    { name: 'members', label: 'Members', type: 'relationship', relationTo: 'team', hasMany: true },
  ],
}
