import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import ScaleFigure from '@/components/scales/ScaleFigure'
import RevealText from '@/components/text/RevealText'
import { cn } from '@/lib/utils'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import type { JSX } from 'react'

/**
 * Scales — landing redesign, ported from public/hub/scales-hub-ternary.html into Ternary's own
 * design language to match /capabilities-hub: monochrome cream-on-near-black (no amber/tan), the
 * Poppins display + Inter body pairing, brand tokens (page/ink/line/subtle/body), tabular numerals
 * in place of a mono face, the shared Motion scroll-reveal, and one signature noise-gradient CTA.
 *
 * Content is faithful to the mockup — the three scales (Startups & Scale-ups, Mid-Market &
 * Enterprise, Government & Public Institutions), each with "how we show up / typical shape / week
 * one" facts and recent proof; the "same engineers" point; the moves/never-moves split; and the
 * closing CTA. The interactive canvas panels and JS router become static, self-contained markup —
 * a server component, no separate .css file.
 *
 * Structure: hero + scale index → the three scales → the point → what moves / what never does →
 * the constant standard → closing CTA. Scales are numbered in base three, in keeping with the name.
 */

export const metadata: Metadata = {
  title: 'Scales — From founding teams to national institutions.',
  description:
    "Our quality bar doesn't change with your size — the shape of the work does. One engineering standard, held from a startup's first product to a national institution.",
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
// Content — the three scales, base-three numbered. The engagement changes shape; the bar does not.
// ---------------------------------------------------------------------------------------------
type Fact = { k: string; v: string; lead?: boolean }

const SCALES = [
  {
    n: '00',
    mark: 'Scale 1 of 3',
    name: 'Startups & Scale-ups',
    title: 'Move fast without building your own mess.',
    lede: 'Founders and early tech leaders with more roadmap than people to build it.',
    facts: [
      {
        k: 'How we show up',
        v: 'One senior team, shipping every day — and you talk straight to the people writing the code.',
      },
      { k: 'Typical shape', v: 'Frame™ or Flow™ · 3–9 months · 3–6 engineers.' },
      {
        k: 'Week one',
        v: 'The key decisions are made. Your setup is running. The first working piece is in review.',
        lead: true,
      },
    ] as Fact[],
    proof: ['Alley Analytix', 'Flex5 by Reality Meets Science'],
  },
  {
    n: '01',
    mark: 'Scale 2 of 3',
    name: 'Mid-Market & Enterprise',
    title: 'Modernize without a hard stop.',
    lede: 'The leaders replacing a system the business cannot afford to switch off.',
    facts: [
      {
        k: 'How we show up',
        v: 'Long, multi-team programs — run with the oversight and reporting your board will expect.',
      },
      { k: 'Typical shape', v: 'Flow™ or Orchestra™ · 12+ months · several teams.' },
      {
        k: 'Week one',
        v: 'Where you stand today is mapped. The order of work is planned. Risks are named out loud.',
        lead: true,
      },
    ] as Fact[],
    proof: ['FAROGL', 'Hissho Sushi'],
  },
  {
    n: '10',
    mark: 'Scale 3 of 3',
    name: 'Government & Public Institutions',
    title: 'Public deadlines. Audits. No surprises.',
    lede: 'Agencies and public bodies where "trust us" is not an acceptable answer.',
    facts: [
      {
        k: 'How we show up',
        v: 'Security and a full record built in from day one — documented for the people who must review it, not just developers.',
      },
      { k: 'Typical shape', v: 'Frame™ · sized to your procurement process · scoped teams.' },
      {
        k: 'Week one',
        v: 'The rules you must follow are mapped before a single line of code.',
        lead: true,
      },
    ] as Fact[],
    proof: ['Dhaka Stock Exchange'],
  },
] as const

// What moves with your size — and what never does.
const NEVER_MOVES = [
  'Who we hire',
  'How closely we check the work',
  'Our standard for finished work',
  'Senior people on the work',
] as const

const SHAPED_TO_YOU = [
  'How much process and formality',
  'How often we report to you',
  'Team size and structure',
  'How much documentation',
] as const

// ---------------------------------------------------------------------------------------------
export default function ScalesHubPage(): JSX.Element {
  return (
    <div className="w-full pb-[clamp(48px,5vw,80px)]">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* faint vertical rule field — quiet engineering texture */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(244,243,236,0.02) 0 1px, transparent 1px 120px)',
          }}
        />
        <div className="relative mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 pt-[clamp(32px,6vh,72px)] pb-[clamp(48px,7vh,80px)]">
          <Motion className="flex flex-col gap-7" {...reveal}>
            <h1 className="max-w-[18ch] font-display text-[clamp(2.75rem,7vw,6rem)] font-medium leading-[1.01] tracking-[-0.04em] text-cream">
              From founding teams to national institutions.
            </h1>
            <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-body">
              Our quality bar doesn&apos;t change with your size. The shape of the engagement does — one engineering
              standard, held all the way up.
            </p>
          </Motion>

          {/* hero index — jump links to the three scales below */}
          <Motion className="mt-14 flex flex-wrap gap-x-8 gap-y-3 pt-7 lg:mt-20" {...reveal}>
            {SCALES.map((s) => (
              <Link
                key={s.n}
                href={`#s${s.n}`}
                className={cn(
                  'group inline-flex items-center gap-2.5 rounded-sm text-[13px] tracking-[0.02em] text-subtle transition-colors duration-200 hover:text-cream',
                  FOCUS_RING,
                )}
              >
                {s.name}
              </Link>
            ))}
          </Motion>
        </div>
      </section>

      {/* ── THE THREE SCALES (centerpiece) ───────────────────────────────────────────────── */}
      {/* Carries the same py as every other section. Without it this one sat flush against the hero
          above and the statement below, and the page's two shortest gaps (117px and 121px against a
          169px median on the solutions and capabilities hubs) were both here. */}
      <section className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 py-[clamp(48px,5vw,80px)]">
        <div className="grid gap-4 lg:gap-5">
          {SCALES.map((s, i) => (
            <Motion key={s.n} {...revealItem(i)}>
              <div
                id={`s${s.n}`}
                className="sc-card sc-tile grid scroll-mt-28 grid-cols-1 gap-x-8 gap-y-8 p-7 sm:p-9 lg:grid-cols-[minmax(0,1fr)_21rem_minmax(0,1fr)] lg:p-12"
              >
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-body">{s.name}</span>
                  <h2 className="mt-5 max-w-[15ch] font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
                    {s.title}
                  </h2>
                  <p className="mt-6 max-w-[46ch] text-[clamp(1rem,1.5vw,1.1875rem)] leading-relaxed text-body">
                    {s.lede}
                  </p>
                </div>

                {/* The same figure this scale carries on the home page, so both tell one story.
                    It sits in the MIDDLE track — copy left, figure centre, facts right — so it lands
                    on the card's horizontal centre instead of in its left corner, and it is centred
                    on the vertical too. The two flanking tracks are EQUAL (1fr and 1fr, not 1.05fr
                    and 1fr) — an uneven pair pushed the middle track's centre 10px off the card's.

                    Its size is capped by scaleFigure.css's `max-height: 220px`, which is why widening
                    the track alone did nothing the first time. `sc-figure-xl` lifts that for this page
                    only; the home cards keep the cap, where the figure is an ornament in the upper
                    part of a 299px card rather than a column of its own. */}
                <div className="sc-figure-xl hidden lg:flex lg:items-center lg:justify-center" aria-hidden="true">
                  <div className="w-full max-w-[330px]">
                    <ScaleFigure title={s.name} index={i} />
                  </div>
                </div>

                {/* Proof sits at the foot of the right-hand column rather than under the lede. It is
                    evidence for the facts beside it, and `mt-auto` puts it on the card's baseline
                    however many lines the facts above it run to. */}
                <div className="flex flex-col gap-6 pt-2 lg:pt-1">
                  <dl className="flex flex-col gap-6">
                    {s.facts.map((f) => (
                      <div
                        key={f.k}
                        className="grid grid-cols-1 gap-y-1.5 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:gap-x-7"
                      >
                        <dt className="text-[11px] uppercase tracking-[0.1em] text-subtle">{f.k}</dt>
                        <dd
                          className={cn('text-[15px] leading-relaxed', f.lead ? 'font-medium text-cream' : 'text-body')}
                        >
                          {f.v}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <p className="mt-auto flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-2 text-[12px] tracking-[0.04em] text-subtle">
                    <span className="uppercase tracking-[0.12em] text-cream/70">Recently at this scale</span>
                    <span>{s.proof.join(' · ')}</span>
                  </p>
                </div>
              </div>
            </Motion>
          ))}
        </div>
      </section>

      {/* ── THE POINT ────────────────────────────────────────────────────────────────────── */}
      <section>
        {/* `justify-between` on a flex row, not a two-track grid. In the grid each block sat at the
            left of its own track, so there was dead width after the statement AND after the copy —
            two gaps rather than one. Flush left and flush right leaves a single measured gap between
            them, and the blocks below are widened so that gap is a breath rather than a hole. */}
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-5 md:px-8 lg:px-12 py-[clamp(48px,5vw,80px)] lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          {/* The statement arrives word by word, the same reveal the capabilities hub gives
              "A capability, to us, is not a keyword on a services page." Entry-triggered and then
              it finishes on its own — see RevealText on why this is not scroll-scrubbed. The second
              clause keeps its own tone, which is what `segments` is for. */}
          <RevealText
            className="max-w-[20ch] font-display text-[clamp(1.75rem,3.6vw,2.75rem)] font-medium leading-[1.18] tracking-[-0.02em] text-cream"
            segments={[
              { text: 'A startup and a stock exchange get' },
              { text: 'the same engineers.', className: 'text-body' },
            ]}
          />
          {/* Right-aligned from lg, where it sits beside the statement — the same treatment the
              solutions and industries hubs give their supporting sentence. Below lg it is the only
              thing in its row, and right-aligned copy under a left-aligned statement reads as a
              mistake. */}
          <Motion className="flex flex-col gap-5 lg:text-right" {...reveal}>
            <p className="max-w-[62ch] text-[16px] leading-relaxed text-body">
              They don&apos;t get the same process, oversight, or reporting rhythm — those should differ. But who we
              hire, how closely we check the work, and the people in the room don&apos;t change with the size of the
              bill.
            </p>
            <p className="max-w-[62ch] text-[16px] leading-relaxed text-body">
              <span className="font-medium text-cream">And the scales aren&apos;t sealed off from each other.</span> The
              startup we build for today becomes the enterprise program in three years — with the same people in the
              room who remember why every decision was made.
            </p>
          </Motion>
        </div>
      </section>

      {/* ── WHAT MOVES / WHAT NEVER DOES ─────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 py-[clamp(48px,5vw,80px)]">
          {/* The industries hub's "Before we write a line of code." shape: the lead is a claim,
              not a column of content, so it takes a narrow track and the cards run across from it.
              Stacked above them it left the width unused and the section twice as tall. */}
          {/* 1.4fr, not 2.8fr. 2.8 is the industries hub's ratio and it is sized for THREE cards
              across; with two, each came out ~460px wide holding items like "Who we hire", so half of
              every card was empty. Narrowing the track fills the cards and hands the width back to
              the lead, which has a four-line heading to place — the space moves somewhere it is
              used rather than being left inside the cards. Walked down from 2.8 to 1.7 to 1.4,
              measuring each time: 460px wide with ~200px unused, then 392, now 363 — inner 299,
              widest item ("Our standard for finished work") 226px of ink, ~75px to spare and every
              item still on one line. Narrower and they wrap, which trades one kind of untidiness for
              another. */}
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
            <Motion className="flex flex-col gap-4" {...reveal}>
              <h2 className="max-w-[18ch] font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
                What moves with your size — and what never does
              </h2>
            </Motion>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Motion className="h-full" {...revealItem(0)}>
                <div className="sc-tile flex h-full flex-col rounded-xl p-8">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-cream/70">Never moves</span>
                  <p className="mt-2 text-[13px] text-subtle">Constant at every scale.</p>
                  <ul className="mt-6 flex flex-col gap-1">
                    {NEVER_MOVES.map((item) => (
                      <li key={item} className="flex items-baseline gap-3 py-2 text-[15px] text-cream">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-sm bg-cream/70" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Motion>

              <Motion className="h-full" {...revealItem(1)}>
                <div className="sc-tile flex h-full flex-col rounded-xl p-8">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-subtle">Shaped to you</span>
                  <p className="mt-2 text-[13px] text-subtle">Fitted to your size and stakes.</p>
                  <ul className="mt-6 flex flex-col gap-1">
                    {SHAPED_TO_YOU.map((item) => (
                      <li key={item} className="flex items-baseline gap-3 py-2 text-[15px] text-body">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-sm bg-subtle" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Motion>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE CONSTANT ─────────────────────────────────────────────────────────────────── */}
      <section>
        {/* Head across the top, then the three cards at full width beneath it — the site's
            SectionHead shape, the same one the solutions hub uses and the structure marked on the
            reference.

            It was a two-track grid with the heading and its paragraph stacked in the narrow left
            track. That gave the heading 249-347px to work in and it ran to FOUR lines at 1440 and
            FIVE at 1120, while the cards beside it were only using three of the row's columns. Given
            the full width to break across, the heading settles in two. */}
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 py-[clamp(48px,5vw,80px)]">
          <Motion
            className="mb-[clamp(28px,4vw,56px)] flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16"
            {...reveal}
          >
            <h2 className="max-w-[24ch] font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
              Whatever your size, the standard is the point.
            </h2>
            {/* Right-aligned from lg, where it sits beside the heading — the treatment every other
                supporting sentence on this page and the solutions hub gets. Below lg it is alone in
                its row and stays left, where right-aligned copy would read as a mistake. */}
            <p className="max-w-[46ch] text-[16px] leading-relaxed text-body lg:pt-1 lg:text-right">
              The work changes shape as you grow — the standard does not. Every team, at every size, brings the same
              careful review and the same senior hands. A startup&apos;s first product and a national program are built
              to the one bar.
            </p>
          </Motion>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                k: 'a',
                title: 'Who we hire holds',
                body: 'The same senior people, whether the work is a first-round startup or a long-term government program. No juniors quietly substituted in when the name on the door is smaller.',
              },
              {
                k: 'b',
                title: 'How we check the work holds',
                body: 'One standard for reviewing the code and one standard for calling it finished, applied the same way across New York and our Dhaka delivery hub.',
              },
              {
                k: 'c',
                title: 'The ownership holds',
                body: "We stay accountable past launch — monitoring, maintaining, and modernizing so today's build never becomes tomorrow's legacy.",
              },
            ].map((s, i) => (
              <Motion key={s.k} className="sc-tile flex flex-col gap-2 rounded-xl p-6" {...revealItem(i)}>
                <h3 className="text-[18px] font-medium tracking-[-0.01em] text-cream">{s.title}</h3>
                <p className="max-w-[48ch] text-[15px] leading-relaxed text-body">{s.body}</p>
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (signature noise-gradient moment) ────────────────────────────────────────── */}
      {/* No pt of its own: the section above already ends on 72px, and adding another 72 here made the
          gap before the CTA double every other gap on the page. The capabilities hub ends the same
          way — its CTA is 0/0 and the preceding section supplies the whole gap. */}
      <section className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12">
        <Motion tag="div" className="sc-tile relative overflow-hidden p-10 lg:p-16" {...reveal}>
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
            <h2 className="max-w-[18ch] font-display text-[clamp(1.875rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-cream">
              Tell us where you are. We&apos;ll show up shaped for it.
            </h2>
            <p className="max-w-[52ch] text-[17px] leading-relaxed text-body">
              Describe the stage you&apos;re at and the problem in front of you. We&apos;ll bring the right shape of
              engagement — and hold the same bar all the way up.
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
                  'inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/[0.06] px-6 py-3 text-[15px] font-medium text-cream transition-colors duration-300 hover:bg-white/[0.12]',
                  FOCUS_RING,
                )}
              >
                See our work
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>
        </Motion>
      </section>
    </div>
  )
}
