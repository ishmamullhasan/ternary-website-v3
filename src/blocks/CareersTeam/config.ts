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
      type: 'array',
      admin: {
        description:
          'Team members shown in the carousel, in order. "Wide" cards keep the full size; uncheck it to make a card two-thirds width.',
      },
      fields: [
        {
          name: 'member',
          label: 'Member',
          type: 'relationship',
          relationTo: 'team',
          required: true,
          admin: { width: '70%' },
        },
        {
          name: 'wide',
          label: 'Wide',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '30%', description: 'On = full size · Off = two-thirds width' },
        },
      ],
    },
  ],
}

export default CareersTeam
