'use client'

import { useState } from 'react'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type MenuItem = { label?: string | null; link?: string | null }
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuItems = headerData?.menu?.filter((item) => item?.label) ?? []
  const logoUrl = getLogoUrl(headerData?.logo)

  return (
    <header className="w-full pt-3">
      <div className="flex flex-row w-full justify-between px-5 md:px-10  py-3 items-center">
        {/* Logo */}
        <Link href="/" className="pt-3">
          {logoUrl ? (
            <Image src={logoUrl} width={100} height={30} alt={headerData?.siteName ?? 'Logo'} />
          ) : (
            <span className="text-lg font-medium">{headerData?.siteName ?? ''}</span>
          )}
        </Link>

        {/* Hamburger Icon */}
        <button
          className="md:hidden text-2xl bg-transparent hover:bg-transparent text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <Menu className="size-6" />
        </button>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="flex gap-6 font-medium text-sm">
            {menuItems.map((item, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink asChild>
                  <Link href={item.link ?? '#'} className="hover:bg-muted py-2 px-4 rounded-lg">
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <button
          className="text-sm bg-transparent hover:bg-transparent text-black"
         
        >
          <Link href={headerData?.button?.link ?? '#'} className="hover:bg-muted py-2 px-4 rounded-lg">
            {headerData?.button?.label}
          </Link>
        </button>
      </div>

      {/* Mobile Navigation with Animation */}
      <div
        className={`transition-all duration-1200  ease-in-out mt-3  ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden md:hidden bg-muted`}
      >
        <NavigationMenu className="mt-3">
          <NavigationMenuList className="flex flex-col items-start gap-4 px-10 pb-4 font-medium text-sm">
            {menuItems.map((item, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.link ?? '#'}
                    className="hover:text-gray-400 py-2 px-4 rounded-lg"
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}
