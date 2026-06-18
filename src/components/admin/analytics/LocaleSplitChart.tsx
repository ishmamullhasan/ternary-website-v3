'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

// 'use client' chart leaf (WEB-447): the locale breakdown donut (en / bn / unknown). recharts is
// already a dependency. Aggregation happens server-side; this leaf only renders.

export type LocaleSlice = { locale: string; count: number }

const COLORS = ['#2e9e57', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#6b7280']

export default function LocaleSplitChart({ data }: { data: LocaleSlice[] }) {
  if (data.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--theme-elevation-500)' }}>No data yet.</p>
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="locale" innerRadius={42} outerRadius={70} paddingAngle={2}>
            {data.map((entry, i) => (
              <Cell key={entry.locale} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 4,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13 }}>
        {data.map((entry, i) => (
          <li key={entry.locale} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: 2,
                background: COLORS[i % COLORS.length],
              }}
            />
            <span style={{ color: 'var(--theme-elevation-800)' }}>{entry.locale}</span>
            <span style={{ color: 'var(--theme-elevation-500)', marginLeft: 'auto' }}>{entry.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
