'use client'

import { Button } from '@payloadcms/ui'
import { useState, useTransition } from 'react'
import { revalidateSite, type RevalidateResult } from './actions'

// Admin dashboard card (mounted via admin.components.beforeDashboard) with a single button that
// clears the whole website's cache. Delegates to the `revalidateSite` server action, which does the
// auth check and the actual revalidation; this component only owns the pending/result UI.
export default function CacheRevalidator() {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<RevalidateResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onClick = () => {
    setError(null)
    setResult(null)
    startTransition(async () => {
      try {
        const res = await revalidateSite()
        if (res.ok) setResult(res)
        else setError(res.message ?? 'Revalidation failed')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Revalidation failed')
      }
    })
  }

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
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Website cache</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--theme-elevation-500)', maxWidth: 560 }}>
            Rebuild the entire site&apos;s cache. Use this after bulk imports or ops scripts, or when a page looks stale
            — it clears every content &amp; global cache tag and the full page cache in one click.
          </p>
        </div>
        <Button buttonStyle="primary" onClick={onClick} disabled={pending}>
          {pending ? 'Revalidating…' : 'Revalidate site'}
        </Button>
      </div>

      {(result || error) && (
        <p
          style={{
            margin: '14px 0 0',
            fontSize: 13,
            fontWeight: 500,
            color: error ? 'var(--theme-error-500, #c0392b)' : 'var(--theme-success-500, #2e9e57)',
          }}
        >
          {error
            ? `Failed: ${error}`
            : `Done — cleared ${result?.tags} cache tags and the full page cache at ${new Date(
                result!.at,
              ).toLocaleTimeString()}. New content appears on the next page load.`}
        </p>
      )}
    </div>
  )
}
