import Motion from '@/components/animation/motion'
import CapabilityHeroMark from '@/components/capability/CapabilityHeroMark'
import Link from '@/components/LocalizedLink'
import { cn } from '@/lib/utils'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import type { JSX, ReactNode } from 'react'

/**
 * Capabilities landing — the eight-discipline index in Ternary's design language: monochrome
 * cream-on-near-black (no amber), Poppins display + Inter body, the brand tokens
 * (page/ink/card/line/subtle), tabular numerals in place of a mono face, the shared Motion
 * scroll-reveal, and one signature noise-gradient CTA moment. Promoted from the /capabilities-hub
 * redesign to replace the earlier bold-variant port.
 *
 * Structure: hero + index → framing statement → the index (the centerpiece) → how they combine
 * → the one standard → closing CTA.
 *
 * Structure comes from surfaces, not rules: nothing on the page is divided by a hairline. The
 * base-three ordinals (00–21, a/b/c) that used to number every section are gone.
 */

export const metadata: Metadata = {
  title: 'Capabilities — Every discipline. One standard.',
  description:
    'The technical practices behind everything Ternary builds and runs — each with a named lead, house standards, and work in production.',
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
    name: 'Agentic Architecture',
    slug: 'agentic-architecture',
    body: 'AI that does real work — and answers for it. Systems that plan, act, and verify, with people in command of anything that matters.',
    tags: ['Multi-agent systems', 'Tool use & permissions', 'Evals & guardrails', 'Human oversight'],
  },
  {
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    body: 'LLM applications and machine learning built for production, not demos. Shipped, monitored, and owned after launch.',
    tags: ['LLM applications', 'ML pipelines', 'Retrieval & search', 'Model operations'],
  },
  {
    name: 'Data & Analytics',
    slug: 'data-analytics',
    body: 'One source of truth. Pipelines, warehouses, and numbers your teams can actually act on.',
    tags: ['Data pipelines', 'Warehousing', 'Decision analytics', 'Governance'],
  },
  {
    name: 'Cloud Transformation',
    slug: 'cloud-transformation',
    body: 'Move to the cloud without betting the business on the move. Architecture, migration, and operations — governed for regulated environments.',
    tags: ['Migration', 'Cloud-native architecture', 'Platform operations', 'Compliance'],
  },
  {
    name: 'Platformization',
    slug: 'platformization',
    body: 'Turn one-off builds into shared platforms, so every next project starts further ahead instead of from zero.',
    tags: ['Internal platforms', 'Reusable services', 'APIs & SDKs', 'Developer experience'],
  },
  {
    name: 'Digital Experiences',
    slug: 'digital-experiences',
    body: 'Web, mobile, and product interfaces people trust at first use — clear, fast, and dependable on every device.',
    tags: ['Web & mobile', 'Product design', 'Accessibility', 'Performance'],
  },
  {
    name: 'DevOps & Automation',
    slug: 'devops-automation',
    body: 'We make shipping boring. More releases, fewer incidents, and no two-a.m. surprises.',
    tags: ['CI/CD', 'Observability', 'Reliability', 'Release automation'],
  },
  {
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
    caps: ['Digital Experiences', 'Data & Analytics', 'Cloud Transformation'],
  },
  {
    tag: 'Capital markets · AI',
    title: 'LankaBangla Securities',
    body: 'A governed, air-gapped AI layer that lets brokerage advisors query market and portfolio data in plain language — production systems never exposed.',
    caps: ['Agentic Architecture', 'Artificial Intelligence', 'Data & Analytics'],
  },
  {
    tag: 'Experience economy',
    title: 'Counterfoil',
    body: 'A booking monolith rebuilt as an event-driven platform — while the original stayed live and taking bookings the whole time.',
    caps: ['Platformization', 'DevOps & Automation', 'Digital Experiences'],
  },
] as const

const STANDARD = [
  {
    title: 'Led by a practitioner',
    body: 'Every capability has a named lead who still builds. You can meet them before you sign anything.',
  },
  {
    title: 'Proven in production',
    body: "We list only what we currently run for clients. If it isn't live somewhere, it isn't on this page.",
  },
  {
    title: 'Owned past launch',
    body: 'Capability work ships with monitoring, documentation, and a handover we stand behind — or we keep running it ourselves.',
  },
] as const

/* Surfaces, not rules — the same language as /solutions. --color-card #1b1a17 is the
   elevation a card takes when it sits directly on the page (ink is for a card inside a
   panel, which is the home page's arrangement, not this one). */
const PANEL = 'rounded-xl bg-card'
const PANEL_HOVER = 'transition-colors duration-300 hover:bg-[#232119]'
const CHIP = 'rounded-full bg-card transition-colors duration-200 hover:bg-[#2a2820]'

// Eyebrow — uppercase micro-label. A dot rather than the 6px rule it used to carry: it
// reads the same and adds no hairline to a page whose structure is now surfaces.
function Eyebrow({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.16em] text-subtle uppercase">
      <span aria-hidden className="size-1.5 rounded-full bg-cream/60" />
      {children}
    </span>
  )
}

/* One wrapper for every section, so max width, gutters and rhythm are declared once
   instead of repeated per section and drifting apart. Spacing follows the industries
   hub's system, as /solutions does. */
function Section({ children, id, pad }: { children: ReactNode; id?: string; pad?: string }): JSX.Element {
  return (
    <section id={id} className={id ? 'scroll-mt-28' : undefined}>
      <div className={cn('mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12', pad ?? 'py-[clamp(48px,5vw,80px)]')}>
        {children}
      </div>
    </section>
  )
}

/* Every section opens the same way — eyebrow + heading left, one supporting sentence
   right, sharing a baseline. */
function SectionHead({ eyebrow, title, blurb }: { eyebrow: string; title: string; blurb?: string }): JSX.Element {
  return (
    <Motion
      className="mb-[clamp(28px,4vw,56px)] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16"
      {...reveal}
    >
      <div className="flex flex-col gap-4">
        <Eyebrow>{eyebrow}</Eyebrow>
        {/* `text-balance` so a heading breaks into even lines instead of orphaning its last
            word — "One standard across them / all" was the case that showed it. */}
        <h2 className="font-display max-w-[20ch] text-[clamp(1.875rem,4vw,3.25rem)] leading-[1.06] font-medium tracking-[-0.03em] text-balance text-cream">
          {title}
        </h2>
      </div>
      {blurb ? <p className="max-w-[46ch] text-[16px] leading-relaxed text-body lg:pb-2">{blurb}</p> : null}
    </Motion>
  )
}

// ---------------------------------------------------------------------------------------------
export default function CapabilitiesHubPage(): JSX.Element {
  return (
    <div className="w-full pb-24 lg:pb-32">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      {/* The repeating vertical rule field behind this, and the rule closing the section,
          are both gone — they were the loudest lines on the page. Copy left, figure right:
          the right half was empty, which read as unfinished rather than airy. */}
      <Section pad="pt-[clamp(32px,6vh,72px)] pb-[clamp(48px,7vh,80px)]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <Motion className="flex flex-col gap-7" {...reveal}>
              <Eyebrow>Capability index</Eyebrow>
              <h1 className="font-display max-w-[15ch] text-[clamp(2.75rem,7vw,6rem)] leading-[1.01] font-medium tracking-[-0.04em] text-cream">
                Every discipline. One standard.
              </h1>
              <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-body">
                The technical practices behind everything we build and run. Each has a named lead, house standards, and
                work in production to show for it.
              </p>
            </Motion>

            {/* Jump links to the practices below. Chips, not bare words: with the ordinals and
                the rule above them gone there is nothing else separating eight text links. */}
            <Motion className="mt-12 flex flex-wrap gap-2.5 lg:mt-16" {...reveal}>
              {CAPABILITIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`#${c.slug}`}
                  className={cn(
                    'inline-flex items-center px-4 py-2 text-[13.5px] text-body hover:text-cream',
                    CHIP,
                    FOCUS_RING,
                  )}
                >
                  {c.name}
                </Link>
              ))}
            </Motion>
          </div>

          {/* Eight plates on one plane — the headline beside it, drawn. Hidden below lg,
              where the hero is a single column and it would only add scroll. */}
          <Motion className="hidden lg:block" {...reveal}>
            <CapabilityHeroMark />
          </Motion>
        </div>
      </Section>

      {/* ── FRAMING ──────────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-16">
          <Motion {...reveal}>
            <p className="max-w-[30ch] font-display text-[clamp(1.5rem,2.6vw,2rem)] font-medium leading-[1.28] tracking-[-0.02em] text-cream">
              A capability, to us, is not a keyword on a services page.{' '}
              <span className="text-body">It&apos;s a practice we run in production.</span>
            </p>
          </Motion>
          <Motion className="self-end" {...reveal}>
            <p className="max-w-[46ch] text-[16px] leading-relaxed text-body">
              Each one below has people who own it, methods we can defend, and clients who can vouch for it. We only
              list what we currently run for clients — nothing aspirational, nothing outsourced to a slide.
            </p>
          </Motion>
        </div>
      </Section>

      {/* ── THE INDEX (centerpiece) ──────────────────────────────────────────────────────── */}
      <Section>
        {/* Blurb rewritten: it used to read "Numbered in base three — it's in the name",
            which pointed at ordinals this section no longer carries. */}
        <SectionHead
          eyebrow="The index"
          title="What we practice"
          blurb="Eight practices, one bar. Open any of them for the methods, the standards, and the work behind it."
        />

        {/* Was a stack of rows divided by hairlines with an ordinal column. Each practice is
            its own surface now, separated by the gaps between panels; the ordinal column is
            gone, so the name starts the row and the anchor is the slug rather than a number. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CAPABILITIES.map((c, i) => (
            <Motion key={c.slug} className="h-full" {...revealItem(i)}>
              <Link
                id={c.slug}
                href={`/capabilities/${c.slug}`}
                className={cn(
                  'group flex h-full scroll-mt-28 flex-col gap-3 p-7 lg:p-8',
                  PANEL,
                  PANEL_HOVER,
                  FOCUS_RING,
                )}
              >
                <div className="flex items-start justify-between gap-6">
                  <h3 className="font-display max-w-[18ch] text-[clamp(1.375rem,2.2vw,1.75rem)] leading-[1.12] font-medium tracking-[-0.02em] text-cream md:min-h-[2.24em]">
                    {c.name}
                  </h3>
                  <ArrowUpRight
                    size={20}
                    strokeWidth={1.75}
                    aria-hidden
                    className="mt-1 shrink-0 text-subtle transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                  />
                </div>

                <p className="max-w-[52ch] text-[15.5px] leading-relaxed text-body">{c.body}</p>

                {/* Tag chips were outlined; filled now, so the row carries no hairline. */}
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-cream/[0.055] px-2.5 py-1 text-[11px] tracking-[0.03em] text-subtle transition-colors duration-300 group-hover:text-body"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            </Motion>
          ))}
        </div>
      </Section>

      {/* ── COMBINATIONS ─────────────────────────────────────────────────────────────────── */}
      <Section>
        <SectionHead
          eyebrow="In practice"
          title="They ship together"
          blurb="Most engagements draw on several capabilities at once. A modernization is never just cloud. A product is never just interface."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COMBINATIONS.map((combo, i) => (
            <Motion key={combo.title} className="h-full" {...revealItem(i)}>
              <Link
                href="/stories"
                className={cn('group flex h-full min-h-[340px] flex-col p-8', PANEL, PANEL_HOVER, FOCUS_RING)}
              >
                <span className="text-[11px] uppercase tracking-[0.12em] text-subtle">{combo.tag}</span>
                <h3 className="mt-4 font-display text-[20px] font-medium leading-snug tracking-[-0.02em] text-cream">
                  {combo.title}
                </h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-body">{combo.body}</p>

                {/* The capability list was cut off by a rule inside the card, and every line
                      was prefixed with its ordinal. It is an inset surface now — a panel within
                      a panel — and the names stand on their own. */}
                <div className="mt-7 flex flex-col gap-2 rounded-lg bg-cream/[0.03] px-5 py-4">
                  {combo.caps.map((name) => (
                    <span key={name} className="text-[13px] text-body">
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
      </Section>

      {/* ── THE STANDARD ─────────────────────────────────────────────────────────────────── */}
      {/* Was the only section on the page that set its heading BESIDE its content, on a
          1.2fr / 1fr split — so the wider track (681px) held a 400px heading, leaving 281px
          empty across and 275px more empty below it, while the three cards were squeezed
          into the narrower 568px track. Heading on top, cards across the full width, like
          every other section here: both dead zones go and the cards gain ~780px. */}
      <Section>
        <SectionHead eyebrow="The bar" title="One standard across them all" />

        {/* Three items separated by hairlines, each labelled a. b. c. Three surfaces now —
            the gaps do the separating, and the titles carry themselves without the letters,
            which indexed nothing a reader needed. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STANDARD.map((item, i) => (
            <Motion key={item.title} className={cn('flex h-full flex-col gap-2 p-7', PANEL)} {...revealItem(i)}>
              {/* h3, not h4 — repeated items directly under the section's h2; an h4 here
                  skipped a level (SC 1.3.1). It was h4 before this rewrite too. */}
              <h3 className="text-[18px] font-medium tracking-[-0.01em] text-cream">{item.title}</h3>
              <p className="text-[15px] leading-relaxed text-body">{item.body}</p>
            </Motion>
          ))}
        </div>
      </Section>

      {/* ── CTA (signature noise-gradient moment) ────────────────────────────────────────── */}
      <Section pad="py-0">
        <Motion tag="div" className="relative overflow-hidden rounded-xl p-10 lg:p-16" {...reveal}>
          <span aria-hidden className="absolute inset-0">
            <span
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(130% 130% at 20% 15%, #2a2452 0%, #16132f 48%, #0b0a17 100%)',
              }}
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
              Most people aren&apos;t — that&apos;s our job. Describe the problem in your own words, and we&apos;ll
              bring the right practices to the first call.
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
                href="/stories"
                className={cn(
                  'inline-flex items-center justify-center rounded-md bg-cream/[0.10] px-6 py-3 text-[15px] font-medium text-cream transition-colors duration-300 hover:bg-cream/[0.18]',
                  FOCUS_RING,
                )}
              >
                See our work
              </Link>
            </div>
          </div>
        </Motion>
      </Section>
    </div>
  )
}
