import Motion from '@/components/animation/motion'
import type { Industry, IndustryPanelsBlock, Media } from '@/payload-types'
import { CircleCheck, Network } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

type Tone = 'crimson' | 'azure' | 'amber' | 'violet'

// Per-panel gradient tones — a warm/cool spread so each industry reads as its own field rather
// than the single coral fallback. Origin sits top-left so the brightest point reads as a light
// source the grain texture sits over (matching the signature hero card device). CSS-only, so the
// panel always renders something rich even when CMS media is unavailable.
const TONE: Record<Tone, string> = {
  crimson: 'radial-gradient(130% 130% at 16% 12%, #c1285f 0%, #6d1734 44%, #1d0a14 100%)',
  azure: 'radial-gradient(130% 130% at 20% 14%, #2f93da 0%, #134a78 44%, #08233c 100%)',
  amber: 'radial-gradient(130% 130% at 18% 12%, #e0913a 0%, #8a4a1c 44%, #25140a 100%)',
  violet: 'radial-gradient(130% 130% at 22% 14%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)',
}

const TONE_CYCLE: readonly Tone[] = ['crimson', 'azure', 'amber', 'violet']

function GradientField({
  tone,
  image,
  alt,
  priority,
}: {
  tone: Tone
  image: Media | undefined
  alt: string
  priority: boolean
}): JSX.Element {
  return (
    <div className="group relative aspect-[676/464] w-full overflow-hidden rounded-sm lg:h-full">
      {/* Gradient field — always rendered so it doubles as the media skeleton/fallback. */}
      <span
        aria-hidden
        className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        style={{ backgroundImage: TONE[tone] }}
      />
      {/* Signature grain overlay (local asset, no external dependency). */}
      <span
        aria-hidden
        className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45" />

      {image?.url && (
        <Image
          src={image.url}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 46vw"
          className="relative object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      )}
    </div>
  )
}

export function IndustryPanelsComponent(props: IndustryPanelsBlock): JSX.Element | null {
  const panels = props?.items ?? []
  if (panels.length === 0) return null

  return (
    <div className="flex w-full flex-col gap-12 lg:gap-[72px]">
      {panels.map((panel, panelIndex) => {
        const linkedIndustry = panel.industry as Industry | undefined
        const panelTitle = panel.title || linkedIndustry?.title
        const panelDescription = panel.description || linkedIndustry?.excerpts
        const panelImage = (panel.image as Media | undefined) || (linkedIndustry?.thumbnail as Media | undefined)
        const tags = panel.tags?.map((tag) => tag.name).filter(Boolean) ?? []
        const tone = TONE_CYCLE[panelIndex % TONE_CYCLE.length]

        if (!panelTitle) return null

        return (
          <Motion
            key={panel.id ?? `panel-${panelIndex}`}
            tag="section"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: EASE }}
            className="grid grid-cols-1 items-center gap-8 rounded-md bg-main px-6 py-10 sm:px-9 lg:grid-cols-[700fr_676fr] lg:py-12"
          >
            <div className="flex flex-col">
              <div className="mb-6 flex items-center gap-2 text-[12px] text-subtle">
                <Network size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
                <span>
                  Industry {String(panelIndex + 1).padStart(2, '0')}
                  {linkedIndustry?.title ? ` / ${linkedIndustry.title}` : ''}
                </span>
              </div>

              <h2 className="font-display max-w-md text-3xl font-medium leading-[1.15] text-cream">{panelTitle}</h2>

              {panelDescription && (
                <p className="mt-4 max-w-xl text-base leading-[1.15] text-body">{panelDescription}</p>
              )}

              {tags.length > 0 && (
                <div className="mt-8 rounded-sm bg-page p-6">
                  <h3 className="text-[12px] text-subtle">What we build</h3>
                  <ul className="mt-4 space-y-2 pt-1">
                    {tags.map((tag, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm leading-[1.15] text-subtle">
                        <CircleCheck size={14} strokeWidth={2} aria-hidden className="shrink-0" />
                        <span>{tag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <GradientField
              tone={tone}
              image={panelImage}
              alt={panelImage?.alt || `${panelTitle} — industry overview`}
              priority={panelIndex === 0}
            />
          </Motion>
        )
      })}
    </div>
  )
}
