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
 * Rendered in the [locale] layout next to the CMS-driven Header global — intentionally light, and
 * does NOT rewrite the header global itself.
 */
export default function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname() || `/${currentLocale}`

  // Strip the leading locale segment to get a locale-LESS path; everything else is preserved.
  const rest = pathname.replace(new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`), '') || '/'

  return (
    <nav aria-label="Language" className="flex items-center justify-end gap-2 px-5 md:px-10 py-2 text-xs">
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
