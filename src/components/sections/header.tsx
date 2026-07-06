'use client'

import MegaMenuOverlay, { type NavEntry, type SecondaryLink } from '@/components/nav/MegaMenuOverlay'
import { localeFromPath, localizedHref } from '@/lib/i18n/locales'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'
import { ArrowUpRight, ChevronDown, Menu } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useNavState } from './useNavState'

type MediaWithUrl = { url?: string | null }

interface HeaderData {
  logo?: MediaWithUrl | string | null
  siteName?: string | null
  exploreLabel?: string | null
  menu?: NavEntry[] | null
  secondaryLinks?: SecondaryLink[] | null
  button?: { label?: string | null; link?: string | null } | null
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
 * Ternary combination mark, inlined from the brand asset (public/favicon.svg). Rendering it as
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

export default function Header({ headerData }: HeaderProps) {
  const path = usePathname()
  // CMS links are stored locale-LESS; resolve them for the active locale (derived from the URL).
  const locale = localeFromPath(path)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const open = openIndex !== null

  const { compact, setInteracting } = useNavState()
  const reduce = useReducedMotion() ?? false

  const menu = useMemo(() => (headerData?.menu ?? []).filter((m) => m?.label), [headerData?.menu])
  const secondaryLinks = useMemo(
    () => (headerData?.secondaryLinks ?? []).filter((s) => s?.label),
    [headerData?.secondaryLinks],
  )
  const cta = headerData?.button
  const logoUrl = getLogoUrl(headerData?.logo)
  const firstMega = useMemo(() => menu.findIndex(isMega), [menu])

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

  const LogoMark = (
    <>
      {logoUrl ? (
        <Image
          src={logoUrl}
          width={30}
          height={30}
          alt=""
          className={cn('h-[30px] w-auto transition-[height] duration-200', reduce && compact && 'h-[26px]')}
        />
      ) : (
        <TernaryMark
          className={cn('h-[30px] w-auto text-cream transition-[height] duration-200', reduce && compact && 'h-[26px]')}
        />
      )}
    </>
  )

  const Logo = (
    <Link
      href={localizedHref(locale, '/')}
      className="flex shrink-0 items-center gap-2.5"
      aria-label={headerData?.siteName || 'Ternary'}
      onClick={() => setOpenIndex(null)}
    >
      {LogoMark}
    </Link>
  )

  return (
    <>
      {/* Outer fixed positioner — centers the floating pill and stays click-through outside it. */}
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-4 pointer-events-none">
        <motion.header
          className={cn(
            'pointer-events-auto w-full max-w-7xl rounded-2xl px-5 glass',
            reduce && (compact ? 'py-2' : 'py-3.5'),
          )}
          initial={false}
          animate={reduce ? undefined : compact ? 'compact' : 'expanded'}
          variants={{
            expanded: { paddingTop: 14, paddingBottom: 14, scale: 1 },
            compact: { paddingTop: 8, paddingBottom: 8, scale: 0.97 },
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.7 }}
          style={{ transformOrigin: 'top center' }}
          onMouseEnter={() => setInteracting(true)}
          onMouseLeave={() => setInteracting(false)}
          onFocus={() => setInteracting(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInteracting(false)
          }}
        >
          <div className="flex w-full flex-row items-center justify-between gap-4">
            {Logo}

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-0.5 md:flex">
              {menu.map((entry, i) => {
                const mega = isMega(entry)
                const active = i === openIndex
                const itemClass = cn(
                  'flex items-center gap-1 rounded-md px-3.5 py-2 text-[14px] font-semibold leading-[1.15] tracking-normal text-cream transition-colors duration-200 hover:bg-white/[0.06]',
                  active && 'bg-white/[0.06]',
                )
                if (mega) {
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-haspopup="dialog"
                      aria-expanded={active}
                      onClick={() => setOpenIndex(active ? null : i)}
                      className={itemClass}
                    >
                      <span>{entry.label}</span>
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          'size-3 text-cream/60 transition-transform duration-200',
                          active && 'rotate-180 text-cream',
                        )}
                      />
                    </button>
                  )
                }
                const itemActive = entry.link && path === localizedHref(locale, entry.link)
                return (
                  <Link
                    key={i}
                    href={localizedHref(locale, entry.link)}
                    className={cn(itemClass, itemActive && 'bg-white/[0.06]')}
                    aria-current={itemActive ? 'page' : undefined}
                  >
                    {entry.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right cluster: CTA (desktop) + hamburger (mobile) */}
            <div className="flex items-center gap-2">
              {cta?.label && (
                <Link
                  href={localizedHref(locale, cta.link)}
                  className="hidden items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-[13px] font-semibold text-page transition-colors hover:bg-cream-hover md:inline-flex"
                >
                  {cta.label}
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              )}
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : firstMega >= 0 ? firstMega : 0)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-cream transition-colors duration-200 hover:bg-white/[0.06] active:scale-95 md:hidden"
              >
                <Menu className="size-6" />
              </button>
            </div>
          </div>
        </motion.header>
      </div>

      <MegaMenuOverlay
        open={open}
        menu={menu}
        secondaryLinks={secondaryLinks}
        cta={cta}
        exploreLabel={headerData?.exploreLabel}
        locale={locale}
        activeIndex={openIndex}
        onActiveIndex={setOpenIndex}
        onClose={() => setOpenIndex(null)}
        reduce={reduce}
        logo={Logo}
      />
    </>
  )
}
