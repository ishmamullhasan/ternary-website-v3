import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { asTypedLocale, DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import type { Legal } from '@/payload-types'
import config from '@/payload.config'
import { Download, FileText, Scale, Shield, type LucideIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { PaginatedDocs, TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// SSG + ISR: prebuild known slugs (generateStaticParams below) and serve them statically, then
// revalidate every 5 minutes. dynamicParams lets slugs not in the prebuilt set render on demand.
export const revalidate = 300
export const dynamicParams = true

// Shared reveal easing/curve, matching the signature hero (heroFeatured.tsx).
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const sectionReveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' } as const,
  transition: { duration: 0.6, ease: EASE },
}

const blockReveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' } as const,
  transition: { duration: 0.5, ease: EASE },
}

// Signature noise-gradient field used by the bottom CTA — the `violet` content-type tone
// from the hero, rendered as CSS so it holds identically regardless of CMS/media availability.
const VIOLET_GRADIENT = 'radial-gradient(135% 135% at 18% 12%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)'

async function fetchLegalList(locale: TypedLocale): Promise<PaginatedDocs<Legal>> {
  const payload = await getPayload({ config })
  return payload.find({ collection: 'legal', sort: 'menuOrder', locale, limit: 100 })
}

// Tag-based ISR (WEB-457): cached + busted by `revalidateTag('legal')` (legal afterChange hook);
// bypassed in draft mode so live preview stays real-time.
async function getLegalList(locale: TypedLocale): Promise<PaginatedDocs<Legal>> {
  const { isEnabled: draft } = await draftMode()
  if (draft) return fetchLegalList(locale)
  return unstable_cache(() => fetchLegalList(locale), [`legal_list_${locale}`], { tags: ['legal'] })()
}

async function fetchLegalCenter(locale: TypedLocale) {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'legalCenter', locale })
}

// Tag-based ISR (WEB-457): cached + busted by `revalidateTag('legalCenter')` / `revalidateTag('legal')`
// (legalCenter afterChange hook); bypassed in draft mode so live preview stays real-time.
async function getLegalCenter(locale: TypedLocale) {
  const { isEnabled: draft } = await draftMode()
  if (draft) return fetchLegalCenter(locale)
  return unstable_cache(() => fetchLegalCenter(locale), [`legalCenter_${locale}`], {
    tags: ['legalCenter', 'legal'],
  })()
}

function sortLegalMenuItems(docs: Legal[]): Legal[] {
  return [...docs].sort((a, b) => {
    const orderA = a.menuOrder
    const orderB = b.menuOrder
    if (orderA != null && orderB != null && orderA !== orderB) return orderA - orderB
    if (orderA != null && orderB == null) return -1
    if (orderA == null && orderB != null) return 1
    return (a.title ?? a.slug).localeCompare(b.title ?? b.slug)
  })
}

function getMenuItemLabel(item: Legal): string {
  if (item.menuLabel) return item.menuLabel
  if (item.title) return item.title
  return item.slug
}

const LEGAL_MENU_ICONS = {
  shield: Shield,
  'file-text': FileText,
  scale: Scale,
} as const satisfies Record<string, LucideIcon>

type LegalMenuIconKey = keyof typeof LEGAL_MENU_ICONS

function LegalMenuIcon({ icon }: { icon: string | null | undefined }) {
  if (!icon || !(icon in LEGAL_MENU_ICONS)) return null
  const Icon = LEGAL_MENU_ICONS[icon as LegalMenuIconKey]
  return <Icon size={20} strokeWidth={1.75} aria-hidden className="shrink-0" />
}

// Sanitize CMS link values — seed data has a leading space on some legal CTA links
// (' /legal/privacy-policy') which breaks the href. Trim it and degrade to '#'.
function safeLink(link: string | null | undefined): string {
  const trimmed = link?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : '#'
}

async function fetchLegalBySlug(slug: string, locale: TypedLocale): Promise<PaginatedDocs<Legal>> {
  const payload = await getPayload({ config })
  return payload.find({
    collection: 'legal',
    where: {
      slug: {
        equals: slug,
      },
    },
    locale,
    depth: 2,
    limit: 1,
  })
}

// Tag-based ISR (WEB-457): published reads are cached and busted on-demand by the
// `revalidateTag('legal')` / `revalidateTag('legal_<slug>')` calls in the legal afterChange hook.
// In draft mode (live preview) we bypass the cache so editors see fresh data.
async function getLegalBySlug(slug: string, locale: TypedLocale): Promise<PaginatedDocs<Legal>> {
  const { isEnabled: draft } = await draftMode()
  if (draft) return fetchLegalBySlug(slug, locale)
  return unstable_cache(() => fetchLegalBySlug(slug, locale), [`legal_${slug}_${locale}`], {
    tags: [`legal_${slug}`, 'legal'],
  })()
}

export async function generateStaticParams() {
  // Use the uncached list fetch (no draftMode()) so this is safe at build time. Slugs are shared
  // across locales, so cross-product the default-locale list against every routing locale.
  const { docs } = await fetchLegalList(DEFAULT_LOCALE as TypedLocale)
  return LOCALES.flatMap((locale) => docs.map((doc) => ({ locale, slug: doc.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const { docs } = await getLegalBySlug(slug, typedLocale)
  const legal = docs[0]

  if (!legal) notFound()

  return generateMeta({ doc: legal, fallbackTitle: 'Legal', pathname: `/legals/${slug}`, locale: typedLocale })
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<JSX.Element> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const { docs } = await getLegalBySlug(slug, typedLocale)
  const legal: Legal | undefined = docs[0]

  if (!legal) notFound()

  const [legalCenter, { docs: legalDocs }] = await Promise.all([getLegalCenter(typedLocale), getLegalList(typedLocale)])
  const menuItems = sortLegalMenuItems(legalDocs)
  const title = legal.title ?? getMenuItemLabel(legal)
  const ctaButtons = [legal.cta?.button_1, legal.cta?.button_2].filter(
    (b): b is { label?: string | null; link?: string | null } => Boolean(b?.label),
  )

  return (
    <div className="min-h-screen antialiased">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 pb-16 lg:gap-24 lg:pb-24">
        <Motion tag="section" {...sectionReveal}>
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[300px_1fr] lg:gap-24">
            {/* LEFT SIDEBAR: Legal Center menu & compliance notice. Sticky on desktop so the
                navigation + notice stay reachable through long legal documents. */}
            <aside className="flex flex-col gap-16 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:justify-between">
              <div className="space-y-10">
                {/* Header info */}
                <div>
                  <h2 className="font-display text-[30px] font-medium leading-[1.15] tracking-tight text-cream">
                    {legalCenter?.heading || 'Legal Center'}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-body">
                    {legalCenter?.description || 'Institutional-grade transparency. Reviewed by external counsel.'}
                  </p>
                </div>

                {/* Navigation menu */}
                {menuItems.length > 0 && (
                  <nav aria-label="Legal documents" className="flex flex-col gap-1">
                    {legalCenter?.menuTitle && (
                      <h3 className="mb-2 px-4 text-[12px] font-medium uppercase tracking-[0.14em] text-subtle">
                        {legalCenter.menuTitle}
                      </h3>
                    )}
                    {menuItems.map((item) => {
                      const isActive = item.slug === slug
                      const hasIcon = Boolean(item.menuIcon && item.menuIcon in LEGAL_MENU_ICONS)

                      return (
                        <Link
                          key={item.id}
                          href={`/${typedLocale}/legals/${item.slug}`}
                          aria-current={isActive ? 'page' : undefined}
                          className={`group flex items-center gap-4 rounded-md border-l-2 px-4 py-3 text-[16px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${
                            isActive
                              ? 'border-subtle bg-main text-cream'
                              : 'border-transparent text-body hover:bg-main/40 hover:text-cream'
                          }`}
                        >
                          {hasIcon && (
                            <span
                              className={`shrink-0 transition-colors duration-200 ${
                                isActive ? 'text-cream' : 'text-subtle group-hover:text-cream'
                              }`}
                            >
                              <LegalMenuIcon icon={item.menuIcon} />
                            </span>
                          )}
                          <span className="leading-snug">{getMenuItemLabel(item)}</span>
                        </Link>
                      )
                    })}
                  </nav>
                )}
              </div>

              {/* Bottom compliance box */}
              {(legalCenter?.noticeTitle || legalCenter?.noticeDescription) && (
                <div className="space-y-2 rounded-md bg-main p-6">
                  <h4 className="text-[12px] font-medium uppercase tracking-[0.14em] text-subtle">
                    {legalCenter?.noticeTitle || 'Compliance Notice'}
                  </h4>
                  <p className="text-[15px] leading-relaxed text-body">
                    {legalCenter?.noticeDescription ||
                      'These documents are strictly for procurement review. Do not consider them legal advice.'}
                  </p>
                </div>
              )}
            </aside>

            {/* RIGHT CONTENT: document view */}
            <main className="flex flex-col gap-12 lg:gap-[72px]">
              {/* Header: code pill + last-updated, title, Download PDF */}
              <Motion className="flex flex-col gap-6 border-b border-subtle/60 pb-6" {...blockReveal}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {legal.code && (
                    <span className="inline-flex items-center rounded-full border border-subtle bg-main px-4 py-1.5 font-display text-[18px] leading-none text-cream">
                      {legal.code}
                    </span>
                  )}
                  {legal.lastupdated && (
                    <span className="text-[14px] tracking-[-0.05em] text-subtle">
                      Last Updated: {legal.lastupdated}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <h1 className="font-display text-[30px] font-medium leading-[1.15] tracking-tight text-cream">
                    {title}
                  </h1>

                  {legal.downloadLink && (
                    <a
                      href={legal.downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-md bg-cream px-8 py-2.5 text-[16px] font-medium text-ink transition-colors duration-200 hover:bg-cream-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream active:scale-[0.98]"
                    >
                      <Download size={16} strokeWidth={1.75} aria-hidden />
                      Download PDF
                    </a>
                  )}
                </div>
              </Motion>

              {/* Main document content. The richtext wrapper exposes a className we use to apply
                  the design's section rhythm (gap-32 between blocks, gap-16 heading→body),
                  Poppins-Medium section headings, and the Inter body tracking/color. */}
              <Motion tag="article" {...blockReveal} transition={{ ...blockReveal.transition, delay: 0.08 }}>
                {legal.content ? (
                  <RichTextComp
                    content={legal.content as RichText}
                    className="max-w-none space-y-8 text-[16px] leading-[1.6] text-body prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-cream prose-h2:text-[24px] prose-h3:mb-4 prose-h3:mt-0 prose-h3:text-[24px] prose-p:my-0 prose-p:text-body prose-a:text-cream prose-a:underline prose-a:underline-offset-2 prose-li:text-body prose-strong:text-cream"
                  />
                ) : (
                  <div className="rounded-md border border-line bg-ink/60 px-6 py-12 text-center">
                    <p className="text-[15px] text-subtle">
                      This document is being prepared. Please check back shortly.
                    </p>
                  </div>
                )}
              </Motion>
            </main>
          </div>
        </Motion>

        {/* Bottom CTA — signature violet noise-gradient card (matches the hero pattern).
            Renders only when CMS supplies a heading; degrades to the CSS gradient (no media). */}
        {legal.cta?.heading && (
          <Motion
            tag="section"
            className="group relative overflow-hidden rounded-md ring-1 ring-white/10"
            {...sectionReveal}
          >
            {/* Gradient field */}
            <span
              aria-hidden
              className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              style={{ backgroundImage: VIOLET_GRADIENT }}
            />
            {/* Signature grain overlay (local asset, no external dependency) */}
            <span
              aria-hidden
              className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
            />
            {/* Legibility scrim toward the right where the button sits */}
            <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/40" />

            <div className="relative flex flex-col items-start justify-between gap-8 p-8 md:flex-row md:items-center md:p-12">
              <div className="max-w-2xl">
                <h3 className="font-display text-[28px] font-medium leading-[1.12] tracking-tight text-cream md:text-[32px]">
                  {legal.cta.heading}
                </h3>
                {legal.cta.description && (
                  <p className="mt-3 text-[15px] leading-relaxed text-cream/80 lg:text-[16px]">
                    {legal.cta.description}
                  </p>
                )}
              </div>

              {ctaButtons.length > 0 && (
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  {ctaButtons.map((button, i) => (
                    <Link
                      key={`${button.label}-${i}`}
                      href={safeLink(button.link)}
                      className={`inline-flex items-center justify-center rounded-md px-6 py-3 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream active:scale-[0.98] ${
                        i === 0
                          ? 'bg-ink/80 text-cream ring-1 ring-white/15 backdrop-blur-sm hover:bg-ink'
                          : 'text-cream/85 ring-1 ring-white/20 hover:bg-white/10 hover:text-cream'
                      }`}
                    >
                      {button.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Motion>
        )}
      </div>
    </div>
  )
}
