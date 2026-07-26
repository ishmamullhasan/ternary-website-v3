import Heading from '@/components/a11y/Heading'
import HeroNodeField from '@/components/hub/HeroNodeField'
import Reveal from '@/components/hub/Reveal'
import Link from '@/components/LocalizedLink'
import { asTypedLocale } from '@/lib/i18n/locales'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import '@/components/hub/hub.css'
import './scalesHub.css'
import ScaleFigure from './ScaleFigure'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!asTypedLocale(locale)) return {}
  return {
    title: 'Scales',
    description:
      "Engineering that scales with you — from a startup's first MVP to a public-sector mission program, one standard held at every scale.",
  }
}

type Scale = {
  id: string
  num: string
  name: string
  pos: string
  prose: string[]
  stats: Array<[string, string]>
  fig: 'fan' | 'cubes' | 'stack'
  scale: 1 | 2 | 3
  figLabel: string
  figCap: string
  alt: boolean
}

// The three scales — the engagement changes shape, the standard does not.
const SCALES: Scale[] = [
  {
    id: 's1',
    num: '01',
    name: 'Startups & Scale-ups',
    pos: 'One pod. Daily ship cadence.',
    prose: [
      "A single senior pod, embedded in your world and shipping every day. Async-first, at agentic velocity — the smallest team that can carry the whole problem, from the first architecture call to a product in real users' hands in weeks.",
      "We build beside you, not behind a wall. And when it's time, we hand over something clean: the code, the pipelines, the context, and the confidence to run it yourselves.",
    ],
    stats: [
      ['Pod', '3–6 engineers'],
      ['To production', 'Weeks'],
      ['Cadence', 'Daily'],
    ],
    fig: 'fan',
    scale: 1,
    figLabel: 'Fig 0.1',
    figCap: '01 · velocity',
    alt: false,
  },
  {
    id: 's2',
    num: '02',
    name: 'Mid-Market & Enterprise',
    pos: 'Programs measured in quarters, not sprints.',
    prose: [
      'Coordinated pods running in parallel, paired with your domain experts and governed by joint steering. We modernize the strangler-fig way — the new grows up alongside the old, and nothing is switched off until its replacement has earned it.',
      "The point isn't only the platform we leave behind. It's that your own engineers come out of the program stronger than they went in — with the patterns, the tooling, and the judgment to keep going.",
    ],
    stats: [
      ['Shape', 'Multiple pods'],
      ['Horizon', '12+ months'],
      ['Method', 'Strangler-fig'],
    ],
    fig: 'cubes',
    scale: 2,
    figLabel: 'Fig 0.2',
    figCap: '02 · structure',
    alt: true,
  },
  {
    id: 's3',
    num: '03',
    name: 'Public Sector',
    pos: 'Cleared engineers. Mission-ready from kickoff.',
    prose: [
      "Prime or sub on established vehicles, with cleared engineers who are mission-ready from day one. Compliance here isn't a phase bolted on at the end — it's a continuous evidence pipeline running the whole way through.",
      "CMMI-disciplined delivery against real mission deadlines, ATO-ready by design. The same engineering bar you'd get for a startup MVP — held to the standard a public trust demands.",
    ],
    stats: [
      ['Talent', 'Cleared'],
      ['Delivery', 'CMMI'],
      ['Posture', 'ATO-ready'],
    ],
    fig: 'stack',
    scale: 3,
    figLabel: 'Fig 0.3',
    figCap: '03 · mission',
    alt: false,
  },
]

const CONSTANTS: Array<{ n: string; h: string; p: string }> = [
  {
    n: 'i',
    h: 'Centralized standards',
    p: 'One review bar and one definition of done, held consistently across New York and the Dhaka delivery hub.',
  },
  {
    n: 'ii',
    h: 'Certified & compliant delivery',
    p: 'Security, auditability, and evidence built in — packaged the way review boards actually ask for them.',
  },
  {
    n: 'iii',
    h: 'Disciplined execution',
    p: 'The same senior hands, rituals, and rigor whether the invoice is a seed round or a program of record.',
  },
  {
    n: 'iv',
    h: 'Long-term ownership',
    p: "We stay accountable past launch — monitoring, maintaining, and modernizing so today's build never becomes tomorrow's legacy.",
  },
]

export default async function ScalesHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!asTypedLocale(locale)) notFound()

  return (
    <div className="hub">
      {/* HERO */}
      <section className="hero">
        <HeroNodeField className="hero-net" />
        <div className="wrap">
          <Reveal className="eyebrow">Scales</Reveal>
          <Reveal i={1}>
            <Heading level={1}>Engineering that scales with you.</Heading>
          </Reveal>
          <Reveal as="p" className="hero-sub" i={2}>
            From a startup&rsquo;s first MVP to a public-sector mission program — one engineering standard, held at
            every scale. We meet you where you are, and we hold the same bar the whole way up.
          </Reveal>
        </div>
      </section>

      {/* THE THREE SCALES */}
      {SCALES.map((s) => (
        <section className={`scale${s.alt ? ' alt' : ''}`} id={s.id} key={s.id}>
          <div className="wrap">
            <div className="content">
              <Reveal className="s-num">{s.num}</Reveal>
              <Reveal>
                <Heading level={2} className="s-name">
                  {s.name}
                </Heading>
              </Reveal>
              <Reveal as="p" className="s-pos" i={1}>
                {s.pos}
              </Reveal>
              <Reveal className="s-prose" i={2}>
                {s.prose.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </Reveal>
              <Reveal as="dl" className="s-stats" i={3}>
                {s.stats.map(([dt, dd]) => (
                  <div key={dt}>
                    <dt>{dt}</dt>
                    <dd>{dd}</dd>
                  </div>
                ))}
              </Reveal>
            </div>
            <Reveal className="panel" i={1}>
              <ScaleFigure scale={s.scale} fig={s.fig} />
              <span className="plabel mono">{s.figLabel}</span>
              <span className="pcap mono">{s.figCap}</span>
            </Reveal>
          </div>
        </section>
      ))}

      {/* THE CONSTANT */}
      <section className="constant">
        <div className="wrap">
          <div className="const-top">
            <Reveal>
              <div className="eyebrow">The constant</div>
              <Heading level={2} className="const-h">
                One bar for quality, at every scale.
              </Heading>
            </Reveal>
            <Reveal as="p" className="const-p" i={1}>
              The engagement changes shape as you grow — the standard does not. Every pod, at every scale, draws on
              the same centralized standards, the same review discipline, and the same people who hold the line
              across our global delivery hubs. A startup MVP and a mission program are built to the one bar.
            </Reveal>
          </div>
          <div className="const-list">
            {CONSTANTS.map((c, i) => (
              <Reveal className="cl" i={i} key={c.n}>
                <span className="cn mono">{c.n}</span>
                <div>
                  <Heading level={3}>{c.h}</Heading>
                  <p>{c.p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="wrap">
          <Reveal className="eyebrow">Start here</Reveal>
          <Reveal i={1}>
            <Heading level={2}>Wherever you are, we meet you there.</Heading>
          </Reveal>
          <Reveal as="p" i={2}>
            Tell us the stage you&rsquo;re at and the problem in front of you. We&rsquo;ll show up shaped for it — and
            held to the same bar all the way up.
          </Reveal>
          <Reveal className="btns" i={3}>
            <Link className="btn btn-primary" href="/contact">
              Start a conversation
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Link>
            <Link className="btn btn-ghost" href="/case-studies">
              See our work
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
