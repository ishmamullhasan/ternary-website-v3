import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

/**
 * The shared page hero: a centered <h1> heading + a rich-text description. This is the one hero for
 * every page whose hero is just that (about, industries, stories, capabilities, insights, …) —
 * consolidated from the per-page StoriesHero/AboutHero/IndustriesHero blocks. Pages with a richer
 * hero (contact CTAs, scales/solutions media, careers two-column, the home HeroFeatured) keep their
 * own block.
 */
export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [...sectionHeader()],
}

export default Hero
