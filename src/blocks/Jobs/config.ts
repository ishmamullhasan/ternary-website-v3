import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

/** Renders the current open roles from the recruiting service (careers / opportunities). */
export const Jobs: Block = {
  slug: 'jobsBlock',
  interfaceName: 'JobsBlockType',
  labels: { singular: 'Jobs', plural: 'Jobs' },
  fields: [...sectionHeader()],
}
