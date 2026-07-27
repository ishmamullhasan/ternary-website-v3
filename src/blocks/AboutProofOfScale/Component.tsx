import Motion from '@/components/animation/motion'
import MobileCarousel from '@/components/layout/MobileCarousel'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutProofOfScaleBlock, Media } from '@/payload-types'
import { Box } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const MOTION_BLOCK = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' as const },
}

type CompanyItem = NonNullable<NonNullable<AboutProofOfScaleBlock['company']>['items']>[number]

// Single company card — shared by the sm+ grid and the mobile carousel (excerpt → icon + brand
// footer).
function CompanyCard({ item }: { item: CompanyItem }): JSX.Element {
  const logoUrl = (item.logo as Media | undefined)?.url ?? undefined
  const logoAlt = (item.logo as Media | undefined)?.alt ?? item.name ?? ''
  return (
    <div className="group flex h-full min-h-[267px] flex-col justify-between rounded-sm bg-ink px-4 pb-4 pt-6 transition-[transform,background-color] duration-300 ease-out hover:-translate-y-1 hover:bg-[#151414]">
      <div className="flex flex-col gap-4">
        {item.excerpt ? <p className="text-base leading-snug text-body">{item.excerpt}</p> : null}
      </div>

      {item.name ? (
        <div className="mt-8 flex items-center gap-2 text-cream">
          {logoUrl ? (
            <Image src={logoUrl} alt={logoAlt} width={24} height={24} className="h-6 w-6 shrink-0 object-contain" />
          ) : (
            <Box aria-hidden className="h-6 w-6 text-cream/80" />
          )}
          <span className="text-2xl font-bold tracking-[-0.025em]">{item.name}</span>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Companies We Work With — a single `bg-main` panel (design node 1615:1912): a 4-up grid of company
 * cards (excerpt → uppercase tag pills → icon + brand footer). The former "Proof at Scale" stats
 * panel was removed. All copy is CMS-driven; the items array is guarded so missing data collapses
 * rather than rendering empty.
 */
export function AboutProofOfScaleComponent({ company }: AboutProofOfScaleBlock): JSX.Element | null {
  const hasCompany = Boolean(company?.heading || company?.items?.length)

  if (!hasCompany) return null

  return (
    <section className="rounded-md bg-main p-6 lg:px-9 lg:py-12">
      <Motion {...MOTION_BLOCK} transition={{ duration: 0.6, ease: EASE }}>
        {company?.heading ? (
          <h2 className="max-w-xl font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream lg:text-3xl">
            {company.heading}
          </h2>
        ) : null}
        {company?.description ? (
          <RichTextComp
            content={company.description as RichText}
            className="mt-4 max-w-2xl prose-p:mb-0 prose-p:text-base prose-p:leading-relaxed prose-p:text-body"
          />
        ) : null}
      </Motion>

      {company?.items?.length ? (
        // Figma right-aligns the 4-up card grid at a fixed 1171px (≈280px cards), leaving the
        // left edge open under the heading; below lg it relaxes to a full-width 1/2-col stack.
        <>
          {/* Mobile: horizontal snap carousel with pagination dots (mt-8 mirrors the grid's top
              spacing, since the grid is hidden on mobile). */}
          <MobileCarousel slideClassName="w-[280px]" className="mt-8">
            {company.items.map((item, index) => (
              <CompanyCard key={item.id ?? index} item={item} />
            ))}
          </MobileCarousel>

          {/* sm+ grid — hidden on mobile, where the carousel takes over. */}
          <div className="mt-8 hidden gap-4 sm:grid sm:grid-cols-2 lg:ml-auto lg:mt-8 lg:max-w-[1171px] lg:grid-cols-4">
            {company.items.map((item, index) => (
              <Motion
                key={item.id ?? index}
                className="h-full"
                {...MOTION_BLOCK}
                transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
              >
                <CompanyCard item={item} />
              </Motion>
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
