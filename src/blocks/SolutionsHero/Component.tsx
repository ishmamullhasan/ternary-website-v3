import { DisciplineCard, type HeroIconData } from '@/blocks/SolutionsHero/DisciplineCard'
import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Media, SolutionsHeroBlock } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// --- Static decoration (fixed in code, matched to CMS data by index) ---
// The designer's isometric icons, one per hero card, kept as raw paths + dimensions. DisciplineCard
// wraps each in the pointer-reactive latent-reveal frame (see heroIcon.css); the per-path fills stay,
// and the mask supplies the dimming, so the baked-in opacity is intentionally dropped.
const cardIcons: HeroIconData[] = [
  {
    w: 120,
    h: 132,
    paths: (
      <>
        <path
          d="M12.5661 47.6849L0 40.1062L65.9683 0L78.8482 7.89568L52.7747 23.8417L65.6545 30.9472L52.4608 39.7892L39.4241 30.9472L12.5661 47.6849Z"
          fill="#E6E7E8"
        />
        <path
          d="M14.137 92.8439L12.5664 47.6857L39.4244 30.948V47.6857L52.1474 54.6319L66.2825 47.6857L65.6549 30.948L52.775 23.8425L78.8485 7.89648V55.5798L14.137 92.8439Z"
          fill="#939598"
        />
        <path d="M52.1468 37.4228V54.6322L39.4238 47.686V30.9482L52.1468 37.4228Z" fill="#E6E7E8" />
        <path d="M65.654 30.9482L66.2816 47.686L52.1465 54.6322V37.4228L65.654 30.9482Z" fill="#BBBDBF" />
        <path d="M106.492 54.6318L52.4609 85.5806L66.2822 92.8438L120 62.843L106.492 54.6318Z" fill="#E6E7E8" />
        <path d="M66.2822 109.264V92.8436L120 62.8428V94.1054L52.4609 132V116.843L66.2822 109.264Z" fill="#A6A9AB" />
        <path d="M52.4609 101.685V85.5801L66.2822 92.8433V109.264L52.4609 101.685Z" fill="#E6E7E8" />
        <path d="M0 102.316L52.4608 132V116.843L14.1366 92.8433L12.5661 47.6851L0 40.1064V102.316Z" fill="#E6E7E8" />
        <path
          d="M92.1573 62.8433L78.8483 55.5801L14.1367 92.8441L52.461 116.844L66.2822 109.265L52.461 101.686V90.9483V85.5809L92.1573 62.8433Z"
          fill="#A6A9AB"
        />
        <path
          d="M34.2403 92.8438H14.1367L52.4609 116.843L66.2822 109.264L52.4609 101.686L52.1471 92.8438H34.2403Z"
          fill="#D1D2D3"
        />
      </>
    ),
  },
  {
    w: 132,
    h: 132,
    paths: (
      <>
        <path d="M29.3895 18.335V37.4388L87.8275 75.843V56.3517L29.3895 18.335Z" fill="#D1D2D3" />
        <path d="M116.359 38.0186L87.8274 56.3513L29.3895 18.3346L58.6093 0L116.359 38.0186Z" fill="#D1D2D3" />
        <path
          d="M116.359 75.8425V38.0186L87.8275 56.3513V75.8425L102.093 66.3851V85.4908L58.6094 113.281V131.999L132 85.0089V66.7726L116.359 75.8425Z"
          fill="#6C6E70"
        />
        <path d="M44.6875 104.018L87.8279 75.8438L102.094 85.492L58.6098 113.282L44.6875 104.018Z" fill="#D1D2D3" />
        <path d="M44.6875 124.089V104.018L58.6098 113.282V132L44.6875 124.089Z" fill="#D1D2D3" />
        <path d="M102.094 66.3857L87.8281 75.8431L102.094 85.4914V66.3857Z" fill="#57585A" />
        <path d="M0 75.9393L43.1 46.4482L58.6096 56.6409L14.7807 85.4912L0 75.9393Z" fill="#D1D2D3" />
        <path d="M14.9529 104.017L14.7812 85.492L58.6101 56.6416V75.9401L14.9529 104.017Z" fill="#6C6E70" />
        <path d="M0 94.5604V75.9385L14.7807 85.4904L14.9524 104.016L0 94.5604Z" fill="#D1D2D3" />
        <path d="M73.0535 85.492L87.8275 75.8437L58.6094 56.6416V75.9401L73.0535 85.492Z" fill="#57585A" />
        <path d="M132 66.7719L116.359 56.3506V75.8418L132 66.7719Z" fill="#403F40" />
      </>
    ),
  },
  {
    w: 120,
    h: 132,
    paths: (
      <>
        <path
          d="M53.4727 8.2373V54.2784L106.315 85.1136V54.0674L79.8936 39.0725V22.8102L53.4727 8.2373Z"
          fill="#D1D2D3"
        />
        <path d="M93.8943 14.9964L79.8936 22.8103L53.4727 8.23741L66.3151 0L93.8943 14.9964Z" fill="#D1D2D3" />
        <path d="M93.8942 31.0459V14.9961L79.8936 22.81V39.0723L93.8942 31.0459Z" fill="#939598" />
        <path d="M106.315 54.0682L120 46.6762L93.8942 31.0469L79.8936 39.0733L106.315 54.0682Z" fill="#D1D2D3" />
        <path
          d="M120 93.3513V46.6758L106.315 54.0677V85.1139L79.8936 101.8V85.1139L53.4727 101.8V132L120 93.3513Z"
          fill="#808284"
        />
        <path d="M26.7364 54.0674L79.8938 85.1136L53.4728 101.799L0 69.9077L26.7364 54.0674Z" fill="#BBBDBF" />
        <path d="M0 100.742L53.4728 132V101.799L0 69.9072V100.742Z" fill="#D1D2D3" />
        <path
          d="M53.4732 54.2773L39.9473 61.7825L79.8942 85.1125V101.798L106.315 85.1125L53.4732 54.2773Z"
          fill="#D1D2D3"
        />
      </>
    ),
  },
  {
    w: 120,
    h: 132,
    paths: (
      <>
        <path d="M53.749 8.77963L93.1247 32.6085L106.25 23.8289L66.8743 0L53.749 8.77963Z" fill="#D1D2D3" />
        <path d="M106.25 54.5545L120 47.0306L106.25 23.8281L93.125 32.6077L106.25 54.5545Z" fill="#D1D2D3" />
        <path
          d="M106.251 70.5472V54.5561L120 47.0322V93.1219L53.75 132V116.323L93.1257 92.1801V78.0711L106.251 70.5472Z"
          fill="#57585A"
        />
        <path
          d="M66.1846 16.3047V78.3839L79.9997 85.5954V70.2321L93.1249 62.0804L106.25 70.5461V54.555L93.1249 32.6082L66.1846 16.3035Z"
          fill="#D1D2D3"
        />
        <path
          d="M66.1853 16.3047L39.3761 78.3839L27.501 85.5954L40.9376 92.8068L66.1853 78.3839V16.3047Z"
          fill="#57585A"
        />
        <path d="M27.501 69.6067L53.75 8.78027L66.1853 16.3057L39.3761 78.3849L27.501 69.6067Z" fill="#D1D2D3" />
        <path
          d="M53.7495 116.321L0 85.5951L27.5006 69.6055L39.3757 78.3836L27.5006 85.5951L40.9372 92.8065L53.7495 100.958L80 85.5951L93.1253 92.1786L53.7495 116.321Z"
          fill="#D1D2D3"
        />
        <path d="M0 100.959V85.5957L53.7495 116.322V131.999L0 100.959Z" fill="#D1D2D3" />
        <path d="M93.1252 78.0693L80 70.2314V85.5947L93.1252 92.1782V78.0693Z" fill="#D1D2D3" />
        <path d="M93.1252 62.0811L80 70.2328L93.1252 78.0706L106.25 70.5467L93.1252 62.0811Z" fill="#D1D2D3" />
        <path
          d="M46.8423 96.5632L74.6766 88.7105L80.0003 85.5951L66.1852 21.6338V78.3836L40.9375 92.8065L46.8423 96.5632Z"
          fill="#403F40"
        />
        <path d="M53.7493 100.959L74.6761 88.7109L46.8418 96.5637L53.7493 100.959Z" fill="#403F40" />
      </>
    ),
  },
]

export function SolutionsHeroComponent(props: SolutionsHeroBlock): JSX.Element {
  const heroCards = props?.cards ?? []
  const heroImage = props?.backgroundImage as Media | undefined
  // Only render decorated cells that have CMS-backed copy so missing data collapses gracefully.
  const cells = cardIcons.map((icon, index) => ({ icon, card: heroCards[index] })).filter((c) => Boolean(c.card?.title))

  return (
    <section className="w-full">
      {/* Intro block — centered institutional statement (Figma: ~72px top pad, 24px headline→desc gap). */}
      <div className="flex flex-col items-center gap-6 py-[72px] text-center">
        {props?.heading ? (
          <Motion
            tag="h1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display text-3xl font-medium leading-[1.15] tracking-[-0.05em] text-cream"
          >
            {props.heading}
          </Motion>
        ) : null}
        {props?.description ? (
          <Motion
            tag="div"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="max-w-3xl"
          >
            <RichTextComp
              content={props.description as RichText}
              className="prose-p:mb-0 prose-p:text-base prose-p:leading-[1.5] prose-p:text-body"
            />
          </Motion>
        ) : null}
      </div>

      {/* Signature header image with the four offering cards overlaid on the bottom (Figma 1480×843). */}
      <Motion
        tag="div"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative w-full overflow-hidden rounded-md ring-1 ring-line lg:aspect-[1480/843]"
      >
        {/* Always-present gradient + grain so the frame never reads as an empty/broken box. */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(120% 120% at 30% 10%, #1c1b26 0%, #121119 46%, #0b0a0f 100%)' }}
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
        />
        {heroImage?.url ? (
          <Image
            src={heroImage.url}
            alt={heroImage.alt || ''}
            fill
            sizes="(min-width: 1024px) 1480px, 100vw"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : null}
        {/* Bottom scrim keeps the overlaid cards legible against the photo (desktop). */}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/75" />
        {/* Mobile/tablet: flat 50% darken behind the centered card grid (Figma 1719:2995). */}
        <span aria-hidden className="absolute inset-0 bg-black/50 lg:hidden" />

        {/* Offering row — four disciplines as separate frosted cards inset over the bottom of the
            photo (Figma: gaps between cards, ~32px outer inset). */}
        {cells.length > 0 ? (
          <div className="relative z-10 grid grid-cols-2 content-center gap-2 px-4 py-12 lg:absolute lg:inset-x-0 lg:bottom-0 lg:grid-cols-4 lg:gap-4 lg:p-8">
            {cells.map(({ icon, card }, index) => (
              <DisciplineCard key={index} icon={icon} title={card?.title} excerpt={card?.excerpt} index={index} />
            ))}
          </div>
        ) : null}
      </Motion>
    </section>
  )
}

export default SolutionsHeroComponent
