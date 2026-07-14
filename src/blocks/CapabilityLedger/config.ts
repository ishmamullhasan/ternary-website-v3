import type { Block } from 'payload'

import { sectionHeader } from '@/fields/sectionHeader'

/**
 * The practice ledger — the /capabilities landing's second half.
 *
 * Deliberately holds almost no copy of its own. The rows read their title, excerpt, figure and
 * "how we do it" practice items straight off the referenced `capability` docs, so the landing can
 * never drift out of sync with the detail pages it indexes. The only text authored here is the
 * section header and the label that sits above each row's practice list.
 */
export const CapabilityLedger: Block = {
  slug: 'capabilityLedger',
  interfaceName: 'CapabilityLedgerBlock',
  labels: { singular: 'Capability Ledger', plural: 'Capability Ledgers' },
  fields: [
    ...sectionHeader(),
    {
      name: 'capabilities',
      label: 'Capabilities',
      type: 'relationship',
      relationTo: 'capability',
      hasMany: true,
      admin: {
        description:
          'Disciplines listed in the ledger, in display order. Each row pulls its own excerpt, figure and practice items from the capability — nothing is re-authored here.',
      },
    },
    {
      name: 'practiceLabel',
      label: 'Practice List Label',
      type: 'text',
      localized: true,
      admin: {
        description: 'Sits above the practice items inside each row, e.g. “How we do it”.',
      },
    },
    {
      name: 'linkLabel',
      label: 'Row Link Label',
      type: 'text',
      localized: true,
      // Required, deliberately. A code-side default can only ever be one language: left blank on the
      // bn page it would render the English word "Explore" eight times inside a lang="bn" document,
      // which a Bengali screen reader pronounces with Bengali phonemes (SC 3.1.2). Better to make
      // the editor supply it than to ship a fallback that is wrong in half the locales.
      required: true,
      admin: {
        description: 'Label on each row’s link through to the capability page, e.g. “Explore”.',
      },
    },
  ],
}

export default CapabilityLedger
