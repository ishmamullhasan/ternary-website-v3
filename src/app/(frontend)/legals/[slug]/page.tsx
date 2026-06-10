import Motion from '@/components/animation/motion'
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

const motionSectionProps = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

const motionBlockProps = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.4 as const },
  transition: { duration: 0.35, ease: 'easeOut' as const },
}

const getLegalList = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return payload.find({ collection: 'legal', sort: 'menuOrder', limit: 100 })
  },
  ['legal'],
  { tags: ['legal'] },
)

const getLegalCenter = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return payload.findGlobal({ slug: 'legal-center' })
  },
  ['legal-center'],
  { tags: ['legal-center', 'legal'] },
)

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

  const [legalCenter, { docs: legalDocs }] = await Promise.all([getLegalCenter(), getLegalList()])
  const menuItems = sortLegalMenuItems(legalDocs)

  return (
    <div className="min-h-screen antialiased">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-16 lg:gap-24  pb-12 lg:pb-20">
        <Motion tag="section" {...motionSectionProps}>
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 lg:gap-24 items-stretch">
            {/* LEFT SIDEBAR: Legal Center Menu & Notice Box */}
            <aside className="flex h-full flex-col justify-between gap-16">
              <div className="space-y-10">
                {/* Header Info */}
                <Motion {...motionBlockProps}>
                  <h2 className="text-3xl font-semibold tracking-tight mb-2">
                    {legalCenter.heading || 'Legal Center'}
                  </h2>
                  <p className="text-base text-[#757571] leading-relaxed">
                    {legalCenter.description || 'Institutional-grade transparency. Reviewed by external counsel.'}
                  </p>
                </Motion>

                {/* Navigation Menu Links */}
                {menuItems.length > 0 && (
                  <Motion {...motionBlockProps} transition={{ ...motionBlockProps.transition, delay: 0.06 }}>
                    <nav className="flex flex-col gap-1.5">
                      {legalCenter.menuTitle && (
                        <h3 className="mb-2 px-3 text-xs text-[#757571]">{legalCenter.menuTitle}</h3>
                      )}
                      {menuItems.map((item, index) => {
                        const isActive = item.slug === slug
                        const hasIcon = Boolean(item.menuIcon && item.menuIcon in LEGAL_MENU_ICONS)

                        return (
                          <Motion
                            key={item.id}
                            {...motionBlockProps}
                            transition={{
                              ...motionBlockProps.transition,
                              delay: 0.08 + index * 0.04,
                            }}
                          >
                            <Link
                              href={`/legals/${item.slug}`}
                              aria-current={isActive ? 'page' : undefined}
                              className={`group flex items-center gap-1 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? 'border-l-2 border-[#757571] bg-[#1B1A17]'
                                  : 'border-l-2 border-transparent text-[#757571] hover:text-[#F4F3EC]'
                              }`}
                            >
                              {hasIcon && (
                                <span
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center ${
                                    isActive ? 'text-[#F4F3EC]' : 'text-[#757571] group-hover:text-[#F4F3EC]'
                                  }`}
                                >
                                  <LegalMenuIcon icon={item.menuIcon} />
                                </span>
                              )}
                              <span className="leading-snug">{getMenuItemLabel(item)}</span>
                            </Link>
                          </Motion>
                        )
                      })}
                    </nav>
                  </Motion>
                )}
              </div>

              {/* Bottom Compliance Box */}
              {(legalCenter.noticeTitle || legalCenter.noticeDescription) && (
                <Motion
                  className="space-y-2 bg-[#1B1A17] p-5"
                  {...motionBlockProps}
                  transition={{ ...motionBlockProps.transition, delay: 0.1 }}
                >
                  <h4 className="text-xs text-[#757571]">{legalCenter.noticeTitle || 'Compliance Notice'}</h4>
                  <p className="text-base leading-relaxed text-[#D5D5D5]">
                    {legalCenter.noticeDescription ||
                      'These documents are strictly for procurement review. Do not consider them legal advice.'}
                  </p>
                </Motion>
              )}
            </aside>

            {/* RIGHT CONTENT SECTION: Document View */}
            <main className="space-y-12">
              {/* Action Topbar Metadata */}
              <Motion
                className="flex flex-col justify-between gap-4 border-b border-[#757571] pb-6"
                {...motionBlockProps}
              >
                <div className="flex flex-row items-center justify-start gap-3 text-base">
                  {legal.code && (
                    <span className="px-2.5 py-1 bg-[#1B1A17] border border-[#757571] rounded-full">{legal.code}</span>
                  )}
                  {legal.lastupdated && <span className="text-[#757571] text-sm">{legal.lastupdated}</span>}
                </div>
                <div className="flex flex-row items-center justify-between gap-3">
                  <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{legal.title}</h1>

                  {legal.downloadLink && (
                    <a
                      href={legal.downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-base font-medium text-[#0F0E0E] bg-[#F4F3EC] hover:bg-[#E5E5E5] rounded-lg transition-colors"
                    >
                      <Download size={14} />
                      Download PDF
                    </a>
                  )}
                </div>
              </Motion>

              {/* Main Document Content */}
              <article className="space-y-3">
                <div className="max-w-none">
                  <RichTextComp content={legal.content as RichText} />
                </div>
              </article>
            </main>
          </div>
        </Motion>

        {/* Content Bottom CTA Block */}
        {legal.cta?.heading && (
          <Motion
            tag="section"
            className="p-8 md:p-12 bg-cover bg-center rounded-lg overflow-hidden border border-[#1F1F1F] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 min-h-[200px]"
            style={{
              backgroundImage: legal.cta.backgroundImage
                ? `url(${(legal.cta.backgroundImage as Media).url})`
                : 'linear-gradient(to bottom, #121212, #0A0A0A)',
            }}
            {...motionSectionProps}
          >
            <Motion className="max-w-2xl text-left" {...motionBlockProps}>
              <h3 className="text-3xl md:text-4xl font-medium mb-3">{legal.cta.heading}</h3>
              {legal.cta.description && <p className="text-base leading-relaxed">{legal.cta.description}</p>}
            </Motion>

            <Motion
              className="flex lg:flex-row flex-col gap-4 justify-center"
              {...motionBlockProps}
              transition={{ ...motionBlockProps.transition, delay: 0.06 }}
            >
              {legal.cta?.button_1?.label && (
                <Link
                  href={legal.cta?.button_1?.link as string}
                  className="px-5 py-2.5 bg-[#F4F3EC] text-[#0F0E0E] font-medium rounded-2xl text-base"
                >
                  {legal.cta?.button_1?.label}
                </Link>
              )}
              {legal.cta?.button_2?.label && (
                <Link
                  href={legal.cta?.button_2?.link as string}
                  className="px-5 py-2.5 bg-[#14120B] font-medium rounded-2xl text-base"
                >
                  {legal.cta?.button_2?.label}
                </Link>
              )}
            </Motion>
          </Motion>
        )}
      </div>
    </div>
  )
}
