import Motion from '@/components/animation/motion'
import type { AboutHeroBlock } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * About page intro hero (design node 1255:2819). A centered display headline in Poppins
 * (`font-display`) over a short supporting line. Above-the-fold text animates with `animate`
 * (not `whileInView`) so the headline is never gated behind a scroll trigger.
 *
 * The heading may arrive as a single string with an embedded newline ("line one\nline two") or
 * with a literal "/" delimiter — we split so the two-line editorial cadence from the design holds
 * without hardcoding copy.
 */
export function AboutHeroComponent({ heading, description }: AboutHeroBlock): JSX.Element {
  const lines = (heading ?? '')
    .split(/\n|\s*\/\s*/)
    .map((l) => l.trim())
    .filter(Boolean)

  return (
    <section className="py-16 lg:py-[72px]">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center lg:px-0">
        <Motion
          tag="h1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-display text-[clamp(1.75rem,4vw,40px)] font-medium leading-[1.15] tracking-[-0.05em] text-cream text-balance"
        >
          {lines.length > 1
            ? lines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))
            : (heading ?? '')}
        </Motion>

        {description ? (
          <Motion
            tag="p"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-body/90"
          >
            {description}
          </Motion>
        ) : null}
      </div>
    </section>
  )
}
