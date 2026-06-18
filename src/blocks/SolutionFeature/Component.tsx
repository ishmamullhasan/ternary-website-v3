import ColumnSection from '@/components/layout/sectionColumn'
import type { Media, SolutionFeatureBlock } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

const InfoCard = ({
  title,
  description,
  variant = 'compact',
}: {
  title?: string | null
  description?: string | null
  variant?: 'compact' | 'large'
}) => (
  <div
    className={
      variant === 'large'
        ? 'min-h-76 rounded-md bg-main p-6 lg:p-8 flex flex-col justify-end'
        : 'bg-neutral-900 border border-neutral-800 rounded-xl p-6'
    }
  >
    <h4
      className={
        variant === 'large'
          ? 'text-2xl font-medium text-neutral-200 mb-4 tracking-tight'
          : 'text-sm font-semibold text-white mb-2'
      }
    >
      {title}
    </h4>
    <p
      className={
        variant === 'large'
          ? 'max-w-xl text-base leading-tight text-neutral-400'
          : 'text-xs text-neutral-400 leading-relaxed'
      }
    >
      {description}
    </p>
  </div>
)

export function SolutionFeatureComponent(props: SolutionFeatureBlock): JSX.Element {
  const who = props?.detail?.[0]
  const shape = props?.detail?.[1]

  return (
    <ColumnSection
      badge={props?.eyebrow || undefined}
      title={props?.heading || undefined}
      description={props?.description || undefined}
      mainSide={props?.mainSide === 'right' ? 'right' : 'left'}
      aside={
        <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden">
          <Image
            src={(props?.image as Media)?.url || 'https://dummyimage.com/800x600/37624F/ffffff'}
            alt={(props?.image as Media)?.alt || props?.eyebrow || ''}
            width={800}
            height={600}
            className="h-full w-full object-cover"
          />
        </div>
      }
    >
      {/* Middle widget: trajectory (Product Engineering) */}
      {props?.widget === 'trajectory' && (
        <div className="mb-6 rounded-b-xl bg-[#1a1a17] px-8 pb-8 pt-7">
          <span className="block text-sm font-medium text-neutral-300">{props?.trajectory?.label}</span>

          <div className="mt-14 grid grid-cols-4 gap-4">
            {(props?.trajectory?.steps ?? []).map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full border text-sm ${
                    step?.active
                      ? 'border-white bg-white text-neutral-950'
                      : 'border-neutral-600 bg-transparent text-white'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-base text-neutral-100">{step?.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-16 h-px w-full bg-neutral-200" />
        </div>
      )}

      {/* Middle widget: techStack (Engineering Augmentation) */}
      {props?.widget === 'techStack' && (
        <div className="mb-10">
          <span className="text-xs text-neutral-500 uppercase mb-4 block">{props?.techStack?.label}</span>
          <div className="flex gap-3">
            {(props?.techStack?.items ?? []).map((tech, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${tech?.highlight ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300'}`}
              >
                {tech?.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Middle widget: incident (Managed Services) */}
      {props?.widget === 'incident' && (
        <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl mb-8">
          <div className="flex justify-between text-[10px] text-neutral-500 mb-2">
            <span>{props?.incident?.label}</span>
            <span>{props?.incident?.historyLabel}</span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: props?.incident?.totalCells ?? 0 }).map((_, i) => {
              const active = (props?.incident?.activeCells ?? []).some((c) => c?.position === i + 1)
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${active ? 'bg-emerald-500/50' : 'bg-neutral-800'}`}
                ></div>
              )
            })}
          </div>
        </div>
      )}

      {/* Who/Shape detail cards */}
      {props?.detailStyle === 'bigPanel' && (
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-md bg-[#1a1a17] px-8 pb-12 pt-48">
            <h4 className="mb-4 text-3xl font-semibold tracking-tight text-white">{who?.label}</h4>
            <p className="text-xl leading-tight text-neutral-400">{who?.value}</p>
          </div>
          <div className="rounded-md bg-[#1a1a17] px-8 pb-12 pt-48">
            <h4 className="mb-4 text-3xl font-semibold tracking-tight text-white">{shape?.label}</h4>
            <p className="text-xl leading-tight text-neutral-400">{shape?.value}</p>
          </div>
        </div>
      )}

      {props?.detailStyle === 'largeStacked' && (
        <div className="grid gap-4">
          <InfoCard title={who?.label} description={who?.value} variant="large" />
          <InfoCard title={shape?.label} description={shape?.value} variant="large" />
        </div>
      )}

      {props?.detailStyle === 'compactGrid' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard title={who?.label} description={who?.value} />
          <InfoCard title={shape?.label} description={shape?.value} />
        </div>
      )}
    </ColumnSection>
  )
}

export default SolutionFeatureComponent
