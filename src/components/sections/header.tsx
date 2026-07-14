'use client'

import MegaMenuOverlay, { type NavEntry, type SecondaryLink } from '@/components/nav/MegaMenuOverlay'
import { localeFromPath, localizedHref } from '@/lib/i18n/locales'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'
import { useReducedMotion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type MediaWithUrl = { url?: string | null }

interface HeaderData {
  logo?: MediaWithUrl | string | null
  siteName?: string | null
  exploreLabel?: string | null
  menu?: NavEntry[] | null
  secondaryLinks?: SecondaryLink[] | null
}

interface HeaderProps {
  headerData?: HeaderData | null
}

function getLogoUrl(logo: MediaWithUrl | string | null | undefined): string | null {
  if (!logo || typeof logo === 'string') return null
  return logo?.url ? getMediaUrl(logo.url) : null
}

const isMega = (e: NavEntry) => e.type === 'mega' && !!e.panel

/**
 * Ternary combination mark, inlined from the brand asset (public/icon/favicon.svg). Rendering it as
 * SVG paths rather than an <Image> means the mark always appears — the CMS logo media lives on S3
 * and degrades to a broken box locally — and stays crisp at any size.
 */
function TernaryMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 123 140" fill="currentColor" className={className} aria-hidden role="presentation">
      <path d="M60.2569 118.758L18.9035 94.9917C18.4016 94.6917 18.067 94.1583 18.067 93.5583V56.825C18.067 56.1917 18.7696 55.7917 19.3049 56.0917L67.3164 83.6917C67.9855 84.0917 68.822 83.5917 68.822 82.825V64.925C68.822 64.225 68.4539 63.5583 67.8182 63.1917L10.0707 29.9917C9.56883 29.6917 8.89968 29.6917 8.39782 29.9917L0.836436 34.3583C0.334574 34.6583 0 35.1917 0 35.7917V104.025C0 104.625 0.334574 105.158 0.836436 105.458L60.1565 139.592C60.6583 139.892 61.3275 139.892 61.8293 139.592L111.647 110.925C112.317 110.525 112.317 109.592 111.647 109.192L96.1232 100.258C95.4875 99.8917 94.7515 99.8917 94.1158 100.258L61.9632 118.758C61.4613 119.058 60.7922 119.058 60.2903 118.758H60.2569Z" />
      <path d="M121.149 34.325L61.8294 0.225C61.3275 -0.075 60.6584 -0.075 60.1565 0.225L28.8069 18.2583C28.1378 18.6583 28.1378 19.5917 28.8069 19.9917L44.1973 28.8583C44.833 29.225 45.5691 29.225 46.2048 28.8583L60.2569 20.7917C60.7588 20.4917 61.4279 20.4917 61.9298 20.7917L103.283 44.5583C103.785 44.8583 104.12 45.3917 104.12 45.9917V82.8917C104.12 83.5917 104.488 84.2583 105.123 84.625L120.514 93.4583C121.183 93.8583 122.019 93.3583 122.019 92.5917V35.7917C122.019 35.1917 121.685 34.6583 121.183 34.3583L121.149 34.325Z" />
    </svg>
  )
}

/**
 * Burger ⇄ cross, morphed rather than swapped. Three bars share one centre: closed, the outer two
 * are offset ±6px and the middle is visible; open, the offsets collapse to zero and the outer two
 * counter-rotate into an X while the middle scales away along its own length.
 *
 * Tailwind emits `transform` as translate→rotate→scale, so a bar translates *then* spins about its
 * own centre — which is what keeps the arms crossing dead centre through the whole tween instead of
 * pivoting around the box corner.
 *
 * Deliberately CSS transitions, not motion/react: `globals.css` already clamps transition-duration
 * to 0.01ms under both `prefers-reduced-motion` and the site's `data-a11y-motion='reduce'` toggle,
 * so this honours reduced motion for free. A motion/react tween would need a `useReducedMotion()`
 * gate to do the same, and would miss the in-app toggle entirely.
 */
function MenuCrossIcon({ open }: { open: boolean }) {
  // -mt-px pulls each 2px bar up by half its height, so `top-1/2` centres its midline rather than
  // its top edge. Without it every bar sits 1px low and the open arms cross off-centre.
  const bar = 'absolute left-1/2 top-1/2 -mt-px h-0.5 w-full -translate-x-1/2 rounded-full bg-current ease-out'

  return (
    <span className="relative block size-5 sm:size-6" aria-hidden>
      <span className={cn(bar, 'transition-transform duration-300', open ? 'rotate-45' : '-translate-y-1.5')} />
      <span className={cn(bar, 'transition-[transform,opacity] duration-300', open && 'scale-x-0 opacity-0')} />
      <span className={cn(bar, 'transition-transform duration-300', open ? '-rotate-45' : 'translate-y-1.5')} />
    </span>
  )
}

export default function Header({ headerData }: HeaderProps) {
  const path = usePathname()
  // CMS links are stored locale-LESS; resolve them for the active locale (derived from the URL).
  const locale = localeFromPath(path)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const open = openIndex !== null

  const reduce = useReducedMotion() ?? false

  const menu = useMemo(() => (headerData?.menu ?? []).filter((m) => m?.label), [headerData?.menu])
  const secondaryLinks = useMemo(
    () => (headerData?.secondaryLinks ?? []).filter((s) => s?.label),
    [headerData?.secondaryLinks],
  )
  const logoUrl = getLogoUrl(headerData?.logo)
  const firstMega = useMemo(() => menu.findIndex(isMega), [menu])

  // Both burgers (header pill at md+, floating FAB below md) open the same overlay, landing on the
  // first mega entry so the panel is populated on open.
  const toggleMenu = () => setOpenIndex(open ? null : firstMega >= 0 ? firstMega : 0)

  // Close on route change.
  useEffect(() => {
    setOpenIndex(null)
  }, [path])

  // Escape closes; lock body scroll while the full-screen menu is open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenIndex(null)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      {/* There is no header bar at any breakpoint — just two fixed badges over the page. Logo pins to
          the top-left everywhere; the burger sits bottom-left on mobile (thumb reach) and top-right at
          md+. Neither reacts to scroll.

          Both badges stay mounted and keep their geometry while the mega menu is open — they simply
          sit above it (z-[110] vs the overlay's z-[100]) and the burger becomes the close control.
          The overlay therefore draws no logo/close of its own: rendering a second pair is what used
          to shift the mark and change the header gaps on open. */}
      <Link
        href={localizedHref(locale, '/')}
        aria-label={headerData?.siteName || 'Ternary'}
        onClick={() => setOpenIndex(null)}
        className={cn(
          'glass fixed top-5 left-5 z-[110] flex size-12 items-center justify-center rounded-2xl text-cream',
          'sm:top-6 sm:left-6 sm:size-14',
        )}
      >
        {logoUrl ? (
          <Image src={logoUrl} width={30} height={30} alt="" className="h-[26px] w-auto sm:h-[30px]" />
        ) : (
          <TernaryMark className="h-[26px] w-auto text-cream sm:h-[30px]" />
        )}
      </Link>

      {/* Burger — bottom-left below md (mirrors the language FAB), top-right at md+. Doubles as the
          menu's close button, so it never moves between the two states. */}
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggleMenu}
        className={cn(
          'glass fixed bottom-5 left-5 z-[110] flex size-12 items-center justify-center rounded-full text-cream',
          'sm:bottom-6 sm:left-6 sm:size-14',
          'md:top-6 md:right-6 md:bottom-auto md:left-auto md:rounded-2xl',
          'transition-transform duration-200 motion-safe:hover:scale-105 active:scale-95',
        )}
      >
        <MenuCrossIcon open={open} />
      </button>

      <MegaMenuOverlay
        open={open}
        menu={menu}
        secondaryLinks={secondaryLinks}
        exploreLabel={headerData?.exploreLabel}
        locale={locale}
        activeIndex={openIndex}
        onActiveIndex={setOpenIndex}
        onClose={() => setOpenIndex(null)}
        reduce={reduce}
      />
    </>
  )
}
