import Motion from '@/components/animation/motion'
import type { CrossIndustryPatternsBlock, Media } from '@/payload-types'
import { GitBranch, Layers, Network, Workflow, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Distinct per-feature glyphs so each leverage point reads as its own pattern rather than a
// repeated bolt.
const FEATURE_ICONS: readonly LucideIcon[] = [Layers, Network, GitBranch, Workflow]

// A single icon + title + paragraph feature block, shared by the right-column quotes and the
// bottom benefits row.
function FeatureBlock({
  Icon,
  title,
  excerpt,
}: {
  Icon: LucideIcon
  title?: string | null
  excerpt?: string | null
}): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-page text-cream">
        <Icon size={24} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="space-y-2">
        {title && <h3 className="font-display text-xl font-medium leading-[1.15] text-cream">{title}</h3>}
        {excerpt && <p className="text-base leading-[1.15] text-body">{excerpt}</p>}
      </div>
    </div>
  )
}

// Structural Leverage section: a Surface/Card with a heading block, then a content row (large image
// left + two stacked feature blocks right), then a full-width benefits row. Layout role is derived
// from item index — item 0 fills the image feature, items 1-2 the right column, item 3 the bottom
// benefits row.
export function CrossIndustryPatternsComponent(props: CrossIndustryPatternsBlock): JSX.Element | null {
  if (!props?.heading) return null

  const items = props.items ?? []
  const imageItem = items[0]
  const columnItems = items.slice(1, 3)
  const benefitItem = items[3]

  const imageUrl = imageItem?.media ? ((imageItem.media as Media)?.url ?? undefined) : undefined

  return (
    <section className="w-full rounded-md bg-main px-6 py-10 sm:px-9 lg:py-12">
      <div className="space-y-12">
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-3xl space-y-3"
        >
          <h2 className="font-display text-3xl font-medium leading-[1.15] text-cream">{props.heading}</h2>
          {props.description && <p className="text-base leading-[1.15] text-body">{props.description}</p>}
        </Motion>

        {(imageItem || columnItems.length > 0) && (
          <Motion
            tag="div"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-[933fr_459fr]"
          >
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
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <FeatureBlock Icon={FEATURE_ICONS[0]} title={imageItem.title} excerpt={imageItem.excerpt} />
                  </div>
                </>
              )}
            </div>

            {columnItems.length > 0 && (
              <div className="flex flex-col justify-between gap-8">
                {columnItems.map((item, idx) => (
                  <FeatureBlock
                    key={item.id ?? `column-${idx}`}
                    Icon={FEATURE_ICONS[(idx + 1) % FEATURE_ICONS.length]}
                    title={item.title}
                    excerpt={item.excerpt}
                  />
                ))}
              </div>
            )}
          </Motion>
        )}

        {benefitItem && (
          <Motion
            tag="div"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <FeatureBlock Icon={FEATURE_ICONS[3]} title={benefitItem.title} excerpt={benefitItem.excerpt} />
          </Motion>
        )}
      </div>
    </section>
  )
}
