import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Scale, ScaleShowcaseBlock } from '@/payload-types'
import { Building2, Landmark, Rocket, ShieldCheck, TrendingUp } from 'lucide-react'
import type { JSX } from 'react'

/**
 * Scale showcase (design node 1459:6437 et al, elevated).
 *
 * One section per engagement tier. The design's figure/ground: the tier HEADER (pill + display
 * heading + description + meta) sits on the page background, and only the structured content
 * lives inside a Surface/Card (#1b1a17) data panel — followed by a divider and a Descriptions
 * row of term/value pairs.
 *
 * Each tier now carries a `panelType` that selects the bespoke data viz the design specifies:
 *   - 'generic' (default) — the original capability-grid + metric-row card, unchanged. Used as the
 *     graceful fallback whenever the bespoke arrays are empty.
 *   - 'sprint'    (1459:5739 / 1459:5768) — two columns: a numbered "how we show up" list and a
 *     live-sprint log table with right-aligned status pills.
 *   - 'roadmap'   (1468:4349) — a Q1–Q4 Gantt with per-phase progress bars + footnote columns.
 *   - 'procurement' (1468:4533) — a capability term/value table beside a numbered procurement path.
 * Every bespoke panel still renders the shared `podSize` Descriptions row beneath it, matching the
 * design, and degrades to nothing when its driving array is empty.
 *
 * Reveals use the shared <Motion> wrapper (honors prefers-reduced-motion); hover is pure Tailwind.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Per-tier icon, cycled by index so each tier reads with its own glyph rather than a single
// repeated Building2. Order tracks the typical tier sequence startup → scale → enterprise → gov.
const TIER_ICONS = [Rocket, TrendingUp, Building2, ShieldCheck, Landmark]

// Sprint-log status → pill color. Subtle/grey for queued, brand-adjacent accents otherwise.
const SPRINT_STATUS_STYLES: Record<NonNullable<NonNullable<Scale['sprintLog']>[number]['status']>, string> = {
  shipped: 'text-emerald-400',
  'in-review': 'text-amber-400',
  'in-build': 'text-blue-400',
  queued: 'text-subtle',
}

const SPRINT_STATUS_LABELS: Record<NonNullable<NonNullable<Scale['sprintLog']>[number]['status']>, string> = {
  shipped: 'shipped',
  'in-review': 'in review',
  'in-build': 'in build',
  queued: 'queued',
}

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const
type Quarter = (typeof QUARTERS)[number]

// Metrics row (podSize) — shared across every panel type, matching the design's Descriptions row.
function MetricsRow({
  metrics,
  keyBase,
}: {
  metrics: NonNullable<Scale['podSize']>
  keyBase: string
}): JSX.Element | null {
  if (metrics.length === 0) return null
  return (
    <div
      className={`grid grid-cols-1 border-t border-line ${metrics.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
    >
      {metrics.map((metric, idx) => (
        <div
          key={metric.id ?? `${keyBase}-metric-${idx}`}
          className={`flex flex-col gap-2 p-4 ${idx > 0 ? 'border-t border-line sm:border-t-0 sm:border-l' : ''}`}
        >
          {metric.title && <span className="text-[12px] tracking-[-0.01em] text-subtle">{metric.title}</span>}
          {metric.value && (
            <span className="font-display text-[24px] font-medium leading-[1.15] tracking-[-0.02em] text-cream">
              {metric.value}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// --- sprint panel (1459:5739 / 1459:5768) ---------------------------------------------------------
function SprintPanel({ item, keyBase }: { item: Scale; keyBase: string }): JSX.Element | null {
  const showUp = (item.showUp ?? []).filter((s) => s?.title || s?.subtext || s?.number)
  const sprintLog = (item.sprintLog ?? []).filter((s) => s?.day || s?.label || s?.status)
  const meta = item.sprintMeta ?? {}
  const metrics = (item.podSize ?? []).filter((m) => m?.value || m?.title)

  if (showUp.length === 0 && sprintLog.length === 0 && metrics.length === 0) return null

  return (
    <div className="mt-8 w-full rounded-md border border-line bg-main">
      {(showUp.length > 0 || sprintLog.length > 0) && (
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 p-6 lg:grid-cols-2">
          {/* How we show up — numbered list */}
          {showUp.length > 0 && (
            <div>
              <span className="text-[12px] tracking-[-0.01em] text-subtle">How we show up</span>
              <ul className="mt-5 flex flex-col gap-4">
                {showUp.map((entry, idx) => (
                  <li key={entry.id ?? `${keyBase}-showup-${idx}`} className="flex items-start gap-4">
                    <span className="mt-px w-5 shrink-0 text-[12px] tabular-nums leading-[1.3] text-subtle">
                      {entry.number ?? String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="flex flex-col gap-1">
                      {entry.title && (
                        <span className="text-[14px] font-medium leading-[1.15] tracking-[-0.01em] text-cream">
                          {entry.title}
                        </span>
                      )}
                      {entry.subtext && (
                        <span className="text-[14px] leading-[1.15] tracking-[-0.01em] text-subtle">
                          {entry.subtext}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sprint log — day code + label + right-aligned status pill */}
          {sprintLog.length > 0 && (
            <div>
              {(meta.statusLabel || meta.cadenceLabel) && (
                <div className="flex items-center justify-between gap-4 text-[12px] tracking-[-0.01em] text-subtle">
                  {meta.statusLabel && <span>{meta.statusLabel}</span>}
                  {meta.cadenceLabel && <span className="text-right">{meta.cadenceLabel}</span>}
                </div>
              )}
              <ul className={`flex flex-col ${meta.statusLabel || meta.cadenceLabel ? 'mt-5' : ''}`}>
                {sprintLog.map((entry, idx) => {
                  const status = entry.status ?? null
                  return (
                    <li
                      key={entry.id ?? `${keyBase}-sprint-${idx}`}
                      className="flex items-center justify-between gap-4 py-2"
                    >
                      <span className="flex items-baseline gap-3">
                        {entry.day && (
                          <span className="w-7 shrink-0 text-[12px] tabular-nums leading-none text-subtle">
                            {entry.day}
                          </span>
                        )}
                        {entry.label && (
                          <span className="text-[14px] font-medium leading-none tracking-[-0.01em] text-cream">
                            {entry.label}
                          </span>
                        )}
                      </span>
                      {status && (
                        <span className={`shrink-0 text-[12px] leading-none ${SPRINT_STATUS_STYLES[status]}`}>
                          {SPRINT_STATUS_LABELS[status]}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      <MetricsRow metrics={metrics} keyBase={keyBase} />
    </div>
  )
}

// --- roadmap panel (1468:4349) --------------------------------------------------------------------
function RoadmapPanel({ item, keyBase }: { item: Scale; keyBase: string }): JSX.Element | null {
  const phases = (item.roadmap ?? []).filter((p) => p?.phase || p?.startQuarter || p?.endQuarter)
  const footnotes = (item.footnotes ?? []).filter((f) => f?.title || f?.subtext || f?.number)
  const meta = item.roadmapMeta ?? {}
  const metrics = (item.podSize ?? []).filter((m) => m?.value || m?.title)

  if (phases.length === 0 && footnotes.length === 0 && metrics.length === 0) return null

  // Span label like "Q1" or "Q2–Q3".
  const spanLabel = (start: Quarter | null, end: Quarter | null): string => {
    if (start && end && start !== end) return `${start}–${end}`
    return end ?? start ?? ''
  }

  // Gantt geometry: each quarter is one of four equal columns (0..1). The bar starts at the start
  // quarter's left edge and ends at the end quarter's right edge; the progress fill is a fraction
  // of that span. Falls back to a full single-quarter span when quarters are missing.
  const barGeometry = (start: Quarter | null, end: Quarter | null) => {
    const startIdx = start ? QUARTERS.indexOf(start) : 0
    const rawEndIdx = end ? QUARTERS.indexOf(end) : startIdx
    const endIdx = rawEndIdx < startIdx ? startIdx : rawEndIdx
    const left = (startIdx / QUARTERS.length) * 100
    const width = ((endIdx - startIdx + 1) / QUARTERS.length) * 100
    return { left, width }
  }

  return (
    <div className="mt-8 w-full rounded-md border border-line bg-main">
      {(phases.length > 0 || footnotes.length > 0) && (
        <div className="p-6">
          {/* Header meta row */}
          {(meta.label || meta.span) && (
            <div className="flex items-center justify-between gap-4 text-[12px] tracking-[-0.01em] text-subtle">
              {meta.label && <span>{meta.label}</span>}
              {meta.span && <span className="text-right">{meta.span}</span>}
            </div>
          )}

          {phases.length > 0 && (
            <>
              {/* Quarter header — Phase label + Q1..Q4 grid + Span */}
              <div className="mt-5 flex items-center border-b border-line pb-3 text-[12px] tracking-[-0.01em] text-subtle">
                <span className="w-[40%] sm:w-[180px]">Phase</span>
                <span className="grid flex-1 grid-cols-4">
                  {QUARTERS.map((q) => (
                    <span key={`${keyBase}-qh-${q}`} className="border-l border-line pl-2">
                      {q}
                    </span>
                  ))}
                </span>
                <span className="hidden w-[60px] text-right sm:inline">Span</span>
              </div>

              {/* Phase rows */}
              <div>
                {phases.map((phase, idx) => {
                  const start = (phase.startQuarter ?? null) as Quarter | null
                  const end = (phase.endQuarter ?? null) as Quarter | null
                  const { left, width } = barGeometry(start, end)
                  const progress = Math.max(0, Math.min(100, phase.progress ?? 100))
                  return (
                    <div
                      key={phase.id ?? `${keyBase}-phase-${idx}`}
                      className={`flex items-center py-4 ${idx > 0 ? 'border-t border-line' : ''}`}
                    >
                      {/* Phase name + number */}
                      <span className="flex w-[40%] items-baseline gap-3 sm:w-[180px]">
                        <span className="text-[12px] tabular-nums leading-none text-subtle">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        {phase.phase && (
                          <span className="text-[14px] font-medium leading-[1.2] tracking-[-0.01em] text-cream">
                            {phase.phase}
                          </span>
                        )}
                      </span>

                      {/* Gantt track */}
                      <span className="relative flex-1">
                        {/* Quarter gridlines */}
                        <span className="grid grid-cols-4">
                          {QUARTERS.map((q) => (
                            <span key={`${keyBase}-gl-${idx}-${q}`} className="h-2 border-l border-line" />
                          ))}
                        </span>
                        {/* Bar span with progress fill */}
                        <span
                          className="absolute top-0 h-2 rounded-full bg-line-strong"
                          style={{ left: `${left}%`, width: `${width}%` }}
                        >
                          <span className="block h-2 rounded-full bg-cream" style={{ width: `${progress}%` }} />
                        </span>
                      </span>

                      {/* Span label */}
                      <span className="hidden w-[60px] text-right text-[12px] tabular-nums leading-none text-subtle sm:inline">
                        {spanLabel(start, end)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Footnote columns */}
          {footnotes.length > 0 && (
            <div
              className={`mt-2 grid grid-cols-1 gap-6 border-t border-line pt-6 sm:grid-cols-2 ${
                footnotes.length >= 3 ? 'lg:grid-cols-3' : ''
              }`}
            >
              {footnotes.map((note, idx) => (
                <div key={note.id ?? `${keyBase}-foot-${idx}`} className="flex flex-col gap-2">
                  <span className="text-[12px] tabular-nums leading-none text-subtle">
                    {note.number ?? String(idx + 1).padStart(2, '0')}
                  </span>
                  {note.title && (
                    <span className="text-[14px] font-medium leading-[1.15] tracking-[-0.01em] text-cream">
                      {note.title}
                    </span>
                  )}
                  {note.subtext && (
                    <span className="text-[14px] leading-[1.3] tracking-[-0.01em] text-subtle">{note.subtext}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <MetricsRow metrics={metrics} keyBase={keyBase} />
    </div>
  )
}

// --- procurement panel (1468:4533) ----------------------------------------------------------------
function ProcurementPanel({ item, keyBase }: { item: Scale; keyBase: string }): JSX.Element | null {
  const capability = (item.capability ?? []).filter((c) => c?.term || c?.value)
  const path = (item.procurementPath ?? []).filter((p) => p?.title || p?.subtext || p?.number)
  const metrics = (item.podSize ?? []).filter((m) => m?.value || m?.title)

  if (capability.length === 0 && path.length === 0 && metrics.length === 0) return null

  return (
    <div className="mt-8 w-full rounded-md border border-line bg-main">
      {(capability.length > 0 || path.length > 0) && (
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 p-6 lg:grid-cols-2">
          {/* Capability statement — term/value table */}
          {capability.length > 0 && (
            <div>
              <span className="text-[12px] tracking-[-0.01em] text-subtle">Capability statement</span>
              <dl className="mt-5">
                {capability.map((row, idx) => (
                  <div
                    key={row.id ?? `${keyBase}-cap-${idx}`}
                    className={`flex items-start gap-4 py-3 ${idx > 0 ? 'border-t border-line' : ''}`}
                  >
                    {row.term && (
                      <dt className="w-[40%] shrink-0 text-[14px] leading-[1.3] tracking-[-0.01em] text-subtle">
                        {row.term}
                      </dt>
                    )}
                    {row.value && (
                      <dd className="text-[14px] font-medium leading-[1.3] tracking-[-0.01em] text-cream">
                        {row.value}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Procurement path — numbered list with vertical connector */}
          {path.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-4 text-[12px] tracking-[-0.01em] text-subtle">
                <span>Procurement path</span>
                <span className="text-right">
                  {path.length} {path.length === 1 ? 'stage' : 'stages'}
                </span>
              </div>
              <ol className="relative mt-5 flex flex-col gap-6">
                {/* Vertical connector line behind the number badges */}
                <span aria-hidden className="absolute bottom-3 left-3 top-3 w-px bg-line" />
                {path.map((stage, idx) => (
                  <li key={stage.id ?? `${keyBase}-stage-${idx}`} className="relative flex items-start gap-4">
                    <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-line bg-main text-[12px] tabular-nums leading-none text-subtle">
                      {stage.number ?? String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="flex flex-col gap-1 pt-0.5">
                      {stage.title && (
                        <span className="text-[14px] font-medium leading-[1.2] tracking-[-0.01em] text-cream">
                          {stage.title}
                        </span>
                      )}
                      {stage.subtext && (
                        <span className="text-[14px] leading-[1.3] tracking-[-0.01em] text-subtle">
                          {stage.subtext}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <MetricsRow metrics={metrics} keyBase={keyBase} />
    </div>
  )
}

export function ScaleShowcaseComponent(props: ScaleShowcaseBlock): JSX.Element {
  const scales = (props.scales as Scale[] | null | undefined)?.filter(Boolean) ?? []

  if (scales.length === 0) return <></>

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 lg:gap-24">
      {scales.map((item, scaleIndex) => {
        const tagsList = item.tags
          ? item.tags
              .split(/[•,|]/)
              .map((tag) => tag.trim())
              .filter(Boolean)
          : []
        const metrics = (item.podSize ?? []).filter((m) => m?.value || m?.title)
        const TierIcon = TIER_ICONS[scaleIndex % TIER_ICONS.length]
        const panelType = item.panelType ?? 'generic'
        const keyBase = String(item.id ?? scaleIndex)
        const hasGenericContent = tagsList.length > 0 || metrics.length > 0

        return (
          <Motion
            key={item.id ?? `scale-${scaleIndex}`}
            tag="section"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex w-full flex-col"
          >
            {/* Header — sits on the page background */}
            <div className="flex max-w-3xl flex-col items-start text-left">
              {item.subTitle && (
                <span className="mb-4 inline-block rounded-full border border-line bg-main px-4 py-2 text-[14px] font-medium leading-none text-cream">
                  {item.subTitle}
                </span>
              )}

              {item.title && (
                <h2 className="font-display max-w-2xl text-[clamp(1.6rem,3.4vw,1.875rem)] font-medium leading-[1.15] tracking-[-0.017em] text-cream">
                  {item.title}
                </h2>
              )}

              {item.description && (
                <RichTextComp
                  content={item.description as RichText}
                  className="prose-sm mt-4 max-w-2xl text-[16px] leading-[1.5] text-body"
                />
              )}

              {tagsList.length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-[12px] tracking-[-0.01em] text-subtle">
                  <TierIcon size={14} strokeWidth={1.75} aria-hidden className="shrink-0" />
                  <span className="leading-none">{tagsList.join(' · ')}</span>
                </div>
              )}
            </div>

            {/* Data panel — bespoke per panelType, generic by default */}
            {panelType === 'sprint' ? (
              <SprintPanel item={item} keyBase={keyBase} />
            ) : panelType === 'roadmap' ? (
              <RoadmapPanel item={item} keyBase={keyBase} />
            ) : panelType === 'procurement' ? (
              <ProcurementPanel item={item} keyBase={keyBase} />
            ) : (
              hasGenericContent && (
                <div className="mt-8 w-full rounded-md border border-line bg-main">
                  {tagsList.length > 0 && (
                    <div className="p-6">
                      <span className="text-[12px] tracking-[-0.01em] text-subtle">How we show up</span>
                      <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                        {tagsList.map((tag, idx) => (
                          <li
                            key={`${keyBase}-tag-${idx}`}
                            className="group flex items-start gap-3 border-t border-line pt-4"
                          >
                            <span className="mt-px text-[12px] tabular-nums leading-none text-subtle">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[14px] font-medium capitalize leading-[1.3] tracking-[-0.01em] text-cream transition-colors duration-300 group-hover:text-cream">
                              {tag}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <MetricsRow metrics={metrics} keyBase={keyBase} />
                </div>
              )
            )}
          </Motion>
        )
      })}
    </div>
  )
}
