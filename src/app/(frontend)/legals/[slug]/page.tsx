import RichTextComp, { type RichText } from '@/components/richtext'
import type { Legal, Media } from '@/payload-types'
import config from '@/payload.config'
import { Download, FileText, Scale, Shield, type LucideIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// Mocking motion variables / themes if not imported or injected globally
const motionSectionProps = {}
const motionBlockProps = {}

const getLegalList = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return payload.find({ collection: 'legal' })
  },
  ['legal'],
  { tags: ['legal'] },
)

function getMenuItemSlug(page: string | Legal | null | undefined): string | null {
  if (!page || typeof page === 'string') return null
  return page.slug ?? null
}

function getMenuItemHref(page: string | Legal | null | undefined): string {
  const pageSlug = getMenuItemSlug(page)
  return pageSlug ? `/legals/${pageSlug}` : '#'
}

function getMenuItemLabel(label: string | null | undefined, page: string | Legal | null | undefined): string {
  if (label) return label
  if (page && typeof page === 'object' && page.title) return page.title
  return 'Untitled'
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
  return <Icon size={18} strokeWidth={1.75} aria-hidden className="shrink-0" />
}

function getLegalBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      return payload.find({
        collection: 'legal',
        where: {
          slug: {
            equals: slug,
          },
        },
        depth: 2,
        limit: 1,
      })
    },
    [`legal_${slug}`],
    { tags: [`legal_${slug}`, 'legal'] },
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { docs } = await getLegalBySlug(slug)()
  const legal = docs[0]

  if (!legal) notFound()

  return {
    title: legal.title ? `${legal.title} | Ternary Solutions` : 'Ternary Solutions',
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<JSX.Element> {
  const { slug } = await params
  const { docs } = await getLegalBySlug(slug)()
  const legal: Legal | undefined = docs[0]

  if (!legal) notFound()

  const menu = legal.legalMenu

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#D5D5D5] antialiased">
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 lg:gap-24 items-stretch">
          {/* LEFT SIDEBAR: Legal Center Menu & Notice Box */}
          <aside className="flex h-full flex-col justify-between gap-16">
            <div className="space-y-10">
              {/* Header Info */}
              <div>
                <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">
                  {menu?.heading || 'Legal Center'}
                </h2>
                <p className="text-base text-[#757571] leading-relaxed">
                  {menu?.description || 'Institutional-grade transparency. Reviewed by external counsel.'}
                </p>
              </div>

              {/* Navigation Menu Links */}
              {menu?.menuItems && menu.menuItems.length > 0 && (
                <nav className="flex flex-col gap-1.5">
                  {menu.title && (
                    <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-[#555551]">
                      {menu.title}
                    </h3>
                  )}
                  {menu.menuItems.map((item, idx) => {
                    const itemSlug = getMenuItemSlug(item.page)
                    const isActive = itemSlug === slug
                    const hasIcon = Boolean(item.icon && item.icon in LEGAL_MENU_ICONS)

                    return (
                      <Link
                        key={item.id ?? idx}
                        href={getMenuItemHref(item.page)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'border border-[#2A2A2A] bg-[#1A1A1A] text-white'
                            : 'border border-transparent text-[#757571] hover:border-[#1F1F1F] hover:bg-[#121212] hover:text-white'
                        }`}
                      >
                        {hasIcon && (
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                              isActive
                                ? 'border-[#3A3A3A] bg-[#252525] text-white'
                                : 'border-[#1F1F1F] bg-[#0F0F0F] text-[#757571] group-hover:border-[#2A2A2A] group-hover:text-white'
                            }`}
                          >
                            <LegalMenuIcon icon={item.icon} />
                          </span>
                        )}
                        <span className="leading-snug">{getMenuItemLabel(item.label, item.page)}</span>
                      </Link>
                    )
                  })}
                </nav>
              )}
            </div>

            {/* Bottom Compliance Box */}
            {(menu?.noticeTitle || menu?.noticeDescription) && (
              <div className="space-y-2 rounded-xl border border-[#222] bg-[#121212] p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
                  {menu.noticeTitle || 'Compliance Notice'}
                </h4>
                <p className="text-xs leading-relaxed text-[#757571]">
                  {menu.noticeDescription ||
                    'These documents are strictly for procurement review. Do not consider them legal advice.'}
                </p>
              </div>
            )}
          </aside>

          {/* RIGHT CONTENT SECTION: Document View */}
          <main className="space-y-12">
            {/* Action Topbar Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F1F1F] pb-6">
              <div className="flex items-center gap-3 text-xs font-mono">
                {legal.code && (
                  <span className="px-2.5 py-1 bg-[#1A1A1A] border border-[#2A2A2A] text-[#A5A5A1] rounded-md">
                    {legal.code}
                  </span>
                )}
                {legal.lastupdated && <span className="text-[#555551]">Last Updated: {legal.lastupdated}</span>}
              </div>

              {/* PDF Action Downloader */}
              {legal.downloadLink && (
                <a
                  href={legal.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#0A0A0A] bg-white hover:bg-[#E5E5E5] rounded-lg transition-colors"
                >
                  <Download size={14} />
                  Download PDF
                </a>
              )}
            </div>

            {/* Main Document Content */}
            <article className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{legal.title}</h1>
              <div className="prose prose-invert max-w-none pt-4 text-base text-[#959591] leading-relaxed">
                <RichTextComp content={legal.content as RichText} />
              </div>
            </article>
          </main>
        </div>

        {/* Content Bottom CTA Block */}
        {legal.cta?.heading && (
          <section
            className="mt-16 p-8 md:p-12 bg-cover bg-center rounded-2xl overflow-hidden border border-[#1F1F1F] flex flex-col items-center text-center justify-center min-h-[260px]"
            style={{
              backgroundImage: legal.cta.backgroundImage
                ? `url(${(legal.cta.backgroundImage as Media).url})`
                : 'linear-gradient(to bottom, #121212, #0A0A0A)',
            }}
          >
            <div className="max-w-xl">
              <h3 className="text-2xl font-semibold text-white mb-3">{legal.cta.heading}</h3>
              {legal.cta.description && (
                <p className="text-sm text-[#757571] mb-8 leading-relaxed">{legal.cta.description}</p>
              )}
              {legal.cta.button?.label && legal.cta.button.link && (
                <Link
                  href={legal.cta.button.link}
                  className="inline-block px-6 py-2.5 bg-white text-[#0A0A0A] hover:bg-[#E5E5E5] text-sm font-medium rounded-xl transition-colors"
                >
                  {legal.cta.button.label}
                </Link>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  const legalList = (await getLegalList()).docs
  return legalList.map((legal) => ({ slug: legal.slug }))
}
