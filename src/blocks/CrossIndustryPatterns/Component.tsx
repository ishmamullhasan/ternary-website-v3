import Motion from '@/components/animation/motion'
import { cn } from '@/lib/utils'
import type { CrossIndustryPatternsBlock, Media } from '@/payload-types'
import { GitBranch, Layers, Network, Workflow, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Distinct per-feature glyphs so each leverage point reads as its own pattern rather than a
// repeated bolt.
const FEATURE_ICONS: readonly LucideIcon[] = [Layers, Network, GitBranch, Workflow]

// Circular icon chip. bg-card reads as raised on both the photo and the bg-ink cards. The image
// feature uses the smaller 40px badge; every other slot uses 48px (Figma 1291-3163).
function IconBadge({ Icon, size = 48 }: { Icon: LucideIcon; size?: 40 | 48 }): JSX.Element {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-card text-cream',
        size === 40 ? 'size-10' : 'size-12',
      )}
    >
      <Icon size={size === 40 ? 20 : 24} strokeWidth={1.75} aria-hidden />
    </span>
  )
}

// A single icon + title + paragraph feature block, shared by the image feature, the right-column
// cards, and the bottom benefit card. Content is bottom-anchored (Figma justify-end); pass a
// container className to make it a bg-ink card or constrain its width.
function FeatureBlock({
  Icon,
  title,
  excerpt,
  badgeSize,
  className,
}: {
  Icon: LucideIcon
  title?: string | null
  excerpt?: string | null
  badgeSize?: 40 | 48
  className?: string
}): JSX.Element {
  return (
    <div className={cn('flex flex-col justify-end gap-4', className)}>
      <IconBadge Icon={Icon} size={badgeSize} />
      <div className="space-y-2">
        {title && (
          <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">{title}</h3>
        )}
        {excerpt && <p className="text-base leading-[1.15] tracking-[-0.05em] text-cream/75">{excerpt}</p>}
      </div>
    </div>
  )
}

// Structural Leverage section (Figma 1291-3163): a Surface/Card panel with a heading block, then a
// content row (large image feature left + two stacked bg-ink cards right), then a full-width bg-ink
// benefit card. Layout role is derived from item index — item 0 fills the image feature, items 1-2
// the right column, item 3 the bottom benefit card.
export function CrossIndustryPatternsComponent(props: CrossIndustryPatternsBlock): JSX.Element | null {
  if (!props?.heading) return null

  const items = props.items ?? []
  const imageItem = items[0]
  const columnItems = items.slice(1, 3)
  const benefitItem = items[3]

  const imageUrl = imageItem?.media ? ((imageItem.media as Media)?.url ?? undefined) : undefined

  return (
    <section className="section-card w-full">
      {/* Section gap is 32px (Figma `--space/32`): heading block → content area. */}
      <div className="flex flex-col gap-8">
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-4xl space-y-4"
        >
          <h2 className="font-display text-3xl font-medium leading-[1.15] tracking-[-0.05em] text-cream opacity-90">
            {props.heading}
          </h2>
          {props.description && (
            <p className="text-base leading-[1.15] tracking-[-0.05em] text-body opacity-90">{props.description}</p>
          )}
        </Motion>

        {/* Content area — cards sit 16px apart (Figma `--space/16`). */}
        <div className="flex flex-col gap-4">
          {(imageItem || columnItems.length > 0) && (
            <Motion
              tag="div"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: EASE }}
              className="grid grid-cols-1 gap-4 lg:grid-cols-[933fr_459fr]"
            >
              {/* Item 0 — large image feature with a bottom legibility scrim and bottom-anchored copy. */}
              <div className="relative aspect-[933/600] w-full overflow-hidden rounded-md">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 63vw"
                    className="object-cover"
                  />
                ) : (
                  <>
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        backgroundImage: 'radial-gradient(130% 130% at 20% 14%, #4f6bed 0%, #25307e 46%, #0c1030 100%)',
                      }}
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
                    />
                  </>
                )}
                {imageItem?.title && (
                  <>
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
                    />
                    <FeatureBlock
                      Icon={FEATURE_ICONS[0]}
                      title={imageItem.title}
                      excerpt={imageItem.excerpt}
                      badgeSize={40}
                      className="absolute inset-x-0 bottom-0 max-w-md p-6"
                    />
                  </>
                )}
              </div>

              {/* Items 1-2 — stacked bg-ink cards filling the image height on desktop. */}
              {columnItems.length > 0 && (
                <div className="flex flex-col gap-4">
                  {columnItems.map((item, idx) => (
                    <FeatureBlock
                      key={item.id ?? `column-${idx}`}
                      Icon={FEATURE_ICONS[(idx + 1) % FEATURE_ICONS.length]}
                      title={item.title}
                      excerpt={item.excerpt}
                      className="flex-1 rounded-md bg-ink p-6"
                    />
                  ))}
                </div>
              )}
            </Motion>
          )}

          {/* Item 3 — full-width benefit card, copy anchored to the bottom-left under tall top padding. */}
          {benefitItem && (
            <Motion
              tag="div"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: EASE }}
              className="rounded-md bg-ink p-6 lg:pt-[72px]"
            >
              <FeatureBlock
                Icon={FEATURE_ICONS[3]}
                title={benefitItem.title}
                excerpt={benefitItem.excerpt}
                className="max-w-[557px]"
              />
            </Motion>
          )}
        </div>
      </div>
    </section>
  )
}
