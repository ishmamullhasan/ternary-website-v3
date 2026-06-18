'use client'

import { useRowLabel } from '@payloadcms/ui'
import type { JSX } from 'react'

/**
 * Generic array row label. Previews the most identifying text on a row so editors see
 * "Engineering growth" instead of "Item 02". Used by every array in the block library via
 * `admin.components.RowLabel` (the ROW_LABEL path constant). Falls back to a padded index.
 */
export const RowLabel = (): JSX.Element => {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const pick = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = data?.[k]
      if (typeof v === 'string' && v.trim()) return v.trim()
    }
    return undefined
  }
  const label =
    pick('title', 'name', 'label', 'heading', 'city', 'value', 'text', 'item') ??
    `Item ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`
  return <span>{label}</span>
}
