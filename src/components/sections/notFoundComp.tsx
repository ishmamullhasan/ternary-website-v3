'use client'

import { PRIMARY_ACTION, SECONDARY_ACTION, StatusScreen } from '@/components/sections/statusScreen'
import { localeFromPath, localizedHref, type Locale } from '@/lib/i18n/locales'
import type { NotFound } from '@/payload-types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// The 404 body. Every string and href comes from the `notFound` global (src/globals/notFound.ts);
// the layout itself lives in StatusScreen, shared with the error screen.
//
// This is a Client Component purely to recover the locale: `not-found.tsx` receives no `params` and
// `en` is served unprefixed, so the URL is the only signal. It cannot live in not-found.tsx itself —
// a client not-found boundary is silently ignored by Next and the builtin 404 renders instead —
// hence the server shell that reads the global for every locale and passes the map down.

export type NotFoundContentMap = Record<Locale, NotFound>

export function NotFoundComp({ content }: { content: NotFoundContentMap }) {
  const locale = localeFromPath(usePathname())
  const t = content[locale]

  return (
    <StatusScreen
      locale={locale}
      statusLabel={t.statusLabel}
      headline={t.headline ?? ''}
      probingText={t.probingText}
      title={t.title ?? ''}
      description={t.description}
      cards={t.cards ?? []}
      actions={
        <>
          {t.primaryLabel && (
            <Link href={localizedHref(locale, t.primaryLink)} className={PRIMARY_ACTION}>
              {t.primaryLabel}
            </Link>
          )}
          {t.secondaryLabel && (
            <Link href={localizedHref(locale, t.secondaryLink)} className={SECONDARY_ACTION}>
              {t.secondaryLabel}
            </Link>
          )}
        </>
      }
    />
  )
}

export default NotFoundComp
