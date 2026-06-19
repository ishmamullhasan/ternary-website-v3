'use client'

import { LOCALES, type Locale } from '@/lib/i18n/locales'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  bn: 'BN',
}

/**
 * Minimal per-locale URL switcher (WEB-445). Swaps the leading /[locale] segment of the current
 * path, keeping the rest of the route intact, so /en/insights/foo ↔ /bn/insights/foo.
 *
 * Rendered inside the CMS-driven Header (desktop CTA cluster + mobile bar) — intentionally light,
 * and does NOT rewrite the header global itself. `className` lets the host tune layout/spacing.
 */
export default function LocaleSwitcher({ currentLocale, className }: { currentLocale: string; className?: string }) {
  const pathname = usePathname() || `/${currentLocale}`

  // Strip the leading locale segment to get a locale-LESS path; everything else is preserved.
  const rest = pathname.replace(new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`), '') || '/'

  return (
    <nav aria-label="Language" className={cn('flex items-center gap-2 text-xs', className)}>
      {LOCALES.map((locale) => {
        const href = rest === '/' ? `/${locale}` : `/${locale}${rest}`
        const active = locale === currentLocale
        return (
          <Link
            key={locale}
            href={href}
            hrefLang={locale}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'rounded px-2 py-1 font-medium transition-colors',
              active ? 'text-secondary underline underline-offset-4' : 'opacity-70 hover:opacity-100',
            )}
          >
            {LOCALE_LABELS[locale]}
          </Link>
        )
      })}
    </nav>
  )
}
