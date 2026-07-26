import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import { cn } from '@/lib/utils'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import type { JSX, ReactNode } from 'react'

/**
 * Capabilities hub — landing redesign (design/capability-detail-redesign).
 *
 * The eight-discipline index, rebuilt from the supplied capabilities-hub content into Ternary's
 * own design language: monochrome cream-on-near-black (no amber), Poppins display + Inter body,
 * the brand tokens (page/ink/card/line/subtle), tabular numerals in place of a mono face, the
 * shared Motion scroll-reveal, and one signature noise-gradient CTA moment. Authored standalone so
 * the design can be reviewed at /capabilities-hub without disturbing the CMS landing.
 *
 * Structure: hero + index → framing statement → the numbered index (the centerpiece) → how they
 * combine → the one standard → closing CTA. Numbers stay in base three — it's in the name.
 */

export const metadata: Metadata = {
  title: 'Capabilities — Eight disciplines. One standard.',
  description:
    'The eight technical practices behind everything Ternary builds and runs — each with a named lead, house standards, and work in production.',
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' } as const,
  transition: { duration: 0.6, ease: EASE },
}

const revealItem = (index: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' } as const,
  transition: { duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) },
})

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

// ---------------------------------------------------------------------------------------------
// Content — base-three index, mapped to detail-page slugs.
// ---------------------------------------------------------------------------------------------
const CAPABILITIES = [
  {
    n: '00',
    name: 'Agentic Architecture',
    slug: 'agentic-architecture',
    body: 'AI that does real work — and answers for it. Systems that plan, act, and verify, with people in command of anything that matters.',
    tags: ['Multi-agent systems', 'Tool use & permissions', 'Evals & guardrails', 'Human oversight'],
  },
  {
    n: '01',
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    body: 'LLM applications and machine learning built for production, not demos. Shipped, monitored, and owned after launch.',
    tags: ['LLM applications', 'ML pipelines', 'Retrieval & search', 'Model operations'],
  },
  {
    n: '02',
    name: 'Data & Analytics',
    slug: 'data-analytics',
    body: 'One source of truth. Pipelines, warehouses, and numbers your teams can actually act on.',
    tags: ['Data pipelines', 'Warehousing', 'Decision analytics', 'Governance'],
  },
  {
    n: '10',
    name: 'Cloud Transformation',
    slug: 'cloud-transformation',
    body: 'Move to the cloud without betting the business on the move. Architecture, migration, and operations — governed for regulated environments.',
    tags: ['Migration', 'Cloud-native architecture', 'Platform operations', 'Compliance'],
  },
  {
    n: '11',
    name: 'Platformization',
    slug: 'platformization',
    body: 'Turn one-off builds into shared platforms, so every next project starts further ahead instead of from zero.',
    tags: ['Internal platforms', 'Reusable services', 'APIs & SDKs', 'Developer experience'],
  },
  {
    n: '12',
    name: 'Digital Experiences',
    slug: 'digital-experiences',
    body: 'Web, mobile, and product interfaces people trust at first use — clear, fast, and dependable on every device.',
    tags: ['Web & mobile', 'Product design', 'Accessibility', 'Performance'],
  },
  {
    n: '20',
    name: 'DevOps & Automation',
    slug: 'devops-automation',
    body: 'We make shipping boring. More releases, fewer incidents, and no two-a.m. surprises.',
    tags: ['CI/CD', 'Observability', 'Reliability', 'Release automation'],
  },
  {
    n: '21',
    name: 'Internet of Things',
    slug: 'internet-of-things',
    body: 'From the sensor to the dashboard — devices, firmware, and the data they send home.',
    tags: ['Firmware', 'Edge computing', 'Telemetry', 'Device fleets'],
  },
] as const

const COMBINATIONS = [
  {
    tag: 'Capital markets',
    title: 'Dhaka Stock Exchange',
    body: "A national exchange's public platform, rebuilt from the ground up — modern, bilingual, and accessible — without touching the trading core.",
    caps: [
      ['12', 'Digital Experiences'],
      ['02', 'Data & Analytics'],
      ['10', 'Cloud Transformation'],
    ],
  },
  {
    tag: 'Capital markets · AI',
    title: 'LankaBangla Securities',
    body: 'A governed, air-gapped AI layer that lets brokerage advisors query market and portfolio data in plain language — production systems never exposed.',
    caps: [
      ['00', 'Agentic Architecture'],
      ['01', 'Artificial Intelligence'],
      ['02', 'Data & Analytics'],
    ],
  },
  {
    tag: 'Experience economy',
    title: 'Counterfoil',
    body: 'A booking monolith rebuilt as an event-driven platform — while the original stayed live and taking bookings the whole time.',
    caps: [
      ['11', 'Platformization'],
      ['20', 'DevOps & Automation'],
      ['12', 'Digital Experiences'],
    ],
  },
] as const

const STANDARD = [
  {
    k: 'a',
    title: 'Led by a practitioner',
    body: 'Every capability has a named lead who still builds. You can meet them before you sign anything.',
  },
  {
    k: 'b',
    title: 'Proven in production',
    body: "We list only what we currently run for clients. If it isn't live somewhere, it isn't on this page.",
  },
  {
    k: 'c',
    title: 'Owned past launch',
    body: 'Capability work ships with monitoring, documentation, and a handover we stand behind — or we keep running it ourselves.',
  },
] as const

// Eyebrow — hairline + uppercase micro-label, cream-accented rule instead of the amber original.
function Eyebrow({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="flex items-center gap-3 text-[12px] uppercase tracking-[0.16em] text-subtle">
      <span aria-hidden className="h-px w-6 bg-cream/60" />
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------------------------
export default function CapabilitiesHubPage(): JSX.Element {
  return (
    <div className="w-full pb-24 lg:pb-32">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line/60">
        {/* faint vertical rule field — quiet engineering texture */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(244,243,236,0.02) 0 1px, transparent 1px 120px)',
          }}
        />
        <div className="relative mx-auto w-full max-w-[1480px] px-5 pt-24 pb-16 lg:pt-32 lg:pb-24">
          <Motion className="flex flex-col gap-7" {...reveal}>
            <Eyebrow>Capability index · 00–21 · base 3</Eyebrow>
            <h1 className="max-w-[15ch] font-display text-[clamp(2.75rem,7vw,6rem)] font-medium leading-[1.01] tracking-[-0.04em] text-cream">
              Eight disciplines. One standard.
            </h1>
            <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-body">
              The technical practices behind everything we build and run. Each has a named lead, house standards, and
              work in production to show for it.
            </p>
          </Motion>

          {/* hero index — jump links to the rows below */}
          <Motion
            className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-line/70 pt-7 lg:mt-20"
            {...reveal}
          >
            {CAPABILITIES.map((c) => (
              <Link
                key={c.n}
                href={`#c${c.n}`}
                className={cn(
                  'group inline-flex items-center gap-2.5 rounded-sm text-[13px] tracking-[0.02em] text-subtle transition-colors duration-200 hover:text-cream',
                  FOCUS_RING,
                )}
              >
                <span className="tabular-nums text-cream/45 transition-colors duration-200 group-hover:text-cream">
                  {c.n}
                </span>
                {c.name}
              </Link>
            ))}
          </Motion>
        </div>
      </section>

      {/* ── FRAMING ──────────────────────────────────────────────────────────────────────── */}
      <section className="border-b border-line/60">
        <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-16 lg:py-32">
          <Motion {...reveal}>
            <p className="max-w-[30ch] font-display text-[clamp(1.5rem,2.6vw,2rem)] font-medium leading-[1.28] tracking-[-0.02em] text-cream">
              A capability, to us, is not a keyword on a services page.{' '}
              <span className="text-body">It&apos;s a practice we run in production.</span>
            </p>
          </Motion>
          <Motion className="self-end" {...reveal}>
            <p className="max-w-[46ch] text-[16px] leading-relaxed text-body">
              Each of the eight below has people who own it, methods we can defend, and clients who can vouch for it. We
              only list what we currently run for clients — nothing aspirational, nothing outsourced to a slide.
            </p>
          </Motion>
        </div>
      </section>

      {/* ── THE INDEX (centerpiece) ──────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5 py-24 lg:py-32">
        <Motion className="mb-14 flex flex-wrap items-end justify-between gap-6 lg:mb-20" {...reveal}>
          <div className="flex flex-col gap-4">
            <Eyebrow>The index</Eyebrow>
            <h2 className="font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
              What we practice
            </h2>
          </div>
          <p className="max-w-[46ch] text-[16px] leading-relaxed text-body">
            Numbered in base three — it&apos;s in the name. Open any practice for the methods, the standards, and the
            work behind it.
          </p>
        </Motion>

        <div className="border-b border-line">
          {CAPABILITIES.map((c, i) => (
            <Motion key={c.n} {...revealItem(i)}>
              <Link
                id={`c${c.n}`}
                href={`/capabilities/${c.slug}`}
                className={cn(
                  'group grid scroll-mt-28 grid-cols-[3rem_1fr] items-start gap-x-6 gap-y-4 border-t border-line py-9 transition-colors duration-300 hover:bg-gradient-to-r hover:from-white/[0.03] hover:to-transparent lg:grid-cols-[7rem_minmax(0,1.05fr)_minmax(0,1.5fr)_3rem] lg:gap-x-8 lg:py-12',
                  FOCUS_RING,
                )}
              >
                <span className="pt-1 font-display text-[15px] tabular-nums text-subtle transition-colors duration-300 group-hover:text-cream">
                  {c.n}
                </span>

                <h3 className="font-display text-[clamp(1.375rem,2.4vw,1.875rem)] font-medium leading-[1.12] tracking-[-0.02em] text-cream">
                  {c.name}
                </h3>

                <div className="col-span-2 lg:col-span-1 lg:col-start-3">
                  <p className="max-w-[56ch] text-[16px] leading-relaxed text-body">{c.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-sm border border-line px-2.5 py-1 text-[11px] tracking-[0.03em] text-subtle transition-colors duration-300 group-hover:border-line-strong group-hover:text-body"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <ArrowUpRight
                  size={20}
                  strokeWidth={1.75}
                  aria-hidden
                  className="col-start-2 row-start-1 hidden justify-self-end text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cream lg:col-start-4 lg:block"
                />
              </Link>
            </Motion>
          ))}
        </div>
      </section>

      {/* ── COMBINATIONS ─────────────────────────────────────────────────────────────────── */}
      <section className="border-t border-line/60">
        <div className="mx-auto w-full max-w-[1480px] px-5 py-24 lg:py-32">
          <Motion className="mb-14 flex flex-wrap items-end justify-between gap-6 lg:mb-20" {...reveal}>
            <div className="flex flex-col gap-4">
              <Eyebrow>In practice</Eyebrow>
              <h2 className="font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
                They ship together
              </h2>
            </div>
            <p className="max-w-[46ch] text-[16px] leading-relaxed text-body">
              Most engagements draw on three or four capabilities at once. A modernization is never just cloud. A
              product is never just interface.
            </p>
          </Motion>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {COMBINATIONS.map((combo, i) => (
              <Motion key={combo.title} className="h-full" {...revealItem(i)}>
                <Link
                  href="/case-studies"
                  className={cn(
                    'group flex h-full min-h-[340px] flex-col rounded-md border border-line bg-ink p-8 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong',
                    FOCUS_RING,
                  )}
                >
                  <span className="text-[11px] uppercase tracking-[0.12em] text-subtle">{combo.tag}</span>
                  <h3 className="mt-4 font-display text-[20px] font-medium leading-snug tracking-[-0.02em] text-cream">
                    {combo.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-body">{combo.body}</p>

                  <div className="mt-7 flex flex-col gap-2.5 border-t border-line pt-5">
                    {combo.caps.map(([n, name]) => (
                      <span key={n} className="flex items-baseline gap-3 text-[13px] text-body">
                        <span className="tabular-nums text-cream/50">{n}</span>
                        {name}
                      </span>
                    ))}
                  </div>

                  <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-cream">
                    Read the case study
                    <ArrowUpRight
                      size={14}
                      strokeWidth={2}
                      aria-hidden
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE STANDARD ─────────────────────────────────────────────────────────────────── */}
      <section className="border-t border-line/60">
        <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-12 px-5 py-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20 lg:py-32">
          <Motion className="flex flex-col gap-4" {...reveal}>
            <Eyebrow>The bar</Eyebrow>
            <h2 className="max-w-[12ch] font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
              One standard across all eight
            </h2>
          </Motion>

          <div className="flex flex-col border-b border-line">
            {STANDARD.map((s, i) => (
              <Motion
                key={s.k}
                className="flex flex-col gap-2 border-t border-line py-7"
                {...revealItem(i)}
              >
                <h4 className="flex items-baseline gap-3.5 text-[18px] font-medium tracking-[-0.01em] text-cream">
                  <span className="font-display text-[13px] tabular-nums text-cream/50">{s.k}.</span>
                  {s.title}
                </h4>
                <p className="max-w-[48ch] pl-[26px] text-[15px] leading-relaxed text-body">{s.body}</p>
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (signature noise-gradient moment) ────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5">
        <Motion
          tag="div"
          className="relative overflow-hidden rounded-md border border-white/[0.06] p-10 lg:p-16"
          {...reveal}
        >
          <span aria-hidden className="absolute inset-0">
            <span
              className="absolute inset-0"
              style={{ backgroundImage: 'radial-gradient(130% 130% at 20% 15%, #2a2452 0%, #16132f 48%, #0b0a17 100%)' }}
            />
            <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
            <span className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/40" />
          </span>

          <div className="relative z-10 flex flex-col gap-6">
            <Eyebrow>Start here</Eyebrow>
            <h2 className="max-w-[16ch] font-display text-[clamp(1.875rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-cream">
              Not sure which capability you need?
            </h2>
            <p className="max-w-[52ch] text-[17px] leading-relaxed text-body">
              Most people aren&apos;t — that&apos;s our job. Describe the problem in your own words, and we&apos;ll bring
              the right practices to the first call.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-md bg-cream px-6 py-3 text-[15px] font-medium text-ink transition-colors duration-300 hover:bg-cream-hover',
                  FOCUS_RING,
                )}
              >
                Start a conversation
                <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </Link>
              <Link
                href="/case-studies"
                className={cn(
                  'inline-flex items-center justify-center rounded-md border border-white/20 bg-white/[0.06] px-6 py-3 text-[15px] font-medium text-cream transition-colors duration-300 hover:bg-white/[0.12]',
                  FOCUS_RING,
                )}
              >
                See our work
              </Link>
            </div>
          </div>
        </Motion>
      </section>
    </div>
  )
}
