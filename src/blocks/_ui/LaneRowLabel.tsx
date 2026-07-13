'use client'

import { useRowLabel } from '@payloadcms/ui'
import type { JSX } from 'react'

type Point = { label?: string | null; lat?: number | null; lng?: number | null }
type Lane = { from?: Point | null; to?: Point | null }

const place = (p: Point | null | undefined, fallback: string): string => {
  if (p?.label?.trim()) return p.label.trim()
  if (typeof p?.lat === 'number' && typeof p?.lng === 'number') return `${p.lat.toFixed(2)}, ${p.lng.toFixed(2)}`
  return fallback
}

/**
 * Row label for the delivery globe's `lanes` array. The generic RowLabel picks the first string it
 * finds on the row, but a lane's identity lives one level down in the `from`/`to` groups — so it
 * would only ever say "Item 01". This renders the actual route: "Dhaka → New York".
 */
export const LaneRowLabel = (): JSX.Element => {
  const { data, rowNumber } = useRowLabel<Lane>()
  const n = String((rowNumber ?? 0) + 1).padStart(2, '0')
  return <span>{`Lane ${n} — ${place(data?.from, 'unset')} → ${place(data?.to, 'unset')}`}</span>
}
