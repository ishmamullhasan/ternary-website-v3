import AboutMotion from '@/components/about/AboutMotion'
import MaskText from '@/components/about/MaskText'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutProofOfScaleBlock, Media } from '@/payload-types'
import Image from 'next/image'
import type { CSSProperties, JSX } from 'react'

type CompanyItem = NonNullable<NonNullable<AboutProofOfScaleBlock['company']>['items']>[number]

/**
 * "Proof of work in the real world" — the organisations, set as an editorial register.
 *
 * REPLACES a 4-up of raised `bg-ink` cards that lifted on hover. Cards make a list of clients
 * look like a set of products; a register — name, rule, one line of context — reads as a record,
 * which is what this is, and it sits closer to the page's voice.
 *
 * The name leads and the context follows it, rather than the previous order (context first,
 * brand tucked into a footer). These are the proof; they should be the first thing read in
 * their own cell.
 *
 * CONTENT: names and excerpts are the CMS strings, unchanged. No metric, count or claim is
 * introduced — the block states who, and the sentence the CMS already carries.
 */
function Company({ item, index }: { item: CompanyItem; index: number }): JSX.Element {
  const logo = item.logo as Media | undefined
  const logoUrl = logo?.url ?? undefined
  const logoAlt = logo?.alt ?? ''

  return (
    <div className="flex flex-col">
      <span
        aria-hidden
        className="am-rule h-px w-full bg-line"
        style={{ '--am-d': `${Math.min(index * 0.06, 0.32)}s` } as CSSProperties}
      />
      <div
        className="am-r flex flex-col gap-3 pt-6"
        style={{ '--am-d': `${Math.min(index * 0.06 + 0.05, 0.38)}s` } as CSSProperties}
      >
        {item.name ? (
          <div className="flex items-center gap-2.5">
            {/* Logo when the CMS has one — and nothing at all when it does not. No item in this
                block carries a `logo` (checked against the staging cluster: all eight are
                `logo: none`), so the previous generic-cube fallback was not a fallback, it was
                the design: the same lucide `Box` glyph eight times in a row, denoting nothing.
                The organisation's name is the stronger mark. */}
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={22}
                height={22}
                className="h-[22px] w-[22px] shrink-0 object-contain grayscale"
              />
            ) : null}
            <span className="font-display text-[19px] leading-[1.2] font-medium tracking-[-0.03em] text-cream">
              {item.name}
            </span>
          </div>
        ) : null}
        {item.excerpt ? <p className="text-[15px] leading-[1.62] text-body">{item.excerpt}</p> : null}
      </div>
    </div>
  )
}

export function AboutProofOfScaleComponent({ company }: AboutProofOfScaleBlock): JSX.Element | null {
  const hasCompany = Boolean(company?.heading || company?.items?.length)
  if (!hasCompany) return null

  return (
    <AboutMotion tag="section" className="w-full">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        {company?.heading ? (
          <h2 className="font-display max-w-[18ch] text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.06] font-medium tracking-[-0.04em] text-cream text-balance">
            <MaskText>{company.heading}</MaskText>
          </h2>
        ) : null}
        {company?.description ? (
          <div className="am-r max-w-[48ch]" style={{ '--am-d': '0.14s' } as CSSProperties}>
            <RichTextComp
              content={company.description as RichText}
              className="prose-p:mb-0 prose-p:text-[16px] prose-p:leading-[1.6] prose-p:text-body"
            />
          </div>
        ) : null}
      </div>

      {company?.items?.length ? (
        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {company.items.map((item, index) => (
            <Company key={item.id ?? index} item={item} index={index} />
          ))}
        </div>
      ) : null}
    </AboutMotion>
  )
}
