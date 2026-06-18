'use client'

import { LOCALES } from '@/lib/i18n/locales'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Leaf client component (WEB-447): fires one pageview beacon to /api/track on mount and on every
// client-side navigation (pathname change). Rendered once from the [locale] layout, which stays a
// server component — only this leaf is 'use client'.
//
// Locale parsing: the site is always-prefixed (/en/…, /bn/…) per WEB-445, so the locale is just the
// first path segment when it's one of the known LOCALES. If the first segment isn't a known locale
// (shouldn't happen behind the middleware) we send undefined rather than guessing.

const localeFromPath = (pathname: string): string | undefined => {
  const first = pathname.split('/').filter(Boolean)[0]
  return first && (LOCALES as readonly string[]).includes(first) ? first : undefined
}

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
