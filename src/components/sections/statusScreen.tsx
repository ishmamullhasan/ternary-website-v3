'use client'

import Heading from '@/components/a11y/Heading'
import { localizedHref, type Locale } from '@/lib/i18n/locales'
import Link from 'next/link'
import type { ReactNode } from 'react'

// Shared presentation for the full-page status screens (Figma "404", node 2489:2701): status pill →
// oversized headline → terminal line with caret → heading → body → actions → recovery cards.
//
// Both consumers (notFoundComp, errorComp) render the identical layout and differ only in where the
// copy comes from and what the primary action does — the 404 links home, the error screen re-runs
// the failed render. Keeping the markup here means a design tweak lands on both at once.
//
// The header, <main>, and footer around this come from [locale]/layout.tsx — except under
// global-error, which by Next's rules replaces the root layout entirely and so has no chrome.

export type StatusCard = {
  id?: string | null
  eyebrow?: string | null
  title: string
  link: string
}

export function StatusScreen({
  locale,
  statusLabel,
  headline,
  probingText,
  title,
  description,
  actions,
  cards = [],
  note,
}: {
  locale: Locale
  statusLabel?: string | null
  headline: string
  probingText?: string | null
  title: string
  description?: string | null
  actions?: ReactNode
  cards?: StatusCard[]
  note?: ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-16 px-5 py-24 text-center md:py-32">
      <div className="flex w-full max-w-[896px] flex-col items-center gap-8">
        {statusLabel && <p className="rounded-full bg-ink px-3 py-1 font-mono text-xs text-cream">{statusLabel}</p>}

        {/* Design sets 120px; clamped so the word never overflows a phone. */}
        <Heading
          level={1}
          className="font-display text-[clamp(2.5rem,10.5vw,7.5rem)] font-bold leading-none tracking-[-0.04em] text-cream"
        >
          {headline}
        </Heading>

        {probingText && (
          <p className="flex items-center justify-center gap-1 font-mono text-sm text-cream">
            {probingText}
            {/* Terminal caret. The globals.css prefers-reduced-motion rule already stills CSS animation. */}
            <span className="inline-block h-4 w-[10px] animate-pulse bg-cream/40" aria-hidden />
          </p>
        )}

        <Heading
          level={2}
          className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-medium leading-[1.15] tracking-[-0.05em] text-cream"
        >
          {title}
        </Heading>

        {description && <p className="max-w-[718px] text-base text-body">{description}</p>}

        {actions && <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">{actions}</div>}

        {note}
      </div>

      {cards.length > 0 && (
        <ul className="grid w-full max-w-[896px] grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <li key={card.id ?? card.link} className="flex">
              <Link
                href={localizedHref(locale, card.link)}
                className="flex w-full flex-col gap-2 rounded-lg bg-card p-6 text-left transition-colors hover:bg-badge"
              >
                {card.eyebrow && <span className="font-mono text-xs text-body">{card.eyebrow}</span>}
                <Heading level={3} className="text-xl font-semibold text-cream">
                  {card.title}
                </Heading>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Shared button skins so the two screens can't drift apart.
export const PRIMARY_ACTION =
  'inline-flex h-12 items-center justify-center rounded-lg bg-cream px-8 text-sm font-medium tracking-normal text-ink transition-colors hover:bg-cream-hover'
export const SECONDARY_ACTION =
  'inline-flex h-12 items-center justify-center rounded-lg border border-cream px-8 text-sm font-medium tracking-normal text-cream transition-colors hover:bg-cream hover:text-ink'

export default StatusScreen
