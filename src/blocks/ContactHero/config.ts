import type { Block } from 'payload'

import { buttonsField } from '@/fields/buttons'
import { sectionHeader } from '@/fields/sectionHeader'

export const ContactHero: Block = {
  slug: 'contactHero',
  interfaceName: 'ContactHeroBlock',
  labels: { singular: 'Contact Hero', plural: 'Contact Heroes' },
  fields: [...sectionHeader(), buttonsField({ name: 'buttons', label: 'Buttons', max: 2 })],
}

export default ContactHero
