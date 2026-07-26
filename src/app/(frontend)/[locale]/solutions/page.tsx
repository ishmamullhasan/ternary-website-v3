import Heading from '@/components/a11y/Heading'
import HeroNodeField from '@/components/hub/HeroNodeField'
import Reveal from '@/components/hub/Reveal'
import Link from '@/components/LocalizedLink'
import { asTypedLocale } from '@/lib/i18n/locales'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'

import '@/components/hub/hub.css'
import './solutionsHub.css'
import SolutionsCompare from './SolutionsCompare'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!asTypedLocale(locale)) return {}
  return {
    title: 'Solutions',
    description:
      'Four ways to work with Ternary — build something new, modernize what you have, extend your team, or hand us the keys to production.',
  }
}

// At-a-glance index rows — anchor to the four solution scenes below.
const GLANCE = [
  { id: 's1', n: '01', name: 'Product Development', one: 'Take an idea to a real product, then scale it.' },
  {
    id: 's2',
    n: '02',
    name: 'Enterprise Transformation',
    one: 'Upgrade an aging system — or take a manual one digital — without stopping the business.',
  },
  {
    id: 's3',
    n: '03',
    name: 'Engineering Augmentation',
    one: 'Senior engineers inside your team and your process.',
  },
  { id: 's4', n: '04', name: 'Managed Systems', one: 'We run what we build.' },
]

export default async function SolutionsHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!asTypedLocale(locale)) notFound()

  return (
    <div className="hub">
      {/* HERO */}
      <section className="hero">
        <HeroNodeField className="hero-net" />
        <div className="wrap">
          <Reveal className="eyebrow">Solutions / Four ways in</Reveal>
          <Reveal className="big" i={1}>
            <Heading level={1}>Built to outlast.</Heading>
          </Reveal>
          <Reveal as="p" className="hero-sub" i={2}>
            Four ways to work with us — build something new, modernize what you have, extend your team, or hand us the
            keys to production.
          </Reveal>
        </div>
      </section>

      {/* FOUR AT A GLANCE */}
      <section className="sec">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">At a glance</span>
              <Heading level={2}>Four doors in</Heading>
            </div>
            <p className="sec-sub">
              Pick the shape that fits where you are. Each opens onto the same standard of engineering.
            </p>
          </Reveal>
          <Reveal className="glance" i={1}>
            {GLANCE.map((g) => (
              <a href={`#${g.id}`} key={g.id}>
                <span className="gn">{g.n}</span>
                <span className="gname">{g.name}</span>
                <span className="gone">{g.one}</span>
                <span className="garr" aria-hidden="true">
                  →
                </span>
              </a>
            ))}
          </Reveal>
        </div>
      </section>

      {/* SOLUTION 01 — PRODUCT DEVELOPMENT */}
      <section className="sol" id="s1">
        <div className="wrap">
          <div className="scene">
            <Reveal className="sol-mark">
              Solution 01 / 4 · <b>Product Development</b>
            </Reveal>
            <Reveal className="sol-num big" i={1}>
              01
            </Reveal>
            <Reveal className="big" i={1}>
              <Heading level={2} className="sol-name">
                Take an idea to a real product.
              </Heading>
            </Reveal>
            <Reveal className="sol-panel" i={2} aria-hidden="true">
              <svg className="g" viewBox="0 0 360 240" fill="none">
                <rect className="st" x="150" y="90" width="60" height="60" rx="3" opacity=".26" />
                <rect className="st m-piece" style={{ '--dx': '-16px', '--dy': '-14px' } as CSSProperties} x="152" y="92" width="26" height="26" rx="2" />
                <rect className="ac m-piece" style={{ '--dx': '16px', '--dy': '-14px' } as CSSProperties} x="182" y="92" width="26" height="26" rx="2" />
                <rect className="st m-piece" style={{ '--dx': '-16px', '--dy': '14px' } as CSSProperties} x="152" y="122" width="26" height="26" rx="2" />
                <rect className="st m-piece" style={{ '--dx': '16px', '--dy': '14px' } as CSSProperties} x="182" y="122" width="26" height="26" rx="2" />
              </svg>
            </Reveal>
          </div>
          <div className="facts">
            <Reveal className="fact">
              <Heading level={3}>Who it&rsquo;s for</Heading>
              <p>You have something to build and no team — or a team that&rsquo;s already full.</p>
            </Reveal>
            <Reveal className="fact" i={1}>
              <Heading level={3}>What we do</Heading>
              <p>
                We take it from a rough idea to a launched system. Discovery, architecture, design, build, release. One
                senior team, shipping continuously, with you in the room.
              </p>
            </Reveal>
            <Reveal className="fact get" i={2}>
              <Heading level={3}>What you get</Heading>
              <p>
                A launched product with the pipelines, tests, and documentation to grow on — and the team that built it,
                still on call.
              </p>
            </Reveal>
            <Reveal className="fact proof" i={3}>
              <Heading level={3}>Proof</Heading>
              <p>
                <span className="pf">Alley Analytix</span> — sensor hardware, real-time motion processing, and coaching
                dashboards, built end to end.{' '}
                <Link className="story" href="/case-studies">
                  Read the story <i aria-hidden="true">→</i>
                </Link>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SOLUTION 02 — ENTERPRISE TRANSFORMATION */}
      <section className="sol alt" id="s2">
        <div className="wrap">
          <div className="scene">
            <Reveal className="sol-mark">
              Solution 02 / 4 · <b>Enterprise Transformation</b>
            </Reveal>
            <Reveal className="sol-num big" i={1}>
              02
            </Reveal>
            <Reveal className="big" i={1}>
              <Heading level={2} className="sol-name">
                Replace what you&rsquo;ve outgrown.
              </Heading>
            </Reveal>
            <Reveal className="sol-panel" i={2} aria-hidden="true">
              <svg className="g" viewBox="0 0 360 240" fill="none">
                <g className="m-old">
                  <path className="st" d="M120 70 H240 M120 120 H240 M120 170 H240 M150 60 V180 M180 60 V180 M210 60 V180" />
                </g>
                <g className="m-new" transform="rotate(6 180 120)">
                  <path className="st" d="M124 76 H236 M124 120 H236 M124 164 H236 M156 66 V174 M186 66 V174" />
                  <path className="ac" d="M216 66 V174" />
                </g>
              </svg>
            </Reveal>
          </div>
          <div className="facts">
            <Reveal className="fact">
              <Heading level={3}>Who it&rsquo;s for</Heading>
              <p>
                You&rsquo;re running something critical that&rsquo;s getting expensive, fragile, or impossible to hire
                for. Or the &ldquo;system&rdquo; is still paper, phone calls, and spreadsheets — and the business has
                outgrown it.
              </p>
            </Reveal>
            <Reveal className="fact" i={1}>
              <Heading level={3}>What we do</Heading>
              <p>
                We map how the work actually happens today — in the old software or in the spreadsheets — then move it
                across piece by piece. Sometimes that means replacing legacy systems. Sometimes it means building your
                first real one. Either way, nothing switches off until its replacement has proven itself.
              </p>
            </Reveal>
            <Reveal className="fact get" i={2}>
              <Heading level={3}>What you get</Heading>
              <p>New platform live. Old ways retired. Business uninterrupted.</p>
            </Reveal>
            <Reveal className="fact proof" i={3}>
              <Heading level={3}>Proof</Heading>
              <p>
                <span className="pf">FAROGL</span> — an oil and gas operation taken from manual workflows to one
                governed ERP, in phases people actually adopted.{' '}
                <Link className="story" href="/case-studies">
                  Read the story <i aria-hidden="true">→</i>
                </Link>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SOLUTION 03 — ENGINEERING AUGMENTATION */}
      <section className="sol" id="s3">
        <div className="wrap">
          <div className="scene">
            <Reveal className="sol-mark">
              Solution 03 / 4 · <b>Engineering Augmentation</b>
            </Reveal>
            <Reveal className="sol-num big" i={1}>
              03
            </Reveal>
            <Reveal className="big" i={1}>
              <Heading level={2} className="sol-name">
                Add senior engineers to your team.
              </Heading>
            </Reveal>
            <Reveal className="sol-panel" i={2} aria-hidden="true">
              <svg className="g" viewBox="0 0 360 240" fill="none">
                <rect className="st" x="176" y="80" width="72" height="72" rx="3" />
                <path className="st" d="M212 80 V152 M176 116 H248" opacity=".5" />
                <rect className="st" x="180" y="120" width="28" height="28" rx="2" opacity=".5" />
                <rect className="st" x="216" y="84" width="28" height="28" rx="2" opacity=".5" />
                <rect className="st" x="216" y="120" width="28" height="28" rx="2" opacity=".5" />
                <rect className="acf m-int" x="181" y="85" width="26" height="26" rx="2" />
              </svg>
            </Reveal>
          </div>
          <div className="facts">
            <Reveal className="fact">
              <Heading level={3}>Who it&rsquo;s for</Heading>
              <p>You know exactly what to build. You need more senior hands building it.</p>
            </Reveal>
            <Reveal className="fact" i={1}>
              <Heading level={3}>What we do</Heading>
              <p>
                We place experienced engineers inside your team — your process, your tooling, your rituals. Named
                people, not rotating resources.
              </p>
            </Reveal>
            <Reveal className="fact get" i={2}>
              <Heading level={3}>What you get</Heading>
              <p>Delivery speed you can measure, from engineers you&rsquo;d have hired yourself.</p>
            </Reveal>
            <Reveal className="fact proof" i={3}>
              <Heading level={3}>Proof</Heading>
              <p className="hold">
                [ Named client, with written permission — or hold this slot until you have one. An empty proof line is
                better than a vague one. ]
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SOLUTION 04 — MANAGED SYSTEMS */}
      <section className="sol alt" id="s4">
        <div className="wrap">
          <div className="scene">
            <Reveal className="sol-mark">
              Solution 04 / 4 · <b>Managed Systems</b>
            </Reveal>
            <Reveal className="sol-num big" i={1}>
              04
            </Reveal>
            <Reveal className="big" i={1}>
              <Heading level={2} className="sol-name">
                We run what we build.
              </Heading>
            </Reveal>
            <Reveal className="sol-panel" i={2} aria-hidden="true">
              <svg className="g" viewBox="0 0 360 240" fill="none">
                <circle className="st" cx="180" cy="120" r="52" opacity=".35" />
                <circle className="st" cx="180" cy="120" r="32" opacity=".2" />
                <rect className="acf a-node" x="170" y="110" width="20" height="20" rx="3" />
                <g className="a-orbit" style={{ transformOrigin: '180px 120px' }}>
                  <circle className="acf" cx="180" cy="68" r="5" />
                </g>
                <g
                  className="a-orbit"
                  style={{ transformOrigin: '180px 120px', animationDuration: '24s', animationDirection: 'reverse' }}
                >
                  <circle className="fp" cx="212" cy="120" r="4" />
                </g>
              </svg>
            </Reveal>
          </div>
          <div className="facts">
            <Reveal className="fact">
              <Heading level={3}>Who it&rsquo;s for</Heading>
              <p>You have systems in production and nobody whose actual job is keeping them healthy.</p>
            </Reveal>
            <Reveal className="fact" i={1}>
              <Heading level={3}>What we do</Heading>
              <p>
                Monitoring, patching, incident response — and the unglamorous roadmap of keeping software current, so it
                never becomes next year&rsquo;s legacy problem.
              </p>
            </Reveal>
            <Reveal className="fact get" i={2}>
              <Heading level={3}>What you get</Heading>
              <p>Uptime you stop thinking about.</p>
            </Reveal>
            <Reveal className="fact proof" i={3}>
              <Heading level={3}>Proof</Heading>
              <p>
                <span className="pf">Counterfoil</span> — a platform Ternary builds and runs.{' '}
                <Link className="story" href="/case-studies">
                  Read the story <i aria-hidden="true">→</i>
                </Link>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ENGAGEMENT MODELS */}
      <section className="sec">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">Engagement models</span>
              <Heading level={2}>How the work is structured</Heading>
            </div>
            <p className="sec-sub">
              Three shapes of engagement. Every solution runs on one — or moves between them as the work changes.
            </p>
          </Reveal>
          <div className="models">
            <Reveal className="model">
              <div className="mk">01</div>
              <Heading level={3}>
                Frame<sup>™</sup>
              </Heading>
              <div className="tag">Fixed scope · timeline · price</div>
              <p>For work with a clear finish line.</p>
              <div className="ideal">
                <b>Ideal for</b>Launches, migrations, proofs of concept.
              </div>
            </Reveal>
            <Reveal className="model" i={1}>
              <div className="mk">02</div>
              <Heading level={3}>
                Flow<sup>™</sup>
              </Heading>
              <div className="tag">Dedicated team · continuous</div>
              <p>For products that keep evolving.</p>
              <div className="ideal">
                <b>Ideal for</b>Long-term product development, continuous delivery.
              </div>
            </Reveal>
            <Reveal className="model" i={2}>
              <div className="mk">03</div>
              <Heading level={3}>
                Orchestra<sup>™</sup>
              </Heading>
              <div className="tag">Senior capacity · on demand</div>
              <p>For teams that need depth without the headcount.</p>
              <div className="ideal">
                <b>Ideal for</b>Filling skill gaps, scaling delivery.
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* COMPARE TABLE */}
      <section className="sec">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">Compare</span>
              <Heading level={2}>Four columns. Six honest answers.</Heading>
            </div>
            <p className="sec-sub">
              No winner. Hover a column — the right one is whichever matches your situation.
            </p>
          </Reveal>
          <Reveal i={1}>
            <SolutionsCompare />
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="wrap">
          <Reveal className="eyebrow">Start here</Reveal>
          <Reveal i={1}>
            <Heading level={2}>Still not sure which one you need?</Heading>
          </Reveal>
          <Reveal as="p" i={2}>
            Neither are most people at this stage — that&rsquo;s our job, not yours. Tell us the problem. We&rsquo;ll
            tell you the shape.
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
