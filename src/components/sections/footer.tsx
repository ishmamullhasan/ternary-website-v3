'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import Link from 'next/link'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type MenuItem = { label?: string | null; link?: string | null }
type MenuGroup = { heading?: string | null; menu?: MenuItem[] | null }
type MediaWithUrl = { url?: string | null }

interface FooterProps {
  footerData?: {
    logo?: MediaWithUrl | string | null
    siteName?: string | null
    description?: string | null
    copyright?: string | null
    // contact?: {
    //   heading?: string | null
    //   subtext?: string | null
    //   emailPlaceholder?: string | null
    //   privacyText?: string | null
    // } | null
    menu_1?: MenuGroup | null
    menu_2?: MenuGroup | null
    menu_3?: MenuGroup | null
    menu_4?: MenuGroup | null
    menu_5?: MenuGroup | null
  } | null
}

// Default values - remove when Payload data is populated
// const DEFAULTS = {
//   contactHeading: 'Get in Touch.',
//   contactSubtext: 'Now in over 50 sectors and industries worldwide.',
//   emailPlaceholder: 'Email',
//   privacyText:
//     'By clicking on "Submit" button, you agree to our Privacy Policy, and allow Ternary Solutions, Inc. and its agents and affiliates to use this information to contact you.',
//   copyright: '© Ternary Solutions, Inc. All rights reserved.',
//   description: 'Delivering products that shape the lives of millions every single day.',
// }

function getLogoUrl(logo: MediaWithUrl | string | null | undefined): string | null {
  if (!logo) return null
  if (typeof logo === 'string') return null
  const url = logo?.url
  return url ? getMediaUrl(url) : null
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

  return (
    <div className="flex flex-col gap-3">
      {heading && <span className="text-xs font-medium opacity-60">{heading}</span>}
      <div className="flex flex-col gap-1">
        {menuItems.map((item, idx) => (
          <Link
            href={item.link ?? '#'}
            key={`${prefix}-link-${idx}`}
            className="group relative w-fit inline-block"
          >
            <span className="font-light text-sm">{item.label}</span>
            <div className="bottom-0 left-0 w-full h-px overflow-hidden">
              <div className="h-full w-full bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-200 ease-out" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function Footer({ footerData }: FooterProps) {
  const logoUrl = getLogoUrl(footerData?.logo)
  // const contact = footerData?.contact
  // // const description = footerData?.description ?? DEFAULTS.description
  //  const copyright = footerData?.copyright ?? DEFAULTS.copyright
  // const contactHeading = contact?.heading ?? DEFAULTS.contactHeading
  // const contactSubtext = contact?.subtext ?? DEFAULTS.contactSubtext
  // const emailPlaceholder = contact?.emailPlaceholder ?? DEFAULTS.emailPlaceholder
  // const privacyText = contact?.privacyText ?? DEFAULTS.privacyText

  const menuColumns = [
    { data: footerData?.menu_1, prefix: 'menu1' },
    { data: footerData?.menu_2, prefix: 'menu2' },
    { data: footerData?.menu_3, prefix: 'menu3' },
    { data: footerData?.menu_4, prefix: 'menu4' },
    { data: footerData?.menu_5, prefix: 'menu5' },
  ]

  return (
    <footer className="flex flex-col px-6 md:px-10 py-6 pb-14 -mt-20 lg:mt-0">
      {/* Contact Section */}
      {/* <div className="grid grid-cols-1 md:grid-cols-10 gap-4 w-full justify-between pb-16">
        <h2 className="scroll-m-20 text-3xl font-light tracking-tight lg:text-4xl col-span-1 md:col-span-4">
          {contactHeading}
        </h2>
        <p className="col-span-1 md:col-span-2 text-sm md:text-base">{contactSubtext}</p>
        <div className="flex flex-col col-span-1 md:col-span-4 w-full gap-2">
          <div className="flex w-full">
            <Input className="rounded-r-none" placeholder={emailPlaceholder} />
            <Button className="rounded-l-none" variant="secondary">
              Submit
            </Button>
          </div>
          {privacyText && (
            <div className="flex flex-row items-center gap-1">
              <span className="text-xs leading-tight opacity-60 mt-2 lg:mt-0">{privacyText}</span>
            </div>
          )}
        </div>
      </div> */}

      <Separator className="mb-16" />
      {/* Footer Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-4">
        {/* Column 1: Logo and Description */}
        <div className="flex flex-col col-span-1 md:col-span-2 gap-3 h-full justify-between">
          <div className="flex flex-col gap-6">
            {logoUrl ? (
              <Image src={logoUrl} width={35} height={35} alt={footerData?.siteName ?? 'Logo'} />
            ) : (
              footerData?.siteName && (
                <span className="text-lg font-medium">{footerData.siteName}</span>
              )
            )}
            {footerData?.description && (
              <span className="font-light leading-5 text-sm md:text-base whitespace-pre-line">
                {footerData?.description}
              </span>
            )}
          </div>
          <span className="font-light text-xs md:text-sm">
            {footerData?.copyright }
          </span>
        </div>

        {/* Column 2: menu_1 (CAPABILITIES) */}
        <FooterMenuColumn
          heading={menuColumns[0].data?.heading}
          items={menuColumns[0].data?.menu}
          prefix={menuColumns[0].prefix}
        />

        {/* Column 3: menu_2 (SOLUTIONS) and menu_3 (STORIES) */}
        <div className="flex flex-col gap-6">
          <FooterMenuColumn
            heading={menuColumns[1].data?.heading}
            items={menuColumns[1].data?.menu}
            prefix={menuColumns[1].prefix}
          />
        </div>

        {/* Column 4: menu_4 (CAREERS) and menu_5 (COMPANY) */}
        <div className="flex flex-col gap-6">
          <FooterMenuColumn
            heading={menuColumns[2].data?.heading}
            items={menuColumns[2].data?.menu}
            prefix={menuColumns[2].prefix}
          />
        </div>
        <div className="flex flex-col gap-6">
          <FooterMenuColumn
            heading={menuColumns[3].data?.heading}
            items={menuColumns[3].data?.menu}
            prefix={menuColumns[3].prefix}
          />
        </div>
      </div>
    </footer>
  )
}
