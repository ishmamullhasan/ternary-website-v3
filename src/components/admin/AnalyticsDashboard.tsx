import LocaleSplitChart, { type LocaleSlice } from '@/components/admin/analytics/LocaleSplitChart'
import PageviewsChart, { type PageviewPoint } from '@/components/admin/analytics/PageviewsChart'
import TimeWindowPicker from '@/components/admin/analytics/TimeWindowPicker'
import config from '@payload-config'
import type { ServerProps } from 'payload'
import { getPayload } from 'payload'

// First-party analytics dashboard (WEB-447), mounted via admin.components.beforeDashboard.
//
// SERVER component: it queries the `analytics` collection and aggregates in-process (total
// pageviews, a per-day time series, top paths, and a locale split), honoring a time window taken
// from the `?analyticsWindow=` query param. All interactivity lives in 'use client' leaves under
// components/admin/analytics/ (TimeWindowPicker + the two recharts charts) — this view itself never
// ships to the client.

const ALLOWED_WINDOWS = [7, 30, 90]
const DEFAULT_WINDOW = 30
// Hard ceiling on rows pulled per window so a high-traffic site can't OOM the aggregation. At ~10k
// the per-day/top-path shape is already representative; raise if needed.
const MAX_ROWS = 10_000
const PAGE_SIZE = 1000

type AnalyticsRow = {
  path?: string | null
  locale?: string | null
  timestamp?: string | null
}

const parseWindow = (raw: unknown): number => {
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  return ALLOWED_WINDOWS.includes(n) ? n : DEFAULT_WINDOW
}

// Build a zero-filled per-day series so the chart shows continuous days even with gaps.
const buildSeries = (counts: Map<string, number>, days: number): PageviewPoint[] => {
  const series: PageviewPoint[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    series.push({ date: key, count: counts.get(key) ?? 0 })
  }
  return series
}

export default async function AnalyticsDashboard(props: ServerProps) {
  // beforeDashboard receives the live request `payload` instance; fall back to getPayload defensively.
  const payload = props.payload ?? (await getPayload({ config }))
  const days = parseWindow(props.searchParams?.analyticsWindow)
  // Server component: renders once per request, so request-time "now" is the correct,
  // intended window boundary (not a client re-render hazard the purity rule guards against).
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  // Pull rows for the window in pages (read access is staff-only; overrideAccess so the dashboard
  // works regardless of the viewing user's field-level perms).
  const rows: AnalyticsRow[] = []
  let page = 1
  while (rows.length < MAX_ROWS) {
    const res = await payload.find({
      collection: 'analytics',
      where: { timestamp: { greater_than_equal: since } },
      sort: '-timestamp',
      depth: 0,
      limit: PAGE_SIZE,
      page,
      overrideAccess: true,
    })
    rows.push(...(res.docs as AnalyticsRow[]))
    if (!res.hasNextPage) break
    page += 1
  }

  // Aggregate: total, per-day series, top paths, locale split.
  const total = rows.length
  const perDay = new Map<string, number>()
  const perPath = new Map<string, number>()
  const perLocale = new Map<string, number>()

  for (const row of rows) {
    if (row.timestamp) {
      const day = new Date(row.timestamp).toISOString().slice(0, 10)
      perDay.set(day, (perDay.get(day) ?? 0) + 1)
    }
    const path = row.path || '(unknown)'
    perPath.set(path, (perPath.get(path) ?? 0) + 1)
    const locale = row.locale || '(none)'
    perLocale.set(locale, (perLocale.get(locale) ?? 0) + 1)
  }

  const series = buildSeries(perDay, days)
  const topPaths = [...perPath.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }))
  const localeSplit: LocaleSlice[] = [...perLocale.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([locale, count]) => ({ locale, count }))

  const maxPathCount = topPaths[0]?.count ?? 1

  return (
    <div
      style={{
        margin: '0 0 32px',
        padding: 20,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
        background: 'var(--theme-elevation-0)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Website analytics</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--theme-elevation-500)' }}>
            First-party pageviews — last {days} days
          </p>
        </div>
        <TimeWindowPicker current={days} />
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <Stat label="Total pageviews" value={total.toLocaleString()} />
        <Stat label="Tracked days" value={String(days)} />
        <Stat label="Unique paths" value={perPath.size.toLocaleString()} />
      </div>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, margin: '0 0 8px', color: 'var(--theme-elevation-800)' }}>Pageviews over time</h3>
        <PageviewsChart data={series} />
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}
      >
        <section>
          <h3 style={{ fontSize: 14, margin: '0 0 8px', color: 'var(--theme-elevation-800)' }}>Top pages</h3>
          {topPaths.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--theme-elevation-500)' }}>No data yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {topPaths.map(({ path, count }) => (
                <li key={path} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '80%',
                        color: 'var(--theme-elevation-800)',
                      }}
                      title={path}
                    >
                      {path}
                    </span>
                    <span style={{ color: 'var(--theme-elevation-500)' }}>{count}</span>
                  </div>
                  {/* Lightweight CSS bar — no chart lib needed for a simple ranked list. */}
                  <div style={{ height: 6, background: 'var(--theme-elevation-100)', borderRadius: 3 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max(4, (count / maxPathCount) * 100)}%`,
                        background: 'var(--theme-success-500, #2e9e57)',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 style={{ fontSize: 14, margin: '0 0 8px', color: 'var(--theme-elevation-800)' }}>By locale</h3>
          <LocaleSplitChart data={localeSplit} />
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: '1 1 140px',
        padding: '12px 16px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--theme-elevation-1000)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--theme-elevation-500)' }}>{label}</div>
    </div>
  )
}
