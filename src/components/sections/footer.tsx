'use client'

import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import Image from 'next/image'

type MenuItem = { label?: string | null; link?: string | null }
type MediaWithUrl = { url?: string | null }

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Ternary combination mark, inlined from the brand asset (public/icon/favicon.svg) so the lockup always
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
      // richText since the description→Lexical migration; string kept for legacy DB rows.
      description?: RichText | string | null
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

    resources?: {
      heading?: string | null
      menu?:
        | {
            label?: string | null
            link?: string | null
          }[]
        | null
    } | null

    legalLinks?:
      | {
          label?: string | null
          link?: string | null
        }[]
      | null

    socialLinks?:
      | {
          platform?: string | null
          link?: string | null
        }[]
      | null

    partners?:
      | {
          logo?: MediaWithUrl | null
          name?: string | null
          link?: string | null
        }[]
      | null
  } | null
}

type SocialPlatform = 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'github'

// Inline brand glyphs (currentColor, 24 viewBox) so the icon row always renders — no S3 media round-trip
// and no broken box, matching the TernaryMark fallback pattern above.
const SOCIAL_PATHS: Record<SocialPlatform, string> = {
  facebook:
    'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
  twitter:
    'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  youtube:
    'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
}

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  twitter: 'X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  github: 'GitHub',
}

// Rendered when the CMS has no social rows yet, so the icon row matches the design out of the box.
const DEFAULT_SOCIALS: { platform: SocialPlatform; link: string }[] = [
  { platform: 'facebook', link: '#' },
  { platform: 'twitter', link: '#' },
  { platform: 'linkedin', link: '#' },
  { platform: 'instagram', link: '#' },
]

function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden role="presentation">
      <path d={SOCIAL_PATHS[platform]} />
    </svg>
  )
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
      {/* Heading: Inter Medium 16px, tracking −0.8px (= body's −0.05em at 16px), line-height 1.15, cream */}
      {heading && (
        <span className="text-[16px] font-medium leading-[1.15] tracking-[-0.05em] text-cream">{heading}</span>
      )}

      <div className="flex flex-col gap-2">
        {menuItems.map((item, idx) => (
          <Link
            href={item.link ?? '#'}
            key={`${prefix}-link-${idx}`}
            // Links: Inter Regular 14px, tracking −0.7px, line-height 1.15, full Text/Primary cream
            // at rest (matches Figma), with a subtle dim on hover/focus that never starts muted.
            className="w-fit text-[14px] font-normal leading-[1.15] tracking-[-0.05em] text-cream transition-colors duration-150 hover:text-cream/80 focus-visible:text-cream/80"
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
  const rawDescription = footerData?.menu_1?.description
  const description = typeof rawDescription === 'string' ? rawDescription.trim() : rawDescription
  // Use the CMS legal string when it's a real value — never the literal "Copyright" placeholder
  // that some seed rows carry — and fall back to the designed line so the row always renders.
  const rawCopyright = footerData?.menu_1?.copyright?.trim()
  const copyright =
    rawCopyright && rawCopyright.toLowerCase() !== 'copyright' && rawCopyright.toLowerCase() !== 'copyright text'
      ? rawCopyright
      : null
  const legal = copyright || '© Ternary Limited and its subsidiaries. All Rights Reserved.'
  const legalLinks = (footerData?.legalLinks ?? []).filter((item) => item?.label && item?.link)

  // Social icons: keep only rows with a known platform + link; fall back to the designed set when empty.
  const cmsSocials = (footerData?.socialLinks ?? []).filter(
    (s): s is { platform: SocialPlatform; link: string } => !!s?.link && !!s?.platform && s.platform in SOCIAL_PATHS,
  )
  const socials = cmsSocials.length > 0 ? cmsSocials : DEFAULT_SOCIALS

  // Partner pill badges (bottom-right). A row shows if it has a logo image or at least a name to render.
  const partners = (footerData?.partners ?? []).filter((p) => getLogoUrl(p?.logo) || p?.name?.trim())

  return (
    <footer className="mx-auto w-full max-w-7xl px-5 md:px-8 lg:px-12 py-16">
      {/* Top text row — logo block + the five link columns, space-between on desktop */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
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

          {/* Tagline: two lines, Inter Regular 16px, tracking −0.8px, line-height 1.15 (Body/Regular).
              whitespace-pre-line honors the CMS line break; falls back to the designed two-line copy
              if the field is empty. Width matches the ~151px Figma tagline column. */}
          {description ? (
            <RichTextComp
              content={description as RichText}
              className="max-w-[10rem] prose-p:mb-0 prose-p:whitespace-pre-line prose-p:text-[16px] prose-p:font-normal prose-p:leading-[1.15] prose-p:tracking-[-0.05em] prose-p:text-cream"
            />
          ) : (
            <span className="max-w-[10rem] whitespace-pre-line text-[16px] font-normal leading-[1.15] tracking-[-0.05em] text-cream">
              {'Agentic Engineering.\nHuman Orchestration.'}
            </span>
          )}
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

        {/* Resources — Stories, Scales, Newsroom, Engagement model, Search */}
        <FooterMenuColumn
          heading="Resources"
          index={5}
          items={footerData?.resources?.menu ?? null}
          prefix="resources"
        />
      </div>

      {/* Hairline divider (Figma Line 4) between the link columns and the bottom bar. */}
      <div className="mt-12 h-px w-full bg-cream/15" />

      {/* Bottom bar — social + legal + copyright on the left, partner badges on the right.
          space-between on desktop; stacks (badges first) on smaller screens. */}
      <div className="flex flex-col-reverse gap-10 pt-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-12">
        {/* Left stack (gap24): social icons → legal links → copyright */}
        <div className="flex flex-col gap-6">
          {/* Social icons: 44px squares (12px pad + 20px glyph), white/10 fill, 5px radius, 12px gap */}
          {socials.length > 0 && (
            <nav className="flex flex-wrap justify-center gap-3 lg:justify-start" aria-label="Social media">
              {socials.map((s, idx) => (
                <Link
                  href={s.link || '#'}
                  key={`social-${s.platform}-${idx}`}
                  aria-label={SOCIAL_LABELS[s.platform]}
                  className="flex items-center justify-center rounded-[5px] bg-white/10 p-3 text-cream transition-colors duration-150 hover:bg-white/20 focus-visible:bg-white/20"
                >
                  <SocialIcon platform={s.platform} className="size-5" />
                </Link>
              ))}
            </nav>
          )}

          {/* Legal links — inline, dot-separated (Figma 5px ellipse), Inter Regular 14px cream.
              The separator trails its link rather than leading the next one, so a line that wraps on
              a narrow viewport never opens with an orphaned dot. */}
          {legalLinks.length > 0 && (
            <nav
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-start"
              aria-label="Legal"
            >
              {legalLinks.map((item, idx) => (
                <span className="flex items-center gap-x-4" key={`legal-link-${idx}`}>
                  <Link
                    href={item.link ?? '#'}
                    className="text-[14px] font-normal leading-[1.15] tracking-[-0.05em] text-cream transition-colors duration-150 hover:text-cream/80 focus-visible:text-cream/80"
                  >
                    {item.label}
                  </Link>
                  {idx < legalLinks.length - 1 && (
                    <span aria-hidden className="size-[5px] shrink-0 rounded-full bg-cream/90" />
                  )}
                </span>
              ))}
            </nav>
          )}

          {/* Copyright line */}
          <span className="text-center text-[14px] font-normal leading-[1.15] tracking-[-0.05em] text-cream/90 lg:text-left">
            {legal}
          </span>
        </div>

        {/* Partner badges — white circular pills each wrapping a logo, optional link. Sized down and
            kept on a single line (flex-nowrap) so the row never breaks onto a second line. */}
        {partners.length > 0 && (
          <div className="flex flex-nowrap items-center justify-center gap-3 lg:justify-start">
            {partners.map((partner, idx) => {
              const partnerLogo = getLogoUrl(partner?.logo)
              const partnerName = partner?.name?.trim() || `Partner ${idx + 1}`
              const badge = partnerLogo ? (
                <span className="block size-[60px] shrink-0 overflow-hidden rounded-full shadow-[0px_8px_12px_rgba(0,0,0,0.12)] lg:size-[80px]">
                  <Image
                    src={partnerLogo}
                    width={96}
                    height={96}
                    alt={partnerName}
                    className="size-full object-cover"
                  />
                </span>
              ) : (
                <span className="flex size-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-2 shadow-[0px_8px_12px_rgba(0,0,0,0.12)] lg:size-[80px]">
                  <span className="text-center text-[10px] font-medium leading-[1.15] tracking-[-0.05em] text-[#050505]">
                    {partnerName}
                  </span>
                </span>
              )
              return partner?.link ? (
                <Link
                  href={partner.link}
                  key={`partner-${idx}`}
                  aria-label={partnerName}
                  className="transition-transform duration-150 hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
                >
                  {badge}
                </Link>
              ) : (
                <div key={`partner-${idx}`}>{badge}</div>
              )
            })}
          </div>
        )}
      </div>
    </footer>
  )
}
