'use client'

import { localeFromPath } from '@/lib/i18n/locales'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Leaf client component (WEB-447): fires one pageview beacon to /api/track on mount and on every
// client-side navigation (pathname change). Rendered once from the [locale] layout, which stays a
// server component — only this leaf is 'use client'.
//
// Locale parsing: the default locale (en) is served unprefixed at the root and bn lives under /bn,
// so the shared `localeFromPath` reads the leading segment and falls back to the default locale.

const send = (pathname: string): void => {
  const payload = JSON.stringify({
    path: pathname,
    locale: localeFromPath(pathname),
    referrer: document.referrer || undefined,
  })

  // Prefer sendBeacon (survives unload, doesn't block navigation). Fall back to keepalive fetch
  // where sendBeacon is unavailable. Either way, failures are ignored — analytics is best-effort.
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' })
      if (navigator.sendBeacon('/api/track', blob)) return
    }
    void fetch('/api/track', {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {})
  } catch {
    // never throw from the beacon
  }
}

export default function AnalyticsBeacon() {
  const pathname = usePathname()
  // Guard against double-firing on the same path (e.g. React 18/19 dev StrictMode double-mount,
  // or a re-render that doesn't actually change the route).
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return
    lastSent.current = pathname
    send(pathname)
  }, [pathname])

  return null
}
