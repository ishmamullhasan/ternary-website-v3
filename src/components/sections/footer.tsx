'use client'

import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import Image from 'next/image'

type MenuItem = { label?: string | null; link?: string | null }
type MediaWithUrl = { url?: string | null }

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Ternary combination mark, inlined from the brand asset (public/favicon.svg) so the lockup always
 * renders — the CMS logo media lives on S3 and degrades to a broken box locally. currentColor lets
 * the cream fill flow from the surrounding text token.
 */
function TernaryMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 123 140" fill="currentColor" className={className} aria-hidden role="presentation">
      <path d="M60.2569 118.758L18.9035 94.9917C18.4016 94.6917 18.067 94.1583 18.067 93.5583V56.825C18.067 56.1917 18.7696 55.7917 19.3049 56.0917L67.3164 83.6917C67.9855 84.0917 68.822 83.5917 68.822 82.825V64.925C68.822 64.225 68.4539 63.5583 67.8182 63.1917L10.0707 29.9917C9.56883 29.6917 8.89968 29.6917 8.39782 29.9917L0.836436 34.3583C0.334574 34.6583 0 35.1917 0 35.7917V104.025C0 104.625 0.334574 105.158 0.836436 105.458L60.1565 139.592C60.6583 139.892 61.3275 139.892 61.8293 139.592L111.647 110.925C112.317 110.525 112.317 109.592 111.647 109.192L96.1232 100.258C95.4875 99.8917 94.7515 99.8917 94.1158 100.258L61.9632 118.758C61.4613 119.058 60.7922 119.058 60.2903 118.758H60.2569Z" />
      <path d="M121.149 34.325L61.8294 0.225C61.3275 -0.075 60.6584 -0.075 60.1565 0.225L28.8069 18.2583C28.1378 18.6583 28.1378 19.5917 28.8069 19.9917L44.1973 28.8583C44.833 29.225 45.5691 29.225 46.2048 28.8583L60.2569 20.7917C60.7588 20.4917 61.4279 20.4917 61.9298 20.7917L103.283 44.5583C103.785 44.8583 104.12 45.3917 104.12 45.9917V82.8917C104.12 83.5917 104.488 84.2583 105.123 84.625L120.514 93.4583C121.183 93.8583 122.019 93.3583 122.019 92.5917V35.7917C122.019 35.1917 121.685 34.6583 121.183 34.3583L121.149 34.325Z" />
    </svg>
  )
}

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
  index = 0,
}: {
  heading?: string | null
  items?: MenuItem[] | null
  prefix: string
  index?: number
}) {
  const menuItems = items?.filter((item) => item?.label) ?? []

  // A column with no items and no heading carries nothing — drop it rather than leaving a gap.
  if (!menuItems.length && !heading) return null

  return (
    <Motion
      tag="div"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: EASE, delay: Math.min(index * 0.06, 0.3) }}
      className="flex flex-col gap-2 p-2"
    >
      {/* Heading: Inter Medium 16px, tracking −0.8px (= body's −0.05em at 16px), cream */}
      {heading && <span className="text-[16px] font-medium tracking-[-0.05em] text-cream">{heading}</span>}

      <div className="flex flex-col gap-2">
        {menuItems.map((item, idx) => (
          <Link
            href={item.link ?? '#'}
            key={`${prefix}-link-${idx}`}
            // Links: Inter Regular 14px, tracking −0.7px, cream — muted at rest, lifting to full
            // cream on hover/focus.
            className="w-fit text-[14px] font-normal tracking-[-0.05em] text-cream/70 transition-colors duration-150 hover:text-cream focus-visible:text-cream"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </Motion>
  )
}

export default function Footer({ footerData }: FooterProps) {
  const logoUrl = getLogoUrl(footerData?.menu_1?.logo)
  const siteName = footerData?.menu_1?.siteName?.trim() || 'Ternary'
  const description = footerData?.menu_1?.description?.trim()
  // Only surface a copyright line when the CMS has a real legal string — never the literal
  // "Copyright" placeholder that some seed rows carry.
  const rawCopyright = footerData?.menu_1?.copyright?.trim()
  const copyright =
    rawCopyright && rawCopyright.toLowerCase() !== 'copyright' && rawCopyright.toLowerCase() !== 'copyright text'
      ? rawCopyright
      : null

  return (
    <footer className="mx-auto w-full max-w-7xl px-5 py-16">
      {/* Top text row — logo block + the four link columns, space-between on desktop */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
        {/* Logo block (gap24) — combination mark + wordmark, then the two-line tagline */}
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="col-span-2 flex flex-col gap-6 sm:col-span-3 lg:col-span-1"
        >
          <Link href="/" className="flex w-fit items-center gap-2.5" aria-label={siteName}>
            {logoUrl ? (
              <Image src={logoUrl} width={32} height={32} alt="" className="h-8 w-8" />
            ) : (
              // Inline brand mark fallback — CMS logo media (S3) degrades to a broken box, the mark does not.
              <TernaryMark className="h-8 w-auto text-cream" />
            )}
            <span className="text-[24px] font-medium leading-none tracking-[-0.04em] text-cream">{siteName}</span>
          </Link>

          {/* Tagline: two lines, Inter Regular 16px, tracking −0.8px. whitespace-pre-line honors the
              CMS line break; falls back to the designed two-line copy if the field is empty. */}
          <span className="max-w-[16rem] whitespace-pre-line text-[16px] font-normal leading-[1.3] tracking-[-0.05em] text-cream">
            {description || 'Agentic Engineering.\nHuman Orchestration.'}
          </span>
        </Motion>

        {/* Capabilities */}
        <FooterMenuColumn
          heading="Capabilities"
          index={1}
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
          index={2}
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
          index={3}
          items={
            footerData?.industries?.map((item) => ({
              label: item.title,
              link: `/industries/${item.slug}`,
            })) ?? null
          }
          prefix="industries"
        />

        {/* Company (menu_4) */}
        <FooterMenuColumn heading="Company" index={4} items={footerData?.menu_4?.menu ?? null} prefix="company" />
      </div>

      {/* Bottom full-width row — legal line, only when present */}
      {copyright && (
        <div className="mt-16 border-t border-white/[0.08] pt-6">
          <span className="text-[14px] font-normal tracking-[-0.05em] text-cream/70">{copyright}</span>
        </div>
      )}
    </footer>
  )
}
