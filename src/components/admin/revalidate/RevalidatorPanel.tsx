'use client'

import { CACHE_TARGETS, type CacheTag } from '@/utilities/cacheTags'
import { Button } from '@payloadcms/ui'
import { useMemo, useState, useTransition } from 'react'
import { revalidateSite, revalidateTags, type RevalidateResult } from './actions'

// UI field mounted on the `revalidator` global (Settings → Revalidator). Lets an editor rebuild the
// cached copy of the whole site, or of just the collections/globals they pick — the selective path
// exists because clearing everything makes every page on the site re-render from scratch on its next
// visit, which is wasteful when only one collection actually changed.
//
// All the privileged work happens in ./actions (server actions that re-check auth via Payload's
// cookie session); this component only owns selection state and the pending/result UI.

const COLLECTIONS = CACHE_TARGETS.filter((t) => t.kind === 'collection')
const GLOBALS = CACHE_TARGETS.filter((t) => t.kind === 'global')

const card: React.CSSProperties = {
  padding: 20,
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  background: 'var(--theme-elevation-0)',
}

export default function RevalidatorPanel() {
  const [selected, setSelected] = useState<Set<CacheTag>>(new Set())
  const [pending, startTransition] = useTransition()
  // Which button is in flight — so only that one shows a spinner label.
  const [running, setRunning] = useState<'selected' | 'site' | null>(null)
  const [result, setResult] = useState<(RevalidateResult & { scope: string }) | null>(null)
  const [error, setError] = useState<string | null>(null)

  const allTags = useMemo(() => CACHE_TARGETS.map((t) => t.tag), [])
  const allSelected = selected.size === allTags.length

  const toggle = (tag: CacheTag) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const run = (which: 'selected' | 'site') => {
    setError(null)
    setResult(null)
    setRunning(which)
    startTransition(async () => {
      try {
        const tags = [...selected]
        const res = which === 'site' ? await revalidateSite() : await revalidateTags(tags)
        if (res.ok) {
          setResult({
            ...res,
            scope:
              which === 'site'
                ? 'the entire website'
                : tags.map((t) => CACHE_TARGETS.find((c) => c.tag === t)?.label ?? t).join(', '),
          })
        } else {
          setError(res.message ?? 'Revalidation failed')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Revalidation failed')
      } finally {
        setRunning(null)
      }
    })
  }

  const renderGroup = (title: string, items: typeof CACHE_TARGETS) => (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <legend
        style={{
          padding: 0,
          marginBottom: 10,
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--theme-elevation-500)',
        }}
      >
        {title}
      </legend>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
        {items.map(({ tag, label }) => (
          <label
            key={tag}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 6,
              background: selected.has(tag) ? 'var(--theme-elevation-100)' : 'transparent',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <input type="checkbox" checked={selected.has(tag)} onChange={() => toggle(tag)} disabled={pending} />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  )

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={card}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Clear selected caches</h2>
        <p style={{ margin: '4px 0 20px', fontSize: 13, color: 'var(--theme-elevation-500)', maxWidth: 620 }}>
          Pick the collections and globals whose content looks stale on the live site. Their cached copies are dropped
          and rebuilt from Payload on the next visit. Both locales (en and bn) are cleared.
        </p>

        <div style={{ display: 'grid', gap: 20 }}>
          {renderGroup('Collections', COLLECTIONS)}
          {renderGroup('Globals', GLOBALS)}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid var(--theme-elevation-100)',
          }}
        >
          <Button buttonStyle="primary" onClick={() => run('selected')} disabled={pending || selected.size === 0}>
            {pending && running === 'selected' ? 'Clearing…' : `Clear ${selected.size || ''} selected`.trim()}
          </Button>
          <Button
            buttonStyle="secondary"
            onClick={() => setSelected(allSelected ? new Set() : new Set(allTags))}
            disabled={pending}
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </Button>
        </div>
      </div>

      <div style={card}>
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
            <h2 style={{ margin: 0, fontSize: 18 }}>Clear the whole website</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--theme-elevation-500)', maxWidth: 560 }}>
              Drops every content and global cache tag <em>and</em> the full page cache. Use this after bulk imports or
              ops scripts that wrote straight to the database, or when you cannot tell what went stale. Every page
              rebuilds on its next visit, so the first load after this will be slower.
            </p>
          </div>
          <Button buttonStyle="primary" onClick={() => run('site')} disabled={pending}>
            {pending && running === 'site' ? 'Clearing…' : 'Clear everything'}
          </Button>
        </div>
      </div>

      {(result || error) && (
        <p
          role="status"
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 500,
            color: error ? 'var(--theme-error-500, #c0392b)' : 'var(--theme-success-500, #2e9e57)',
          }}
        >
          {error
            ? `Failed: ${error}`
            : `Done — cleared the cache for ${result!.scope} at ${new Date(
                result!.at,
              ).toLocaleTimeString()}. Fresh content appears on the next page load.`}
        </p>
      )}
    </div>
  )
}
