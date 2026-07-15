'use client'

import { LOCALES, localeFromPath, localizedPath, type Locale } from '@/lib/i18n/locales'
import { cn } from '@/utilities/ui'
import { Check, Languages } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// Full endonym (shown in the popover). Endonyms — each language names itself — read better than
// translated names in a switcher. The circle itself is icon-only; the active locale is conveyed by
// the button's aria-label and the checked entry in the popover.
const LOCALE_NAME: Record<Locale, string> = { en: 'English', bn: 'বাংলা' }

/**
 * Floating language switcher (replaces the in-header switcher). A circular liquid-glass button pinned
 * to the bottom-right corner — the same `.glass` material as the navbar pill — showing the active
 * locale code. Click/tap expands a small glass popover listing every locale; each entry is a real
 * <Link> that swaps the leading /[locale] segment while preserving the rest of the path
 * (/insights/foo ↔ /bn/insights/foo), so hreflang + crawlability stay intact.
 *
 * Mounted once globally from the [locale] layout, so it floats over every page independent of the
 * header. Closes on outside-click, Escape, and after navigation.
 */
export default function LocaleFab() {
  const pathname = usePathname() || '/'
  const current = localeFromPath(pathname)
  // Locale-LESS remainder of the current path; each menu entry re-prefixes it for its own locale.
  const rest = pathname.replace(new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`), '') || '/'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Outside-click + Escape close the popover (only wired while open).
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  // Collapse after a route change (e.g. picking a language).
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {open && (
        <div
          role="menu"
          aria-label="Language"
          className="glass min-w-[164px] origin-bottom-right rounded-2xl p-1.5 motion-safe:animate-[accordion-down_160ms_ease-out]"
        >
          {LOCALES.map((locale) => {
            const active = locale === current
            return (
              <Link
                key={locale}
                href={localizedPath(locale, rest)}
                hrefLang={locale}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-[14px] font-medium tracking-normal transition-colors duration-150',
                  active ? 'bg-white/[0.08] text-cream' : 'text-cream/75 hover:bg-white/[0.06] hover:text-cream',
                )}
              >
                <span>{LOCALE_NAME[locale]}</span>
                {active && <Check aria-hidden className="size-4 text-secondary" />}
              </Link>
            )
          })}
        </div>
      )}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Change language — current: ${LOCALE_NAME[current]}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'glass pointer-events-auto flex size-12 items-center justify-center rounded-full text-cream',
          'transition-transform duration-200 motion-safe:hover:scale-105 active:scale-95 sm:size-14',
          open && 'scale-105',
        )}
      >
        <Languages aria-hidden className="size-5 sm:size-6" />
      </button>
    </div>
  )
}
