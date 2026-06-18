import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

/**
 * Careers "Team voices" section: a heading + description and a swipeable carousel of team
 * members (relationship → team). Mirrors the carousel markup used on the careers page,
 * distinct from the static-grid `teamBlock`.
 */
export const CareersTeam: Block = {
  slug: 'careersTeam',
  interfaceName: 'CareersTeamBlock',
  labels: { singular: 'Careers Team', plural: 'Careers Team' },
  fields: [
    ...sectionHeader(),
    {
      name: 'members',
      label: 'Members',
      type: 'relationship',
      relationTo: 'team',
      hasMany: true,
      admin: { description: 'Team members shown in the carousel, in order.' },
    },
  ],
}

export default CareersTeam
