'use client'

import { useRowLabel } from '@payloadcms/ui'

/**
 * Admin row label for the header `menu` array — shows the item's label and whether it is a plain
 * link or a mega menu, so a collapsed nav list is readable at a glance.
 */
export default function MenuRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; type?: string }>()
  const n = String((rowNumber ?? 0) + 1).padStart(2, '0')
  const label = data?.label || 'Untitled'
  const kind = data?.type === 'mega' ? 'Mega menu' : 'Link'
  return (
    <span>
      {n}. {label} — {kind}
    </span>
  )
}
