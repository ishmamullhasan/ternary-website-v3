import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import { SolutionMark, SolutionsHeroMark } from '@/components/solutions/SolutionsFrame'
import '@/components/solutions/solutionsFrame.css'
import { cn } from '@/lib/utils'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import type { JSX, ReactNode } from 'react'

/**
 * Solutions hub — landing rebuild, ported from public/hub/solutions-hub-ternary.html into Ternary's
 * own design language: monochrome cream-on-near-black (no amber/tan), Poppins display + Inter body,
 * the brand tokens (page/ink/line/subtle), tabular numerals in place of a mono face, the shared
 * Motion scroll-reveal, and one signature noise-gradient CTA moment — matching /capabilities-hub.
 *
 * Structure: hero → four at a glance (jump index) → the four solutions (who/what/get/proof) → the
 * three engagement models → the compare matrix → closing CTA → a quiet careers line. Authored as a
 * self-contained server component; content lives in local const arrays.
 */

export const metadata: Metadata = {
  title: 'Solutions — Ways in. One standard.',
  description:
    'Ways to work with Ternary — build something new, modernize what you have, extend your team, or hand us the keys to production.',
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
// Content — four solutions (jump-index + full scenes), engagement models, compare matrix.
// ---------------------------------------------------------------------------------------------
const SOLUTIONS = [
  {
    id: 's1',
    art: 0,
    name: 'Product Development',
    tagline: 'Take an idea to a real product.',
    who: 'You have something to build and no team — or a team that is already full.',
    what: 'We take it from a rough idea to a launched system: discovery, architecture, design, build, release. One senior team, shipping continuously, with you in the room.',
    get: 'A launched product with the pipelines, tests, and documentation to grow on — and the team that built it, still on call.',
    proof: {
      client: 'Alley Analytix',
      body: 'sensor hardware, real-time motion processing, and coaching dashboards, built end to end.',
    },
  },
  {
    id: 's2',
    art: 1,
    name: 'Enterprise Transformation',
    tagline: 'Replace what you have outgrown.',
    who: 'You are running something critical that is getting expensive, fragile, or impossible to hire for — or the “system” is still paper, phone calls, and spreadsheets the business has outgrown.',
    what: 'We map how the work actually happens today, then move it across piece by piece. Sometimes that means replacing legacy systems; sometimes it means building your first real one. Nothing switches off until its replacement has proven itself.',
    get: 'New platform live. Old ways retired. Business uninterrupted.',
    proof: {
      client: 'FAROGL',
      body: 'an oil and gas operation taken from manual workflows to one governed ERP, in phases people actually adopted.',
    },
  },
  {
    id: 's3',
    art: 2,
    name: 'Engineering Augmentation',
    tagline: 'Add senior engineers to your team.',
    who: 'You know exactly what to build. You need more senior hands building it.',
    what: 'We place experienced engineers inside your team — your process, your tooling, your rituals. Named people, not rotating resources.',
    get: 'Delivery speed you can measure, from engineers you would have hired yourself.',
    proof: null,
  },
  {
    id: 's4',
    art: 3,
    name: 'Managed Systems',
    tagline: 'We run what we build.',
    who: 'You have systems in production and nobody whose actual job is keeping them healthy.',
    what: 'Monitoring, patching, incident response — and the unglamorous roadmap of keeping software current, so it never becomes next year’s legacy problem.',
    get: 'Uptime you stop thinking about.',
    proof: {
      client: 'Counterfoil',
      body: 'a platform Ternary builds and runs.',
    },
  },
] as const

const MODELS = [
  {
    name: 'Frame',
    tag: 'Fixed scope · timeline · price',
    body: 'For work with a clear finish line.',
    ideal: 'Launches, migrations, proofs of concept.',
  },
  {
    name: 'Flow',
    tag: 'Dedicated team · continuous',
    body: 'For products that keep evolving.',
    ideal: 'Long-term product development, continuous delivery.',
  },
  {
    name: 'Orchestra',
    tag: 'Senior capacity · on demand',
    body: 'For teams that need depth without the headcount.',
    ideal: 'Filling skill gaps, scaling delivery.',
  },
] as const

const COMPARE_COLS = ['Product Development', 'Enterprise Transformation', 'Engineering Augmentation', 'Managed Systems']

const COMPARE_ROWS: { label: string; cells: (ReactNode | string)[]; tabular?: boolean }[] = [
  {
    label: 'Best when',
    cells: [
      'You are building something new',
      'A critical system is aging out — or still runs on paper',
      'Your roadmap outruns your team',
      'Your systems need an owner',
    ],
  },
  {
    label: 'Typical duration',
    tabular: true,
    cells: ['3–9 months', '12+ months', 'Rolling, quarterly', 'Ongoing'],
  },
  {
    label: 'Team shape',
    cells: ['One senior pod', 'Coordinated workstreams', 'Embedded engineers', 'Dedicated ops coverage'],
  },
  {
    label: 'Roadmap owner',
    cells: ['Shared', 'Shared', 'You', 'We propose, you approve'],
  },
  {
    label: 'What we hand over',
    cells: [
      'A launched product + docs',
      'A retired legacy + a live platform',
      'Merged code, every week',
      'Reports, uptime, a healthy system',
    ],
  },
  {
    label: 'Engagement model',
    cells: [
      <>
        <b className="font-medium text-cream">Frame</b> or <b className="font-medium text-cream">Flow</b>
      </>,
      <>
        <b className="font-medium text-cream">Flow</b> or <b className="font-medium text-cream">Orchestra</b>
      </>,
      <b key="orchestra" className="font-medium text-cream">
        Orchestra
      </b>,
      <b key="flow" className="font-medium text-cream">
        Flow
      </b>,
    ],
  },
]

/* Structure on this page comes from surfaces, not from rules. Every panel is
   --color-ink #0f0e0e — the surface every card on the site sits on — laid over the
   darker --color-page, and the two hover steps below are the only lift. Nothing here
   is divided by a hairline; if a divider seems needed, it wants to be a surface. */
const PANEL = 'rounded-xl bg-ink'
const PANEL_HOVER = 'transition-colors duration-300 hover:bg-[#1b1916]'
const CHIP = 'rounded-full bg-ink transition-colors duration-200 hover:bg-[#23211d]'

// Eyebrow — uppercase micro-label. Its marker is a dot rather than the 6px rule it
// used to be: it reads identically at a glance and adds no hairline to a page whose
// structure is now carried entirely by surfaces.
function Eyebrow({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.16em] text-subtle uppercase">
      <span aria-hidden className="size-1.5 rounded-full bg-cream/60" />
      {children}
    </span>
  )
}

/* One wrapper for every section, so the max width, the gutters and the vertical
   rhythm are declared once here instead of being repeated six times and drifting
   apart — which is what left the sections misaligned with each other. */
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
   right, sharing a baseline. Previously each section hand-rolled this and they came
   out on slightly different margins. */
function SectionHead({ eyebrow, title, blurb }: { eyebrow: string; title: string; blurb: string }): JSX.Element {
  return (
    <Motion
      className="mb-[clamp(28px,4vw,56px)] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16"
      {...reveal}
    >
      <div className="flex flex-col gap-4">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-display max-w-[20ch] text-[clamp(1.875rem,4vw,3.25rem)] leading-[1.06] font-medium tracking-[-0.03em] text-cream">
          {title}
        </h2>
      </div>
      <p className="max-w-[46ch] text-[16px] leading-relaxed text-body lg:pb-2">{blurb}</p>
    </Motion>
  )
}

// A single who/what/get row inside a solution scene.
function Fact({ label, children, emphasis }: { label: string; children: ReactNode; emphasis?: boolean }): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-x-7">
      <h3 className="pt-0.5 text-[11px] uppercase tracking-[0.1em] text-subtle">{label}</h3>
      <p
        className={cn(
          'max-w-[52ch] leading-relaxed',
          emphasis ? 'text-[17px] font-medium text-cream' : 'text-[15.5px] text-body',
        )}
      >
        {children}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
export default function SolutionsHubPage(): JSX.Element {
  return (
    <div className="w-full pb-24 lg:pb-32">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      {/* The repeating vertical rule field that used to sit behind this, and the rule closing
          the section, are both gone — they were the loudest lines on the page. */}
      <Section pad="pt-[clamp(32px,6vh,72px)] pb-[clamp(48px,7vh,80px)]">
        {/* Copy left, figure right. The right half was empty at lg and up — enough of a hole
          that the hero read as unfinished rather than airy. */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <Motion className="flex flex-col gap-7" {...reveal}>
              <Eyebrow>Solutions · Ways in</Eyebrow>
              <h1 className="font-display max-w-[15ch] text-[clamp(2.75rem,7vw,6rem)] leading-[1.01] font-medium tracking-[-0.04em] text-cream">
                Built to outlast.
              </h1>
              <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-body">
                Ways to work with us — build something new, modernize what you have, extend your team, or hand us the
                keys to production. One engineering standard behind all of them.
              </p>
            </Motion>

            {/* Jump links to the scenes below. Chips, not a row of bare words: with both the
            ordinals and the rule above them gone there is nothing else separating four text
            links, and the filled shape is what says "these are controls". */}
            <Motion className="mt-12 flex flex-wrap gap-2.5 lg:mt-16" {...reveal}>
              {SOLUTIONS.map((s) => (
                <Link
                  key={s.id}
                  href={`#${s.id}`}
                  className={cn(
                    'inline-flex items-center px-4 py-2 text-[13.5px] text-body hover:text-cream',
                    CHIP,
                    FOCUS_RING,
                  )}
                >
                  {s.name}
                </Link>
              ))}
            </Motion>
          </div>

          {/* Not a fifth object beside the four below — a field. Wider, flatter and at about
            half their contrast, so it backs the copy instead of competing with the h1.
            Hidden below lg, where the hero is one column and it would only add scroll. */}
          <Motion className="hidden lg:block" {...reveal}>
            <SolutionsHeroMark />
          </Motion>
        </div>
      </Section>

      {/* ── FOUR AT A GLANCE ─────────────────────────────────────────────────────────────── */}
      <Section>
        <SectionHead
          eyebrow="At a glance"
          title="The ways in"
          blurb="Pick the shape that fits where you are. Each opens onto the same standard of engineering."
        />

        {/* Was a stack of rows divided by hairlines, top and bottom. Each is now its own
            surface in a 2×2 grid: the same four targets, separated by the gaps between the
            panels rather than by lines, and the tiles give the names room to be large. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SOLUTIONS.map((s, i) => (
            <Motion key={s.id} className="h-full" {...revealItem(i)}>
              <Link
                href={`#${s.id}`}
                className={cn('group flex h-full flex-col gap-3 p-7 lg:p-9', PANEL, PANEL_HOVER, FOCUS_RING)}
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Reserve two lines from md up, where the tiles pair off: three of the four
                      names wrap and "Managed Systems" does not, which left its tagline sitting
                      higher than its rowmate's. Unprefixed below md, where one column makes
                      row alignment moot and the reservation would just be dead space. */}
                  <h3 className="font-display max-w-[16ch] text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.1] font-medium tracking-[-0.025em] text-cream md:min-h-[2.2em]">
                    {s.name}
                  </h3>
                  <ArrowUpRight
                    size={20}
                    strokeWidth={1.75}
                    aria-hidden
                    className="mt-1 shrink-0 text-subtle transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                  />
                </div>
                <p className="max-w-[42ch] text-[15px] leading-relaxed text-body">{s.tagline}</p>
              </Link>
            </Motion>
          ))}
        </div>
      </Section>

      {/* ── THE FOUR SOLUTIONS ───────────────────────────────────────────────────────────── */}
      {/* Each scene is ONE card — heading, tagline, figure and detail all on a single surface,
          the way the home page cards work. The detail half used to carry its own panel while the
          heading sat bare on the page, so a scene read as a loose column next to a card rather
          than as one object.

          One grid with equal rows, so every card takes the height of the tallest at ANY viewport
          width. A min-height cannot do this job: the tallest content measures 526px at 1024 and
          439px at 1440, so a single number is either short at narrow widths or dead space at wide
          ones. Only from lg, where a scene is two columns; stacked on mobile, equal heights would
          be pure padding. */}
      <div className="lg:grid lg:auto-rows-fr">
        {SOLUTIONS.map((s) => (
          <Section key={s.id} id={s.id} pad="py-[clamp(20px,2vw,34px)] lg:h-full">
            {/* PROXIMITY. The left track was `1fr` of a 1:1.35 split, so it kept growing with the
                viewport while its content did not — the heading caps at 467px. Above 1280 that
                opened a dead channel: 136px at 1440, 159px at 1920, against a 72–80px gap BETWEEN
                scenes. The two halves of one scene were reading as further apart than two separate
                solutions, which is the proximity principle exactly backwards.

                The track is now capped at the heading's own natural width, so it never outgrows
                what it holds — below that the heading simply wraps to the track and the dead space
                stays at zero. The column gap is set under the scene gap at every width, so the
                spacing hierarchy reads columns < scenes < sections. */}
            <div
              className={cn(
                'grid grid-cols-1 gap-8 p-7 lg:h-full lg:grid-cols-[clamp(280px,30vw,440px)_minmax(0,1fr)] lg:gap-x-[clamp(32px,3vw,56px)] lg:p-10',
                PANEL,
              )}
            >
              {/* Not sticky any more. It was, back when a scene ran to ~520px and the column had
                  room to travel; at the tightened rhythm it barely moves, and what it does do is
                  leave each heading at a different height from its own panel's top as you scroll,
                  which reads as four misaligned scenes rather than one system. */}
              <Motion className="flex flex-col gap-4 lg:self-start" {...reveal}>
                {/* The solution's NAME is the heading. It used to be a 12px eyebrow while the tagline
                  took the h2 — so the thing the section is actually about was its smallest type, and
                  four sections in a row were titled by a sentence rather than by a name. */}
                <h2 className="max-w-[13ch] font-display text-[clamp(2.25rem,4.6vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.035em] text-cream">
                  {s.name}
                </h2>
                <p className="max-w-[28ch] text-[clamp(1.0625rem,1.7vw,1.375rem)] leading-[1.35] text-body">
                  {s.tagline}
                </p>
                {/* The scene from the home page's solutions frame, one lane per solution — what the
                  decorative "02" numeral used to occupy, carrying the idea instead of the count. */}
                <div className="mt-2 w-full max-w-[280px]">
                  <SolutionMark art={s.art} />
                </div>
              </Motion>

              {/* No surface of its own — the card around the whole scene is the surface now, and a
                  panel inside a panel would read as a card in a card. */}
              <div className="flex flex-col gap-7">
                <Motion {...revealItem(0)}>
                  <Fact label="Who it's for">{s.who}</Fact>
                </Motion>
                <Motion {...revealItem(1)}>
                  <Fact label="What we do">{s.what}</Fact>
                </Motion>
                <Motion {...revealItem(2)}>
                  <Fact label="What you get" emphasis>
                    {s.get}
                  </Fact>
                </Motion>
                {/* Proof slot: named client with written permission only. With no proof, the slot
                  hides entirely — an empty proof line is better than a vague one. Keeps the Fact
                  grid rather than the rule it used to sit under, so its label still lines up with
                  the three above it. */}
                {s.proof && (
                  <Motion {...revealItem(3)}>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-x-7">
                      <h3 className="pt-0.5 text-[11px] tracking-[0.1em] text-subtle uppercase">Proof</h3>
                      <p className="max-w-[52ch] text-[15.5px] leading-relaxed text-body">
                        <span className="text-cream">{s.proof.client}</span> — {s.proof.body}{' '}
                        <Link
                          href="/stories"
                          className={cn(
                            'group/story mt-1 inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-cream',
                            FOCUS_RING,
                          )}
                        >
                          Read the story
                          <ArrowRight
                            size={14}
                            strokeWidth={2}
                            aria-hidden
                            className="transition-transform duration-300 group-hover/story:translate-x-0.5"
                          />
                        </Link>
                      </p>
                    </div>
                  </Motion>
                )}
              </div>
            </div>
          </Section>
        ))}
      </div>

      {/* ── ENGAGEMENT MODELS ────────────────────────────────────────────────────────────── */}
      <Section>
        <SectionHead
          eyebrow="Engagement models"
          title="How the work is structured"
          blurb="Shapes of engagement. Every solution runs on one — or moves between them as the work changes."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {MODELS.map((m, i) => (
            <Motion key={m.name} className={cn('flex h-full flex-col p-8', PANEL, PANEL_HOVER)} {...revealItem(i)}>
              <h3 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-medium tracking-[-0.02em] text-cream">
                {m.name}
                <sup className="ml-0.5 align-super text-[0.5em] font-medium text-subtle">™</sup>
              </h3>
              <span className="mt-3 text-[11px] tracking-[0.08em] text-cream/70 uppercase">{m.tag}</span>
              <p className="mt-4 flex-1 text-[15.5px] leading-relaxed text-body">{m.body}</p>
              {/* "Ideal for" used to be cut off by a rule inside the card. It is an inset surface
                  now — a panel within a panel, which separates it without drawing anything. */}
              <div className="mt-6 rounded-lg bg-cream/[0.03] px-5 py-4">
                <span className="mb-1 block text-[11px] tracking-[0.06em] text-body uppercase">Ideal for</span>
                <p className="text-[13.5px] leading-relaxed text-subtle">{m.ideal}</p>
              </div>
            </Motion>
          ))}
        </div>
      </Section>

      {/* ── COMPARE (the showpiece) ──────────────────────────────────────────────────────── */}
      <Section>
        <SectionHead
          eyebrow="Compare"
          title="Side by side. Honest answers."
          blurb="No winner. The right column is the one that matches your situation."
        />

        {/* The table carried more rules than the rest of the page combined — an outer border, a
            heavy rule under the head, and one under every row. All of it is gone. The head is a
            band, the rows alternate, and the eye tracks across on the banding instead. */}
        <Motion className={cn('overflow-x-auto', PANEL)} {...reveal}>
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="bg-cream/[0.05]">
                <th className="w-[150px] px-5 py-5" />
                {COMPARE_COLS.map((col) => (
                  <th
                    key={col}
                    className="font-display px-5 py-5 align-bottom text-[15px] font-medium whitespace-nowrap text-cream"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, r) => (
                <tr key={row.label} className={cn(r % 2 === 1 && 'bg-cream/[0.02]')}>
                  <th
                    scope="row"
                    className="px-5 py-4 text-left text-[11px] font-normal tracking-[0.06em] whitespace-nowrap text-subtle uppercase"
                  >
                    {row.label}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td
                      key={i}
                      className={cn(
                        'px-5 py-4 align-top text-[14.5px] leading-relaxed text-body',
                        row.tabular && 'font-mono tabular-nums',
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Motion>
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
              Still not sure which one you need?
            </h2>
            <p className="max-w-[52ch] text-[17px] leading-relaxed text-body">
              Neither are most people at this stage — that&apos;s our job, not yours. Tell us the problem, and
              we&apos;ll tell you the shape.
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
              {/* Filled rather than outlined — the last hairline on the page was this button's
                  edge. A lighter fill separates it from the primary just as well. */}
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

      {/* ── CAREERS STRIP ────────────────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5 pt-16 text-center md:px-8 lg:px-12 lg:pt-20">
        <Motion tag="p" className="text-[13.5px] leading-relaxed text-body" {...reveal}>
          Engineers: we&apos;re usually hiring.{' '}
          <Link
            href="/careers"
            className={cn('group/careers ml-1 inline-flex items-center gap-1.5 font-medium text-cream', FOCUS_RING)}
          >
            See open roles
            <ArrowRight
              size={13}
              strokeWidth={2}
              aria-hidden
              className="transition-transform duration-300 group-hover/careers:translate-x-0.5"
            />
          </Link>
        </Motion>
      </section>
    </div>
  )
}
