import Motion from '@/components/animation/motion'
import ColumnSection from '@/components/layout/sectionColumn'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { SolutionFeatureBlock } from '@/payload-types'
import { Activity, ArrowDown, Check, Database, GitBranch, GitCommitHorizontal, ShieldCheck, Zap } from 'lucide-react'
import type { JSX, ReactNode } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Signature panel gradient keyed to the feature's widget so each block reads distinctly while
// staying inside the brand palette. trajectory = blue→violet (build), none = violet (transform),
// techStack = red (augmentation), incident = emerald (reliability).
const PANEL_TONE: Record<string, string> = {
  trajectory: 'radial-gradient(135% 135% at 24% 14%, #4f6bed 0%, #5b2b9e 46%, #140f2c 100%)',
  none: 'radial-gradient(140% 140% at 62% 16%, #a855f7 0%, #6d28d9 42%, #241046 100%)',
  techStack: 'radial-gradient(140% 130% at 56% 0%, #e2483d 0%, #8d1d1a 46%, #1f0908 100%)',
  incident: 'radial-gradient(135% 135% at 22% 16%, #1f9d6b 0%, #0f5a3d 46%, #07211a 100%)',
}

// The aside panels are bespoke marketing illustrations (like the isometric cubes in SolutionsHero),
// selected per feature by `widget`. Every string and number they render is CMS-authored — see the
// `outcomes` / `panelStat` / `panelMigration` / `panelCommits` / `panelReliability` groups in
// config.ts. The constants below are the Figma-verbatim defaults, used only where a field is empty,
// so a half-filled block degrades to the original design rather than to blanks.
const DEFAULTS = {
  outcomes: {
    label: 'Outcomes',
    text: 'Production-ready systems, full test coverage, CI/CD pipelines, and zero technical debt at launch.',
  },
  stat: { label: 'Architecture · Zero-to-One', liveLabel: 'Live', value: '10x', caption: 'Scale handled seamlessly' },
  migration: {
    label: 'Migration Plan · Reversible at every step',
    connector: 'Dual-run',
    legacy: { title: 'Legacy', items: ['Monolith', 'Batch jobs', 'Manual deploys'] },
    modern: { title: 'Modern', items: ['Event-driven', 'Streaming', 'Continuous deploy'] },
    metric: {
      label: 'Incident MTTR',
      delta: '−60%',
      beforeLabel: 'Before',
      before: '42 min',
      afterLabel: 'After',
      after: '17 min',
      afterPct: 40,
    },
  },
  commits: {
    label: 'client-repo / main',
    rows: [
      { message: 'feat: orchestrator retry policy', author: 'ternary/mk', added: '+412', removed: '−38' },
      { message: 'refactor: typed event bus', author: 'ternary/as', added: '+209', removed: '−154' },
      { message: 'perf: streaming response chunks', author: 'ternary/jl', added: '+87', removed: '−12' },
      { message: 'fix: rate-limit edge case', author: 'ternary/rp', added: '+34', removed: '−9' },
      { message: 'chore: bump observability stack', author: 'ternary/tr', added: '+156', removed: '−201' },
      { message: 'chore: bump observability stack', author: 'ternary/tr', added: '+156', removed: '−201' },
    ],
    footer: { label: 'Sprint 24 · This week', value: '40%', caption: 'Increase in sprint velocity' },
  },
  reliability: {
    label: 'Reliability Console',
    statusLabel: 'All systems nominal',
    uptime: { value: '99.99%', caption: 'Sustained service availability' },
    chart: { barCount: 56, dips: [15, 40], startLabel: '60d ago', endLabel: 'today' },
    metrics: [
      { label: 'API p99', value: '182ms' },
      { label: 'Error rate', value: '0.02%' },
      { label: 'Queue lag', value: '94ms' },
    ],
  },
}

/** CMS value if it has content, else the design default. Empty strings are treated as unset. */
const val = (cms: string | null | undefined, fallback: string): string => cms?.trim() || fallback

/** CMS rows if the author supplied any, else the design defaults. */
const rows = <T,>(cms: unknown[] | null | undefined, fallback: T[]): (T | unknown)[] =>
  Array.isArray(cms) && cms.length > 0 ? cms : fallback

// Deterministic bar heights (no Math.random → stable across SSR/CSR). `dips` are 1-based positions.
function buildBars(barCount: number, dips: number[]): { height: number; amber: boolean }[] {
  const dipSet = new Set(dips)
  return Array.from({ length: barCount }, (_, i) => {
    const amber = dipSet.has(i + 1)
    const base = 62 + Math.round(24 * Math.abs(Math.sin(i * 0.9)) + (i % 5) * 3)
    return { height: amber ? 44 : Math.min(100, base), amber }
  })
}

// --- Shared panel primitives ---

// Gradient + grain + scrim shell every aside panel sits inside. Children render in a padded
// flex column above the artwork.
function PanelShell({ tone, children }: { tone: string; children: ReactNode }): JSX.Element {
  return (
    <Motion
      tag="div"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE }}
      className="group relative flex min-h-[26rem] flex-col overflow-hidden rounded-md ring-1 ring-line lg:h-full"
    >
      <span
        aria-hidden
        className="absolute inset-0 scale-105 transition-transform duration-[1400ms] ease-out group-hover:scale-110"
        style={{ backgroundImage: tone }}
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />
      <div className="relative z-10 flex flex-1 flex-col gap-5 p-6 lg:p-7">{children}</div>
    </Motion>
  )
}

// Plain 12px caption row at the top of a panel (e.g. "Migration Plan · Reversible at every step").
function PanelLabel({ children, right }: { children: ReactNode; right?: ReactNode }): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px] text-cream/85">
      <span className="inline-flex items-center gap-2">{children}</span>
      {right ? <span className="inline-flex items-center gap-1.5">{right}</span> : null}
    </div>
  )
}

function LiveDot({ label = 'Live' }: { label?: string }): JSX.Element {
  return (
    <>
      <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px] shadow-emerald-300/70" />
      {label}
    </>
  )
}

// Frosted "Outcomes" footer shared by the stat / commits / reliability panels.
function OutcomesBand({ outcomes }: { outcomes?: SolutionFeatureBlock['outcomes'] }): JSX.Element {
  return (
    <div className="rounded-sm bg-black/25 p-5 ring-1 ring-white/10 backdrop-blur-md">
      <span className="block text-[12px] text-cream/70">{val(outcomes?.label, DEFAULTS.outcomes.label)}</span>
      <p className="mt-2 text-[15px] leading-snug text-cream">{val(outcomes?.text, DEFAULTS.outcomes.text)}</p>
    </div>
  )
}

// --- The four bespoke panels ---

// Every panel takes the block's own props so it can read its authored group plus the shared footer.
type PanelProps = { tone: string; block: SolutionFeatureBlock }

// trajectory · Product Engineering — concentric rings behind a large stat.
function StatPanel({ tone, block }: PanelProps): JSX.Element {
  const d = DEFAULTS.stat
  const value = val(block.stat?.value, d.value)
  const caption = val(block.stat?.caption, d.caption)
  return (
    <PanelShell tone={tone}>
      <PanelLabel right={<LiveDot label={val(block.panelStat?.liveLabel, d.liveLabel)} />}>
        {val(block.panelStat?.label, d.label)}
      </PanelLabel>
      <div className="relative flex flex-1 items-center justify-center py-6">
        <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="aspect-square w-[88%] rounded-full ring-1 ring-white/10" />
          <span className="absolute aspect-square w-[60%] rounded-full ring-1 ring-white/[0.07]" />
          <span className="absolute aspect-square w-[34%] rounded-full ring-1 ring-white/10" />
        </span>
        <div className="relative text-center">
          <span className="font-display block text-6xl font-medium leading-none tracking-[-0.05em] text-cream">
            {value}
          </span>
          <span className="mt-3 block text-[12px] leading-none text-cream">{caption}</span>
        </div>
      </div>
      <OutcomesBand outcomes={block.outcomes} />
    </PanelShell>
  )
}

// Small bordered card listing legacy/modern capabilities.
function StackCard({
  title,
  items,
  icon: Icon,
}: {
  title: string
  items: string[]
  icon: typeof Database
}): JSX.Element {
  return (
    <div className="rounded-md bg-black/25 p-3 ring-1 ring-white/10 backdrop-blur-sm">
      <span className="block text-[11px] font-medium text-cream/90">{title}</span>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-[12px] text-cream/75">
            <Icon size={12} className="shrink-0 text-cream/55" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// none · Enterprise Transformation — migration plan (legacy → dual-run → modern) + MTTR before/after.
function MigrationPanel({ tone, block }: PanelProps): JSX.Element {
  const d = DEFAULTS.migration
  const p = block.panelMigration
  const items = (cms: { label?: string | null }[] | null | undefined, fallback: string[]): string[] => {
    const authored = (cms ?? []).map((r) => r?.label?.trim()).filter((s): s is string => Boolean(s))
    return authored.length > 0 ? authored : fallback
  }
  const legacyItems = items(p?.legacy?.items, d.legacy.items)
  const modernItems = items(p?.modern?.items, d.modern.items)
  const afterPct = p?.metric?.afterPct ?? d.metric.afterPct

  return (
    <PanelShell tone={tone}>
      <PanelLabel>{val(p?.label, d.label)}</PanelLabel>
      <div className="flex flex-1 items-stretch gap-4">
        <div className="flex w-[42%] flex-col justify-center gap-2">
          <StackCard title={val(p?.legacy?.title, d.legacy.title)} items={legacyItems} icon={Database} />
          <div className="flex items-center justify-center gap-2 text-[12px] text-cream/80">
            <ArrowDown size={14} aria-hidden />
            <span>{val(p?.connector, d.connector)}</span>
            <ArrowDown size={14} aria-hidden />
          </div>
          <StackCard title={val(p?.modern?.title, d.modern.title)} items={modernItems} icon={Zap} />
        </div>
        <div className="flex flex-1 flex-col justify-between rounded-md bg-black/20 p-4 ring-1 ring-white/10 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <span className="text-[12px] text-cream/80">{val(p?.metric?.label, d.metric.label)}</span>
            <span className="font-display text-2xl font-medium leading-none text-cream">
              {val(p?.metric?.delta, d.metric.delta)}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <Bar
              label={val(p?.metric?.beforeLabel, d.metric.beforeLabel)}
              value={val(p?.metric?.before, d.metric.before)}
              pct={100}
            />
            <Bar
              label={val(p?.metric?.afterLabel, d.metric.afterLabel)}
              value={val(p?.metric?.after, d.metric.after)}
              pct={afterPct}
            />
          </div>
        </div>
      </div>
    </PanelShell>
  )
}

function Bar({ label, value, pct }: { label: string; value: string; pct: number }): JSX.Element {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] text-cream/80">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-cream/85" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// techStack · Engineering Augmentation — live commit feed + sprint-velocity footer.
function CommitsPanel({ tone, block }: PanelProps): JSX.Element {
  const d = DEFAULTS.commits
  const p = block.panelCommits
  const commits = rows(p?.commits, d.rows) as (typeof d.rows)[number][]
  return (
    <PanelShell tone={tone}>
      <PanelLabel>
        <span className="flex items-center gap-1" aria-hidden>
          <span className="size-1.5 rounded-full bg-cream/40" />
          <span className="size-1.5 rounded-full bg-cream/40" />
          <span className="size-1.5 rounded-full bg-cream/40" />
        </span>
        <GitBranch size={13} aria-hidden />
        {val(p?.label, d.label)}
      </PanelLabel>
      <div className="flex-1 divide-y divide-white/10 overflow-hidden rounded-md bg-black/20 ring-1 ring-white/10 backdrop-blur-sm">
        {commits.map((commit, i) => (
          <div key={i} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <GitCommitHorizontal size={14} className="shrink-0 text-cream/55" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-[13px] text-cream">{commit.message}</p>
                <p className="text-[11px] text-cream/55">{commit.author}</p>
              </div>
            </div>
            <span className="shrink-0 font-mono text-[12px]">
              <span className="text-emerald-200">{commit.added}</span>{' '}
              <span className="text-cream/55">{commit.removed}</span>
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 bg-black/25 px-4 py-3">
          <span className="text-[12px] text-cream/80">{val(p?.footer?.label, d.footer.label)}</span>
          <span className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-medium leading-none text-cream">
              {val(p?.footer?.value, d.footer.value)}
            </span>
            <span className="text-[12px] text-cream/70">{val(p?.footer?.caption, d.footer.caption)}</span>
          </span>
        </div>
      </div>
      <OutcomesBand outcomes={block.outcomes} />
    </PanelShell>
  )
}

// incident · Managed Services — reliability console (uptime stat + bar chart + SLO metric cards).
function ReliabilityPanel({ tone, block }: PanelProps): JSX.Element {
  const d = DEFAULTS.reliability
  const p = block.panelReliability

  const authoredDips = (p?.chart?.dips ?? []).map((r) => r?.position).filter((n): n is number => typeof n === 'number')
  const bars = buildBars(p?.chart?.barCount ?? d.chart.barCount, authoredDips.length > 0 ? authoredDips : d.chart.dips)
  const metrics = rows(p?.metrics, d.metrics) as (typeof d.metrics)[number][]

  return (
    <PanelShell tone={tone}>
      <PanelLabel
        right={
          <>
            <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px] shadow-emerald-300/70" />
            {val(p?.statusLabel, d.statusLabel)}
          </>
        }
      >
        <Activity size={13} aria-hidden />
        {val(p?.label, d.label)}
      </PanelLabel>
      <div className="flex flex-1 flex-col gap-4 rounded-md bg-black/20 p-4 ring-1 ring-white/10 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display text-5xl font-medium leading-none tracking-[-0.04em] text-cream">
              {val(p?.uptime?.value, d.uptime.value)}
            </div>
            <div className="mt-2 text-[12px] text-cream/70">{val(p?.uptime?.caption, d.uptime.caption)}</div>
          </div>
          <ShieldCheck size={22} className="text-cream/70" aria-hidden />
        </div>
        <div>
          <div className="flex h-20 items-end gap-[3px]" aria-hidden>
            {bars.map((bar, i) => (
              <div
                key={i}
                className={`flex-1 rounded-[1px] ${bar.amber ? 'bg-amber-400' : 'bg-emerald-300/80'}`}
                style={{ height: `${bar.height}%` }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-cream/55">
            <span>{val(p?.chart?.startLabel, d.chart.startLabel)}</span>
            <span>{val(p?.chart?.endLabel, d.chart.endLabel)}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((metric, i) => (
            <div key={i} className="rounded-md bg-black/25 p-2.5 ring-1 ring-white/10">
              <div className="flex items-center justify-between text-[11px] text-cream/65">
                <span>{metric.label}</span>
                <Check size={11} className="text-emerald-300" aria-hidden />
              </div>
              <div className="mt-1 text-[15px] font-medium text-cream">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>
      <OutcomesBand outcomes={block.outcomes} />
    </PanelShell>
  )
}

// Select the bespoke panel by the feature's `widget` discriminator (the four marketing sections map
// 1:1 to widget values; see config.ts). `none` is Enterprise Transformation's migration plan.
function FeaturePanel({ block }: { block: SolutionFeatureBlock }): JSX.Element {
  const widget = block.widget ?? 'none'
  const tone = PANEL_TONE[widget] ?? PANEL_TONE.none
  switch (widget) {
    case 'none':
      return <MigrationPanel tone={tone} block={block} />
    case 'techStack':
      return <CommitsPanel tone={tone} block={block} />
    case 'incident':
      return <ReliabilityPanel tone={tone} block={block} />
    case 'trajectory':
    default:
      return <StatPanel tone={tone} block={block} />
  }
}

const InfoCard = ({ title, description }: { title?: string | null; description?: string | null }): JSX.Element => (
  <div className="flex min-h-44 flex-col justify-start rounded-md bg-main p-6">
    <h4 className="font-display mb-2 text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">{title}</h4>
    <p className="text-base leading-[1.4] text-body">{description}</p>
  </div>
)

export function SolutionFeatureComponent(props: SolutionFeatureBlock): JSX.Element {
  const who = props?.detail?.[0]
  const shape = props?.detail?.[1]
  const eyebrow = props?.eyebrow?.trim()
  const widget = props?.widget ?? 'none'

  return (
    <ColumnSection
      mainSide={props?.mainSide === 'right' ? 'right' : 'left'}
      aside={<FeaturePanel block={props} />}
      className="py-[72px]"
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
        {props?.description ? (
          <RichTextComp
            content={props.description as RichText}
            className="mt-3 prose-p:mb-0 prose-p:text-base prose-p:leading-[1.4] prose-p:text-body"
          />
        ) : null}
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

      {/* Middle widget: incident (Managed Services) — "24/6 Coverage" history grid */}
      {widget === 'incident' && (props?.incident?.totalCells ?? 0) > 0 && (
        <div className="mb-4 rounded-sm bg-main p-6">
          <div className="mb-3 flex justify-between text-[12px] text-body">
            <span>{props?.incident?.label}</span>
            <span>{props?.incident?.historyLabel}</span>
          </div>
          <div className="grid grid-cols-12 gap-1.5">
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
        <div className="grid grid-cols-2 gap-4">
          {who?.label ? <InfoCard title={who.label} description={who.value} /> : null}
          {shape?.label ? <InfoCard title={shape.label} description={shape.value} /> : null}
        </div>
      )}
    </ColumnSection>
  )
}

export default SolutionFeatureComponent
