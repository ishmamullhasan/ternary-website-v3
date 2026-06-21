import Motion from '@/components/animation/motion'
import ColumnSection from '@/components/layout/sectionColumn'
import type { SolutionFeatureBlock } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Signature panel gradient keyed to the feature's widget so each block reads distinctly while
// staying inside the brand palette. azure/indigo = build, emerald = reliability, indigo = teams.
const PANEL_TONE: Record<string, string> = {
  trajectory: 'radial-gradient(135% 135% at 24% 14%, #4f6bed 0%, #5b2b9e 46%, #140f2c 100%)',
  incident: 'radial-gradient(135% 135% at 22% 16%, #1f9d6b 0%, #0f5a3d 46%, #07211a 100%)',
  techStack: 'radial-gradient(135% 135% at 24% 16%, #4f6bed 0%, #25307e 46%, #0c1030 100%)',
  none: 'radial-gradient(135% 135% at 26% 14%, #2f93da 0%, #134a78 46%, #08233c 100%)',
}

const InfoCard = ({ title, description }: { title?: string | null; description?: string | null }): JSX.Element => (
  <div className="flex min-h-44 flex-col justify-end rounded-md bg-main p-6">
    <h4 className="font-display mb-2 text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">{title}</h4>
    <p className="text-base leading-[1.4] text-body">{description}</p>
  </div>
)

export function SolutionFeatureComponent(props: SolutionFeatureBlock): JSX.Element {
  const who = props?.detail?.[0]
  const shape = props?.detail?.[1]
  const eyebrow = props?.eyebrow?.trim()
  const widget = props?.widget ?? 'none'
  const tone = PANEL_TONE[widget] ?? PANEL_TONE.none

  return (
    <ColumnSection
      mainSide={props?.mainSide === 'right' ? 'right' : 'left'}
      aside={
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="group relative aspect-[4/3] overflow-hidden rounded-md ring-1 ring-line lg:aspect-auto lg:h-full lg:min-h-[28rem]"
        >
          {/* Signature gradient + grain — the panel always renders (no broken/empty media box). */}
          <span
            aria-hidden
            className="absolute inset-0 scale-105 transition-transform duration-[1400ms] ease-out group-hover:scale-110"
            style={{ backgroundImage: tone }}
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
          />
          {/* Concentric rings motif behind the stat — echoes the design's radial composition. */}
          <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="aspect-square w-[88%] rounded-full ring-1 ring-white/10" />
            <span className="absolute aspect-square w-[60%] rounded-full ring-1 ring-white/[0.07]" />
            <span className="absolute aspect-square w-[34%] rounded-full ring-1 ring-white/10" />
          </span>
          <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />

          {/* Stat group centered inside the rings (Figma 1468:4314/4316) — value as a large Poppins
              display number, caption as a 12px cream label. Only rendered when present; rings stay
              empty otherwise. */}
          {props?.stat?.value || props?.stat?.caption ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {props?.stat?.value ? (
                <span className="font-display text-6xl font-medium leading-none tracking-[-0.05em] text-cream">
                  {props.stat.value}
                </span>
              ) : null}
              {props?.stat?.caption ? (
                <span className="mt-3 text-[12px] leading-none text-cream">{props.stat.caption}</span>
              ) : null}
            </div>
          ) : null}

          {/* Top meta row — discipline label + live indicator (Figma: plain Inter caption, no uppercase). */}
          {eyebrow ? (
            <div className="absolute inset-x-8 top-8 flex items-center justify-between">
              <span className="text-[12px] text-cream">{eyebrow}</span>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-cream">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/70" />
                Live
              </span>
            </div>
          ) : null}

          {/* Outcomes band — surfaces the feature description over a frosted overlay (Figma backdrop-blur). */}
          {props?.description ? (
            <div className="absolute inset-x-8 bottom-8 rounded-sm bg-ink/20 p-5 backdrop-blur-xl">
              <span className="block text-[12px] text-body">Outcomes</span>
              <p className="mt-2 text-base leading-[1.4] text-cream">{props.description}</p>
            </div>
          ) : null}
        </Motion>
      }
    >
      {/* Header — rendered here (not via ColumnSection) for correct eyebrow scale, eggshell heading and Inter labels. */}
      <Motion
        tag="div"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: EASE }}
        className="mb-8"
      >
        {eyebrow ? (
          <span className="font-display inline-flex items-center rounded-full border border-line bg-main px-4 py-2 text-[18px] font-normal leading-none text-cream">
            {eyebrow}
          </span>
        ) : null}
        {props?.heading ? (
          <h2 className="font-display mt-8 max-w-xl text-3xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">
            {props.heading}
          </h2>
        ) : null}
        {props?.description ? <p className="mt-3 text-base leading-[1.4] text-body">{props.description}</p> : null}
      </Motion>

      {/* Middle widget: trajectory (Product Engineering) */}
      {widget === 'trajectory' && (props?.trajectory?.steps?.length ?? 0) > 0 && (
        <div className="mb-4 flex h-[200px] flex-col justify-between rounded-sm bg-main p-6">
          <span className="block text-[12px] text-body">{props?.trajectory?.label}</span>

          <div className="grid grid-cols-4 gap-4">
            {(props?.trajectory?.steps ?? []).map((step, i) => (
              <div key={step?.id ?? i} className="flex flex-col items-center gap-3 text-center">
                <div
                  className={`flex size-7 items-center justify-center rounded-full border text-[10px] ${
                    step?.active ? 'border-cream bg-cream text-main' : 'border-line-strong bg-ink text-cream'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-[12px] text-cream">{step?.label}</span>
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-cream/30 to-cream" />
        </div>
      )}

      {/* Middle widget: techStack (Engineering Augmentation) */}
      {widget === 'techStack' && (props?.techStack?.items?.length ?? 0) > 0 && (
        <div className="mb-4 rounded-sm bg-main p-6">
          <span className="mb-4 block text-[12px] text-body">{props?.techStack?.label}</span>
          <div className="flex flex-wrap gap-3">
            {(props?.techStack?.items ?? []).map((tech, i) => (
              <div
                key={tech?.id ?? i}
                className={`flex size-11 items-center justify-center rounded-full text-[12px] font-medium transition-colors ${
                  tech?.highlight ? 'bg-cream text-main' : 'bg-ink text-cream ring-1 ring-line-strong'
                }`}
              >
                {tech?.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Middle widget: incident (Managed Services) */}
      {widget === 'incident' && (props?.incident?.totalCells ?? 0) > 0 && (
        <div className="mb-4 rounded-sm bg-main p-6">
          <div className="mb-3 flex justify-between text-[12px] text-body">
            <span>{props?.incident?.label}</span>
            <span>{props?.incident?.historyLabel}</span>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: props?.incident?.totalCells ?? 0 }).map((_, i) => {
              const active = (props?.incident?.activeCells ?? []).some((c) => c?.position === i + 1)
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-[2px] ${active ? 'bg-emerald-400/80' : 'bg-ink ring-1 ring-line'}`}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Who/Shape detail cards */}
      {(who?.label || shape?.label) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {who?.label ? <InfoCard title={who.label} description={who.value} /> : null}
          {shape?.label ? <InfoCard title={shape.label} description={shape.value} /> : null}
        </div>
      )}
    </ColumnSection>
  )
}

export default SolutionFeatureComponent
