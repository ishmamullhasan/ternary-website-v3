'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type JSX } from 'react'

/**
 * Live refresh (WEB-490). Polls /next/live for the content version and soft-refreshes the route
 * whenever it moves, so a tab left open on the site picks up a Payload publish on its own.
 *
 * `router.refresh()` — not `location.reload()`. It re-runs the Server Components for the current
 * route and reconciles the new tree into the existing one: scroll position, focus, and client state
 * (open menus, carousel position, form input) all survive. A hard reload would throw them away, and
 * would be indistinguishable from the manual refresh we are trying to eliminate.
 *
 * Only mounted when an editor session cookie is present (see the [locale] layout) — public visitors
 * never ship or run this, and get their fresh content from ISR on their next navigation instead.
 */

// 5s: fast enough to feel immediate next to Payload's own save round-trip, slow enough that the
// endpoint (one projected findOne on a single-document collection) stays free.
const POLL_MS = 5_000

export const LiveRefresh = ({ pollMs = POLL_MS }: { pollMs?: number }): JSX.Element => {
  const router = useRouter()
  // The version we last rendered. `null` until the first poll establishes a baseline — without that
  // baseline the very first response would look like a change and refresh the page on every load.
  const seen = useRef<number | null>(null)
  const [updated, setUpdated] = useState(false)

  useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    // Guards against overlapping polls: a slow response must not let a second fetch start behind it.
    let inFlight = false

    const check = async () => {
      if (stopped || inFlight || document.hidden) return
      inFlight = true
      try {
        const res = await fetch('/next/live', { cache: 'no-store' })
        if (!res.ok) return
        const { v } = (await res.json()) as { v: number }
        if (stopped || typeof v !== 'number') return

        if (seen.current === null) {
          seen.current = v
        } else if (v !== seen.current) {
          // Record before refreshing, so a refresh that outlives this tick can't re-trigger itself.
          seen.current = v
          setUpdated(true)
          router.refresh()
        }
      } catch {
        // Offline, or a deploy swapping out underneath us. Stay quiet and try again next tick.
      } finally {
        inFlight = false
      }
    }

    const loop = () => {
      timer = setTimeout(async () => {
        await check()
        if (!stopped) loop()
      }, pollMs)
    }

    // A backgrounded tab doesn't poll at all (browsers throttle its timers anyway, so the interval
    // would be a lie). Check immediately on the way back instead — the common case is an editor
    // publishing in the admin tab and switching straight over to look at the site.
    const onVisible = () => {
      if (!document.hidden) void check()
    }
    document.addEventListener('visibilitychange', onVisible)

    void check()
    loop()

    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [router, pollMs])

  // The page rewriting itself with no warning is disorienting for anyone not watching the pixels;
  // SC 4.1.3 wants that announced. `role="status"` is implicitly aria-live="polite", so it waits for
  // a pause rather than interrupting.
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {updated ? 'Page content updated.' : ''}
    </div>
  )
}

export default LiveRefresh
