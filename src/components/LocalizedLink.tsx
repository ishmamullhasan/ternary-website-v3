'use client'

import { localeFromPath, localizedHref } from '@/lib/i18n/locales'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'

/**
 * Drop-in replacement for `next/link` that keeps in-site navigation inside the active /[locale]
 * segment (WEB-445). The locale is recovered from the URL (`usePathname()`), so any string href is
 * locale-prefixed automatically — no prop-drilling. External URLs, `mailto:`/`tel:`, hash anchors,
 * and already-prefixed paths pass through untouched (see `localizedHref`).
 *
 * Why this exists: CMS links are stored locale-LESS (`/insights`). Rendered raw, a click from
 * `/bn/…` lands on `/insights`, which the middleware 301s to `/en/insights` — so the language
 * silently "resets to English" on every navigation. Swap `import Link from 'next/link'` for this.
 */
export default function LocalizedLink({ href, ...props }: ComponentProps<typeof Link>) {
  const locale = localeFromPath(usePathname())
  const resolvedHref = typeof href === 'string' ? localizedHref(locale, href) : href
  return <Link href={resolvedHref} {...props} />
}
