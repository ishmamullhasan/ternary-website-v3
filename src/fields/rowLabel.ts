/**
 * Path to the generic array RowLabel component (see src/blocks/_ui/RowLabel.tsx). Referenced by
 * `admin.components.RowLabel` on array fields. Run `pnpm payload generate:importmap` after adding
 * new component paths so the admin bundle can resolve it.
 */
export const ROW_LABEL = '@/blocks/_ui/RowLabel#RowLabel' as const

/** Spread onto an array field's `admin` to give it row-label previews. */
export const rowLabelAdmin = { components: { RowLabel: ROW_LABEL } }
