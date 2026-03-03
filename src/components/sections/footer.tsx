'use client'

import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import Link from 'next/link'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type MenuItem = { label?: string | null; link?: string | null }
type MediaWithUrl = { url?: string | null }

interface FooterProps {
  footerData?: {
    menu_1?: {
      logo?: MediaWithUrl | null
      siteName?: string | null
      description?: string | null
      copyright?: string | null
    } | null

    capabilities?:
      | {
          id: string
          title?: string | null
          slug?: string | null
        }[]
      | null

    solutions?:
      | {
          id: string
          title?: string | null
          slug?: string | null
        }[]
      | null

    industries?:
      | {
          id: string
          title?: string | null
          slug?: string | null
        }[]
      | null

    menu_4?: {
      heading?: string | null
      menu?:
        | {
            label?: string | null
            link?: string | null
          }[]
        | null
    } | null
  } | null
}

function getLogoUrl(logo: MediaWithUrl | null | undefined): string | null {
  if (!logo?.url) return null
  return getMediaUrl(logo.url)
}

function FooterMenuColumn({
  heading,
  items,
  prefix,
}: {
  heading?: string | null
  items?: MenuItem[] | null
  prefix: string
}) {
  const menuItems = items?.filter((item) => item?.label) ?? []

  if (!menuItems.length && !heading) return null

  return (
    <div className="flex flex-col gap-3">
      {heading && <span className="text-base font-medium">{heading}</span>}

      <div className="flex flex-col gap-1">
        {menuItems.map((item, idx) => (
          <Link href={item.link ?? '#'} key={`${prefix}-link-${idx}`}>
            <span className="font-light text-sm">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function Footer({ footerData }: FooterProps) {
  const logoUrl = getLogoUrl(footerData?.menu_1?.logo)

  return (
    <footer className="flex flex-col p-10 justify-between">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-4">
        {/* Column 1 — Logo + Description */}
        <div className="flex flex-col gap-3 h-full justify-between">
          <div className="flex flex-col gap-6">
            {logoUrl ? (
              <Image
                src={logoUrl}
                width={35}
                height={35}
                alt={footerData?.menu_1?.siteName ?? 'Logo'}
              />
            ) : (
              footerData?.menu_1?.siteName && (
                <span className="text-3xl font-light">{footerData.menu_1.siteName}</span>
              )
            )}

            {footerData?.menu_1?.description && (
              <span className="font-light leading-5 text-sm md:text-base whitespace-pre-line">
                {footerData.menu_1.description}
              </span>
            )}
          </div>

          {footerData?.menu_1?.copyright && (
            <span className="font-light text-xs md:text-sm">{footerData.menu_1.copyright}</span>
          )}
        </div>

        {/* Capabilities */}
        <FooterMenuColumn
          heading="Capabilities"
          items={
            footerData?.capabilities?.map((item) => ({
              label: item.title,
              link: `/capabilities/${item.slug}`,
            })) ?? null
          }
          prefix="capabilities"
        />

        {/* Solutions */}
        <FooterMenuColumn
          heading="Solutions"
          items={
            footerData?.solutions?.map((item) => ({
              label: item.title,
              link: `/solutions/${item.slug}`,
            })) ?? null
          }
          prefix="solutions"
        />

        {/* Industries */}
        <FooterMenuColumn
          heading="Industries"
          items={
            footerData?.industries?.map((item) => ({
              label: item.title,
              link: `/industries/${item.slug}`,
            })) ?? null
          }
          prefix="industries"
        />

        {/* Company (menu_4) */}
        <FooterMenuColumn
          heading="Company"
          items={footerData?.menu_4?.menu ?? null}
          prefix="company"
        />
      </div>
    </footer>
  )
}
