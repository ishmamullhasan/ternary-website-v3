'use client'

import { PRIMARY_ACTION, SECONDARY_ACTION, StatusScreen } from '@/components/sections/statusScreen'
import { localeFromPath, localizedHref, type Locale } from '@/lib/i18n/locales'
import type { ErrorPage } from '@/payload-types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// The unknown-error body, shared by [locale]/error.tsx and the root global-error.tsx.
//
// Copy comes from the `errorPage` global — but unlike the 404, it CANNOT be read on the server:
// Next requires every error boundary to be a Client Component. So we fetch /api/error-content on
// mount and render FALLBACK until it arrives.
//
// That fallback is not belt-and-braces, it is the point. This screen renders precisely when
// something has already failed, and the most likely culprit — an unreachable database — is the same
// dependency the copy lives behind. An error page that itself throws is the one thing worse than the
// error. So: never block the render on the fetch, never let the fetch reject, always ship readable
// English text in the bundle.

type Content = Pick<
  ErrorPage,
  | 'statusLabel'
  | 'headline'
  | 'probingText'
  | 'title'
  | 'description'
  | 'retryLabel'
  | 'secondaryLabel'
  | 'secondaryLink'
  | 'digestLabel'
  | 'cards'
>

const FALLBACK: Content = {
  statusLabel: 'runtime.status: exception',
  headline: 'UNHANDLED',
  probingText: 'Capturing stack trace and notifying the on-call engineer…',
  title: 'Something broke on our side.',
  description:
    'This one is on us, not you. The failure has been logged. Retrying often works — the fault may have been momentary.',
  retryLabel: 'Try again',
  secondaryLabel: 'Return home',
  secondaryLink: '/',
  digestLabel: 'Reference',
  cards: [],
}

export function ErrorComp({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const locale = localeFromPath(usePathname())
  const [content, setContent] = useState<Content>(FALLBACK)

  useEffect(() => {
    // Surface the failure for whatever error reporter is attached to the console.
    console.error(error)
  }, [error])

  useEffect(() => {
    let cancelled = false

    fetch('/api/error-content')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Partial<Record<Locale, ErrorPage>> | null) => {
        const doc = data?.[locale]
        // A field the editor cleared must not blank the screen — fall back per field, not wholesale.
        if (!cancelled && doc) setContent({ ...FALLBACK, ...doc })
      })
      .catch(() => {
        // Endpoint unreachable — the DB is probably the thing that broke. Keep FALLBACK.
      })

    return () => {
      cancelled = true
    }
  }, [locale])

  return (
    <StatusScreen
      locale={locale}
      statusLabel={content.statusLabel}
      headline={content.headline ?? FALLBACK.headline ?? ''}
      probingText={content.probingText}
      title={content.title ?? FALLBACK.title ?? ''}
      description={content.description}
      cards={content.cards ?? []}
      actions={
        <>
          <button type="button" onClick={retry} className={PRIMARY_ACTION}>
            {content.retryLabel}
          </button>
          {content.secondaryLabel && (
            <Link href={localizedHref(locale, content.secondaryLink)} className={SECONDARY_ACTION}>
              {content.secondaryLabel}
            </Link>
          )}
        </>
      }
      note={
        // Next never forwards a Server Component's real error message to the client (it would leak
        // internals); it forwards a digest hash instead. Showing it is what lets support match the
        // report to the server log.
        error.digest ? (
          <p className="font-mono text-xs text-subtle">
            {content.digestLabel}: {error.digest}
          </p>
        ) : null
      }
    />
  )
}

export default ErrorComp
