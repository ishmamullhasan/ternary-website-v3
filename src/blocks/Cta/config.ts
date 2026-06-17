import type { Block } from 'payload'

import { ctaGroup } from '@/fields/ctaGroup'

// Reuses the shared ctaGroup field set, so the CTA block and the collection CTA groups
// stay in sync.
export const Cta: Block = {
  slug: 'ctaBlock',
  interfaceName: 'CtaBlock',
  labels: { singular: 'CTA', plural: 'CTAs' },
  fields: ctaGroup().fields,
}
