'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// 'use client' chart leaf (WEB-447): the per-day pageview time series. recharts is already a project
// dependency, so we use it rather than adding anything new. The server dashboard does the
// aggregation and passes a plain {date, count}[] array down.

export type PageviewPoint = { date: string; count: number }

export default function PageviewsChart({ data }: { data: PageviewPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="pv-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--theme-success-500, #2e9e57)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--theme-success-500, #2e9e57)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-elevation-150)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--theme-elevation-500)' }}
          tickFormatter={(d: string) => d.slice(5)}
          minTickGap={24}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--theme-elevation-500)' }} width={40} />
        <Tooltip
          contentStyle={{
            background: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Pageviews"
          stroke="var(--theme-success-500, #2e9e57)"
          fill="url(#pv-fill)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
