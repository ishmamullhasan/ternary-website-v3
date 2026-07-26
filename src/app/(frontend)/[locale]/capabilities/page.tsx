import Heading from '@/components/a11y/Heading'
import HeroNodeField from '@/components/hub/HeroNodeField'
import Reveal from '@/components/hub/Reveal'
import Link from '@/components/LocalizedLink'
import { asTypedLocale } from '@/lib/i18n/locales'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import '@/components/hub/hub.css'
import './capabilitiesHub.css'
import CapabilityIndex from './CapabilityIndex'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!asTypedLocale(locale)) return {}
  return {
    title: 'Capabilities',
    description:
      'Eight disciplines. One standard. The technical practices behind everything we build and run — each with a named lead, house standards, and work in production to show for it.',
  }
}

// In-hero index — anchors to each discipline in the accordion below.
const HERO_INDEX = [
  { n: '00', label: 'Agentic Architecture' },
  { n: '01', label: 'Artificial Intelligence' },
  { n: '02', label: 'Data & Analytics' },
  { n: '10', label: 'Cloud Transformation' },
  { n: '11', label: 'Platformization' },
  { n: '12', label: 'Digital Experiences' },
  { n: '20', label: 'DevOps & Automation' },
  { n: '21', label: 'Internet of Things' },
]

export default async function CapabilitiesHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!asTypedLocale(locale)) notFound()

  return (
    <div className="hub">
      {/* HERO */}
      <section className="hero">
        <HeroNodeField className="hero-net" />
        <div className="wrap">
          <Reveal className="eyebrow">Capability index / 8 disciplines</Reveal>
          <Reveal i={1}>
            <Heading level={1}>
              Eight disciplines.
              <br />
              One standard.
            </Heading>
          </Reveal>
          <Reveal as="p" className="hero-sub" i={2}>
            The technical practices behind everything we build and run. Each has a named lead, house standards, and
            work in production to show for it.
          </Reveal>
          <Reveal i={3}>
            <nav className="hero-idx" aria-label="Capability index">
              {HERO_INDEX.map((item) => (
                <a href={`#c${item.n}`} key={item.n}>
                  {item.label}
                </a>
              ))}
            </nav>
          </Reveal>
        </div>
      </section>

      {/* FRAMING */}
      <section className="framing">
        <div className="wrap">
          <Reveal className="eyebrow lab">What a capability is</Reveal>
          <Reveal as="p" i={1}>
            A capability, to us, is <em>a practice we run in production</em> — not a keyword on a services page.
          </Reveal>
        </div>
      </section>

      {/* THE INDEX */}
      <section className="sec">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">The index</span>
              <Heading level={2}>What we practice</Heading>
            </div>
            <p className="sec-sub">
              Eight disciplines we run in production. Open one for the methods, the standards, and the work behind
              each.
            </p>
          </Reveal>
          <Reveal i={1}>
            <CapabilityIndex />
          </Reveal>
        </div>
      </section>

      {/* IN PRACTICE */}
      <section className="sec">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">In practice</span>
              <Heading level={2}>They ship together</Heading>
            </div>
            <p className="sec-sub">
              Most engagements draw on three or four disciplines at once. A modernization is never just cloud.
            </p>
          </Reveal>
          <div className="combos">
            <Reveal className="combo">
              <div className="combo-viz">
                <svg className="g" viewBox="0 0 320 150" fill="none" aria-hidden="true">
                  <g className="a-rot" style={{ transformOrigin: '160px 75px' }}>
                    <rect className="st" x="120" y="35" width="80" height="80" rx="4" strokeOpacity=".4" />
                    <rect className="st ac" x="134" y="49" width="52" height="52" rx="3" transform="rotate(18 160 75)" />
                  </g>
                </svg>
              </div>
              <div className="combo-in">
                <div className="combo-tag">Capital markets</div>
                <Heading level={3}>Dhaka Stock Exchange</Heading>
                <p>
                  A national exchange&rsquo;s public platform, rebuilt from the ground up — modern, bilingual,
                  accessible — without touching the trading core.
                </p>
                <div className="combo-discs">
                  <span className="hl">Digital Experiences</span>
                  <span>Data &amp; Analytics</span>
                  <span>Cloud</span>
                </div>
              </div>
            </Reveal>

            <Reveal className="combo" i={1}>
              <div className="combo-viz">
                <svg className="g" viewBox="0 0 320 150" fill="none" aria-hidden="true">
                  <rect
                    className="st"
                    x="176"
                    y="30"
                    width="120"
                    height="90"
                    rx="4"
                    strokeDasharray="5 6"
                    strokeOpacity=".5"
                  />
                  <g className="a-orbit" style={{ transformOrigin: '110px 75px' }}>
                    <circle className="acf" cx="110" cy="40" r="5" />
                  </g>
                  <circle className="fp" cx="110" cy="75" r="5" />
                  <g className="st" strokeOpacity=".4">
                    <line x1="110" y1="75" x2="230" y2="60" />
                    <line x1="110" y1="75" x2="230" y2="90" />
                  </g>
                </svg>
              </div>
              <div className="combo-in">
                <div className="combo-tag">Capital markets · AI</div>
                <Heading level={3}>LankaBangla Securities</Heading>
                <p>
                  A governed, air-gapped AI layer letting brokerage advisors query market and portfolio data in plain
                  language — production systems never exposed.
                </p>
                <div className="combo-discs">
                  <span className="hl">Agentic Architecture</span>
                  <span>Artificial Intelligence</span>
                  <span>Data</span>
                </div>
              </div>
            </Reveal>

            <Reveal className="combo" i={2}>
              <div className="combo-viz">
                <svg className="g" viewBox="0 0 320 150" fill="none" aria-hidden="true">
                  <g className="st">
                    <rect className="a-bre sp" x="70" y="66" width="34" height="34" rx="3" />
                    <rect className="a-bre sp" x="96" y="52" width="34" height="34" rx="3" style={{ animationDelay: '.5s' }} />
                    <rect
                      className="ac a-bre sp"
                      x="122"
                      y="38"
                      width="34"
                      height="34"
                      rx="3"
                      style={{ animationDelay: '1s' }}
                    />
                  </g>
                  <circle
                    className="st a-rot"
                    cx="230"
                    cy="75"
                    r="30"
                    style={{ transformOrigin: '230px 75px' }}
                    strokeDasharray="3 8"
                    strokeOpacity=".5"
                  />
                </svg>
              </div>
              <div className="combo-in">
                <div className="combo-tag">Experience economy</div>
                <Heading level={3}>Counterfoil</Heading>
                <p>
                  A booking monolith rebuilt as an event-driven platform — while the original stayed live and taking
                  bookings the whole time.
                </p>
                <div className="combo-discs">
                  <span className="hl">Platformization</span>
                  <span>DevOps</span>
                  <span>Digital Experiences</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* THE BAR */}
      <section className="sec">
        <div className="wrap bar-grid">
          <Reveal x>
            <span className="eyebrow">The bar</span>
            <Heading level={2} className="bar-lead">
              One standard across all eight.
            </Heading>
          </Reveal>
          <div>
            <Reveal className="std">
              <span className="k">a</span>
              <div>
                <Heading level={3}>Led by a practitioner</Heading>
                <p>
                  Every capability has a named lead who still builds. You can meet them before you sign anything.
                </p>
              </div>
            </Reveal>
            <Reveal className="std" i={1}>
              <span className="k">b</span>
              <div>
                <Heading level={3}>Proven in production</Heading>
                <p>We list only what we currently run for clients. If it isn&rsquo;t live somewhere, it isn&rsquo;t on this page.</p>
              </div>
            </Reveal>
            <Reveal className="std" i={2}>
              <span className="k">c</span>
              <div>
                <Heading level={3}>Owned past launch</Heading>
                <p>
                  Capability work ships with monitoring, documentation, and a handover we stand behind — or we keep
                  running it ourselves.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="wrap">
          <Reveal className="eyebrow">Start here</Reveal>
          <Reveal i={1}>
            <Heading level={2}>Not sure which capability you need?</Heading>
          </Reveal>
          <Reveal as="p" i={2}>
            Most people aren&rsquo;t — that&rsquo;s our job. Describe the problem in your own words, and we&rsquo;ll
            bring the right practices to the first call.
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
