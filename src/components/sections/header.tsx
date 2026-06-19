'use client'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'
import { ChevronDown, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type SubMenuItem = { label?: string | null; link?: string | null }
type MenuItem = { label?: string | null; link?: string | null; subItems?: SubMenuItem[] | null }
type MediaWithUrl = { url?: string | null }

interface HeaderData {
  logo?: MediaWithUrl | string | null
  siteName?: string | null
  menu?: MenuItem[] | null
  button?: { label?: string | null; link?: string | null } | null
}

interface HeaderProps {
  headerData?: HeaderData | null
}

function getLogoUrl(logo: MediaWithUrl | string | null | undefined): string | null {
  if (!logo) return null
  if (typeof logo === 'string') return null
  const url = logo?.url
  return url ? getMediaUrl(url) : null
}

/**
 * Ternary combination mark, inlined from the brand asset (public/favicon.svg). Rendering it as
 * SVG paths rather than an <Image> means the mark always appears — the CMS logo media lives on S3
 * and degrades to a broken box locally — and stays crisp at any size. currentColor lets the cream
 * fill flow from the surrounding text token. The design shows the 30px mark only (no wordmark) in
 * the nav bar, so the wordmark text is opt-in for the footer lockup.
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
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<{ [key: string]: boolean }>({})
  const panelRef = useRef<HTMLDivElement>(null)
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const menuItems = headerData?.menu?.filter((item) => item?.label) ?? []
  const logoUrl = getLogoUrl(headerData?.logo)

  useEffect(() => {
    setOpen(false)
    setActiveDropdown(null)
    setMobileSubmenuOpen({})
  }, [path])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!open && !activeDropdown) return

      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }

      if (activeDropdown) {
        const activeRef = dropdownRefs.current[activeDropdown]
        if (activeRef && !activeRef.contains(e.target as Node)) {
          setActiveDropdown(null)
        }
      }
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open, activeDropdown])

  const toggleMobileSubmenu = (itemId: string) => {
    setMobileSubmenuOpen((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const DesktopNav = (
    <div className="flex items-center gap-1">
      {menuItems.map((item, i) => {
        const hasSubmenu = item.subItems && item.subItems.length > 0
        const itemId = `item-${i}`
        const isDropdownActive = activeDropdown === itemId
        // Active when the route matches the item or any of its sub-items (so a nested page still
        // lights the parent in the bar).
        const itemActive =
          (item.link && path === item.link) || item.subItems?.some((s) => s.link && path === s.link) || false

        // Nav item type per design (UI/Nav Item): Inter Medium 14px, tracking 0 (reset from the
        // body's −0.05em), in the cream text token. Item box = px16/py8, radius/md.
        const itemClass = cn(
          'flex items-center gap-1 rounded-md px-4 py-2 text-[14px] font-medium leading-[1.15] tracking-normal text-cream',
          'transition-colors duration-200 hover:bg-white/[0.06]',
          itemActive || isDropdownActive ? 'bg-white/[0.06]' : 'text-cream/85 hover:text-cream',
        )

        if (hasSubmenu) {
          return (
            <div
              key={i}
              className="relative"
              ref={(el) => {
                dropdownRefs.current[itemId] = el
              }}
              onMouseEnter={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                setActiveDropdown(itemId)
              }}
              onMouseLeave={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                timeoutRef.current = setTimeout(() => setActiveDropdown(null), 220)
              }}
            >
              <Link
                href={item.link || '#'}
                aria-haspopup="menu"
                aria-expanded={isDropdownActive}
                // Keyboard users can open the panel by focusing the trigger; blur is handled by the
                // click-outside / Escape listeners.
                onFocus={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current)
                  setActiveDropdown(itemId)
                }}
                className={itemClass}
              >
                <span>{item.label || 'Label'}</span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    'size-3 text-cream/60 transition-transform duration-200',
                    isDropdownActive && 'rotate-180 text-cream',
                  )}
                />
              </Link>

              {isDropdownActive && item.subItems && item.subItems.length > 0 && (
                <div
                  role="menu"
                  className="absolute top-full left-0 mt-2 min-w-[220px] origin-top rounded-md border border-white/10 bg-ink/95 p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md supports-[backdrop-filter]:bg-ink/80"
                >
                  {item.subItems.map((subItem, j) => {
                    const subHref = subItem.link || '#'
                    const subActive = path === subHref
                    return (
                      <Link
                        key={j}
                        href={subHref}
                        role="menuitem"
                        className={cn(
                          'block rounded-sm px-3 py-2 text-[14px] font-medium tracking-normal transition-colors duration-150',
                          subActive
                            ? 'bg-white/[0.08] text-cream'
                            : 'text-cream/75 hover:bg-white/[0.06] hover:text-cream',
                        )}
                      >
                        {subItem.label || 'Submenu Item'}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        } else {
          const href = item.link || '#'
          return (
            <Link
              key={i}
              href={href}
              className={cn(itemClass, 'relative')}
              aria-current={itemActive ? 'page' : undefined}
            >
              {item.label || 'Label'}
            </Link>
          )
        }
      })}
    </div>
  )

  // CTA per design: Surface/Card fill, radius/md, px16 py8, Inter SemiBold 14px, cream text, NO
  // border. Hover lifts the fill a touch rather than inverting.
  const ctaClass =
    'inline-flex items-center justify-center rounded-md bg-main px-4 py-2 text-[14px] font-semibold leading-[1.15] tracking-normal text-cream transition-colors duration-200 hover:bg-[#26241f]'

  const Logo = (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={headerData?.siteName || 'Ternary'}>
      {logoUrl ? (
        <Image src={logoUrl} width={30} height={30} alt="" className="h-[30px] w-[30px]" />
      ) : (
        // Inline brand mark fallback — CMS logo media (S3) degrades to a broken box, the mark does not.
        <TernaryMark className="h-[30px] w-auto text-cream" />
      )}
    </Link>
  )

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-[background-color,box-shadow,backdrop-filter] duration-300',
        // Resting state carries a faint scrim + blur so nav text always holds contrast over the hero;
        // scrolling deepens it into the surface tone.
        scrolled
          ? 'border-b border-white/[0.06] bg-page/80 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md supports-[backdrop-filter]:bg-page/65'
          : 'bg-page/40 backdrop-blur-sm supports-[backdrop-filter]:bg-page/20',
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between px-5 py-3">
        {/* Logo — combination mark only (design shows no wordmark beside it in the bar) */}
        {Logo}

        {/* Desktop Navigation - center */}
        <div className="hidden md:flex flex-1 justify-center">{DesktopNav}</div>

        {/* Desktop CTA - right (fixed min width keeps the menu optically centered) */}
        <div className="hidden md:flex shrink-0 min-w-[110px] justify-end">
          {headerData?.button?.label && (
            <Link href={headerData.button.link ?? '#'} className={ctaClass}>
              {headerData.button.label}
            </Link>
          )}
        </div>

        {/* Mobile: CTA + menu toggle - right */}
        <div className="flex items-center gap-2 md:hidden">
          {headerData?.button?.label && (
            <Link href={headerData.button.link ?? '#'} className={cn(ctaClass, 'hidden sm:inline-flex')}>
              {headerData.button.label}
            </Link>
          )}
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-cream transition-colors duration-200 hover:bg-white/[0.06] active:scale-95"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Panel */}
      <div
        id="mobile-nav"
        ref={panelRef}
        className={cn(
          'fixed inset-x-0 top-16 z-[110] w-full max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-page/95 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md supports-[backdrop-filter]:bg-page/85 md:hidden',
          open ? 'animate-[accordion-down_200ms_ease-out]' : 'hidden',
        )}
      >
        <div className="flex flex-col px-4 py-3">
          {menuItems.map((item, i) => {
            const hasSubmenu = item.subItems && item.subItems.length > 0
            const itemId = `item-${i}`
            const isSubmenuOpen = mobileSubmenuOpen[itemId]
            const itemActive =
              (item.link && path === item.link) || item.subItems?.some((s) => s.link && path === s.link) || false

            if (hasSubmenu) {
              return (
                <div key={i} className="border-b border-white/[0.08] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => toggleMobileSubmenu(itemId)}
                    aria-expanded={isSubmenuOpen}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-3 text-[15px] font-medium tracking-normal transition-colors duration-200',
                      itemActive ? 'text-cream' : 'text-cream/85 hover:text-cream',
                    )}
                  >
                    <span>{item.label || 'Label'}</span>
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        'size-4 text-cream/60 transition-transform duration-200',
                        isSubmenuOpen && 'rotate-180 text-cream',
                      )}
                    />
                  </button>

                  {isSubmenuOpen && (
                    <div className="flex flex-col gap-0.5 pb-2 pl-3">
                      {item.subItems?.map((subItem, j) => {
                        const subHref = subItem.link || '#'
                        const subActive = path === subHref
                        return (
                          <Link
                            key={j}
                            href={subHref}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'block rounded-sm px-3 py-2 text-[14px] font-medium tracking-normal transition-colors duration-150',
                              subActive
                                ? 'bg-white/[0.08] text-cream'
                                : 'text-cream/70 hover:bg-white/[0.06] hover:text-cream',
                            )}
                          >
                            {subItem.label || 'Submenu Item'}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            } else {
              const href = item.link || '#'
              return (
                <Link
                  key={i}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={itemActive ? 'page' : undefined}
                  className={cn(
                    'block rounded-md px-3 py-3 text-[15px] font-medium tracking-normal transition-colors duration-200 border-b border-white/[0.08] last:border-b-0',
                    itemActive ? 'text-cream' : 'text-cream/85 hover:text-cream',
                  )}
                >
                  {item.label || 'Label'}
                </Link>
              )
            }
          })}

          {/* CTA inside the mobile sheet so "Get in Touch" is always reachable below md */}
          {headerData?.button?.label && (
            <Link
              href={headerData.button.link ?? '#'}
              onClick={() => setOpen(false)}
              className={cn(ctaClass, 'mt-3 w-full')}
            >
              {headerData.button.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
