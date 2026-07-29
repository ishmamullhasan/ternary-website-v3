import Link from '@/components/LocalizedLink'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import type { JSX } from 'react'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

/**
 * The home page's closing moment, between the last section and the footer.
 *
 * The page ran Team straight into the footer with nothing asking the reader to do
 * anything — every hub page (/solutions, /capabilities, /scales) already closes on a
 * gradient CTA, and the home page was the one that did not.
 *
 * THE GRADIENT is a glow rising from below the panel's bottom edge, so the light
 * appears to come from outside the frame rather than sitting in it as a blob. Centred
 * at 50% 125% — past the bottom edge — with the stops tightening toward the middle;
 * the top of the panel stays near-black, which is what keeps the headline readable
 * over it without a scrim.
 *
 * CENTRED, not the split layout of the reference. That layout's right half was a
 * five-star testimonial from a named "Chief Marketing Officer" — template placeholder
 * content. Inventing a client quote and attributing it to a person is fabricating a
 * record, and this project's own rule is stricter than my own instinct here: the
 * solutions page marks its proof slot "named client with written permission only".
 * With nothing real to put opposite, a centred composition is also the better read for
 * a bottom-centre glow — it lines the copy up with the light instead of leaving a
 * lopsided empty half.
 */
export default function HomeCta(): JSX.Element {
  return (
    <section className="mx-auto w-full max-w-[1480px] px-5 pb-[clamp(48px,5vw,80px)] md:px-8 lg:px-12">
      {/* NOT wrapped in <Motion>, unlike the rest of the page. Motion commits its `initial`
          styles before useReducedMotion() resolves and never clears them, so anything it
          wraps is left on opacity 0 for reduced-motion visitors — measured here: with the
          wrapper this panel computed opacity 0 under BOTH prefers-reduced-motion and with
          JavaScript disabled. A closing call to action that some visitors never see is not
          worth a 600ms rise, and this one is reached by scrolling to the bottom of the page,
          so it is already in view when you arrive. */}
      <div className="relative overflow-hidden rounded-xl px-6 pt-[clamp(56px,7vw,104px)] pb-[clamp(96px,12vw,180px)]">
        <span aria-hidden className="absolute inset-0">
          <span className="absolute inset-0 bg-[#07060f]" />
          <span
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(115% 92% at 50% 126%, #8b5cf6 0%, #6b38dd 16%, #3d2091 36%, #1b1244 60%, rgba(7,6,15,0) 86%)',
            }}
          />
          {/* the signature grain, same as every other CTA on the site */}
          <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
          {/* keeps the upper third near-black so the headline never sits on the bright part */}
          <span className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
        </span>

        <div className="relative z-10 mx-auto flex max-w-[46ch] flex-col items-center text-center">
          <span className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.16em] text-cream/60 uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-cream/60" />
            Start here
          </span>

          <h2 className="font-display mt-5 text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance text-cream">
            Start with a conversation, not a proposal.
          </h2>

          <p className="mt-5 max-w-[52ch] text-[clamp(1rem,1.4vw,1.125rem)] leading-relaxed text-body">
            Tell us what you are trying to build, or what has stopped working. We will tell you the shape it should take
            — and whether we are the right team to do it.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className={cn(
                'group/cta inline-flex items-center justify-center gap-2 rounded-md bg-cream px-6 py-3 text-[15px] font-medium text-ink transition-colors duration-300 hover:bg-cream-hover',
                FOCUS_RING,
              )}
            >
              Start a conversation
              <ArrowRight
                size={16}
                strokeWidth={2}
                aria-hidden
                className="transition-transform duration-300 group-hover/cta:translate-x-0.5 motion-reduce:transform-none"
              />
            </Link>
            <Link
              href="/stories"
              className={cn(
                'inline-flex items-center justify-center rounded-md bg-cream/[0.12] px-6 py-3 text-[15px] font-medium text-cream transition-colors duration-300 hover:bg-cream/[0.2]',
                FOCUS_RING,
              )}
            >
              See our work
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
