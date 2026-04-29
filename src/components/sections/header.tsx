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

export default function Header({ headerData }: HeaderProps) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
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
    <div className="flex items-center gap-8">
      {menuItems.map((item, i) => {
        const hasSubmenu = item.subItems && item.subItems.length > 0
        const itemId = `item-${i}`
        const isDropdownActive = activeDropdown === itemId

        if (hasSubmenu) {
          return (
            <div
              key={i}
              className="relative"
              ref={(el) => {
                dropdownRefs.current[itemId] = el
              }}
            >
              <Link
                href={item.link || '#'}
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current)
                  setActiveDropdown(itemId)
                }}
                onMouseLeave={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current)
                  timeoutRef.current = setTimeout(() => setActiveDropdown(null), 500)
                }}
                className={cn(
                  'flex items-center gap-1 font-medium text-sm transition-colors duration-200 relative',
                  isDropdownActive ? 'text-secondary' : 'opacity-90 hover:opacity-100',
                )}
              >
                <span>{item.label || 'Label'}</span>
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform duration-200', isDropdownActive ? 'rotate-180' : '')}
                />
              </Link>

              {isDropdownActive && (
                <div
                  onMouseEnter={() => {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current)
                    setActiveDropdown(itemId)
                  }}
                  onMouseLeave={() => {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current)
                    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 100)
                  }}
                  className="absolute top-full left-0 mt-1 min-w-[200px] rounded-2xl border border-white/10 bg-primary/95 py-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-primary/80"
                >
                  {item.subItems?.map((subItem, j) => {
                    const subHref = subItem.link || '#'
                    const subActive = path === subHref
                    return (
                      <Link
                        key={j}
                        href={subHref}
                        className={cn(
                          'm-2 rounded-lg block px-4 py-2 text-sm font-medium transition-colors duration-200',
                          subActive ? 'text-secondary bg-white/10' : 'opacity-90 hover:bg-[#1B1A17] hover:opacity-100',
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
          const active = path === href
          return (
            <Link
              key={i}
              href={href}
              className={cn(
                'font-medium text-sm transition-colors duration-200',
                active ? 'text-secondary underline underline-offset-8' : 'opacity-90 hover:opacity-100',
              )}
            >
              {item.label || 'Label'}
            </Link>
          )
        }
      })}
    </div>
  )

  return (
    <header className="w-full pt-3">
      <div className="flex flex-row w-full justify-between items-center px-5 md:px-10 py-3">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 pt-3">
          {logoUrl ? (
            <Image src={logoUrl} width={100} height={30} alt={headerData?.siteName ?? 'Logo'} />
          ) : (
            <span className="text-lg font-medium">{headerData?.siteName ?? ''}</span>
          )}
        </Link>

        {/* Desktop Navigation - center */}
        <div className="hidden md:flex flex-1 justify-center">{DesktopNav}</div>

        {/* Desktop Button - right (placeholder when no button keeps menu centered) */}
        <div className="hidden md:flex flex-shrink-0 min-w-[100px] justify-end">
          {headerData?.button?.label && (
            <Link
              href={headerData.button.link ?? '#'}
              className="rounded-lg bg-[#1B1A17] px-3 py-2 text-sm font-semibold border border-[#1B1A17] hover:bg-transparent hover:text-white"
            >
              {headerData.button.label}
            </Link>
          )}
        </div>

        {/* Mobile: button + menu toggle - right */}
        <div className="flex items-center gap-2 md:hidden">
          {/* {headerData?.button?.label && (
            <Link
              href={headerData.button.link ?? '#'}
              className="rounded-lg bg-[#1B1A17] px-3 py-2 text-sm font-semibold border border-[#1B1A17] 9hover:border-[#1B1A17] hover:bg-transparent hover:text-white"
            >
              {headerData.button.label}
            </Link>
          )} */}
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl outline-none transition active:scale-95"
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
          'fixed inset-x-0 top-16 z-[110] w-full max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-primary/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-primary/80 md:hidden',
          open ? 'animate-[accordion-down_200ms_ease-out]' : 'hidden',
        )}
      >
        <div className="flex flex-col px-4 py-3">
          {menuItems.map((item, i) => {
            const hasSubmenu = item.subItems && item.subItems.length > 0
            const itemId = `item-${i}`
            const isSubmenuOpen = mobileSubmenuOpen[itemId]

            if (hasSubmenu) {
              return (
                <div key={i} className="border-b border-[#1B1A17] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => toggleMobileSubmenu(itemId)}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-base font-medium opacity-90 transition-colors duration-200 hover:bg-[#1B1A17] hover:opacity-100"
                  >
                    <span>{item.label || 'Label'}</span>
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform duration-200', isSubmenuOpen ? 'rotate-180' : '')}
                    />
                  </button>

                  {isSubmenuOpen && (
                    <div className="pb-2 pl-4">
                      {item.subItems?.map((subItem, j) => {
                        const subHref = subItem.link || '#'
                        const subActive = path === subHref
                        return (
                          <Link
                            key={j}
                            href={subHref}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'block rounded-2xl px-3 py-2 text-sm font-medium transition-colors duration-200',
                              subActive
                                ? 'bg-white/10 text-secondary'
                                : 'opacity-80 hover:bg-[#1B1A17] hover:opacity-100',
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
              const active = path === href
              return (
                <Link
                  key={i}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block rounded-2xl px-3 py-3 text-base font-medium transition-colors duration-200 border-b border-white/10 last:border-b-0',
                    active ? 'bg-white/10 text-secondary' : 'opacity-90 hover:bg-[#1B1A17] hover:opacity-100',
                  )}
                >
                  {item.label || 'Label'}
                </Link>
              )
            }
          })}
        </div>
      </div>
    </header>
  )
}
