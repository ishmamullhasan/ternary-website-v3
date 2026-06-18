'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

// 'use client' leaf (WEB-447): the time-window selector that drives the dashboard. It writes the
// chosen window into the `?analyticsWindow=` query param; the server <AnalyticsDashboard> reads that
// param and re-queries. Kept as an isolated client leaf so the dashboard view stays a server
// component.

const WINDOWS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]

export default function TimeWindowPicker({ current }: { current: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const select = (days: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('analyticsWindow', String(days))
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', opacity: isPending ? 0.6 : 1 }}>
      {WINDOWS.map(({ label, value }) => {
        const active = value === current
        return (
          <button
            key={value}
            type="button"
            onClick={() => select(value)}
            aria-pressed={active}
            style={{
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid var(--theme-elevation-150)',
              background: active ? 'var(--theme-elevation-150)' : 'transparent',
              color: 'var(--theme-elevation-800)',
              fontWeight: active ? 600 : 400,
              fontSize: 13,
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
