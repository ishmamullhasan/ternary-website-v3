import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import type { ContactHeroBlock } from '@/payload-types'
import { ArrowUpRight } from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

export function ContactHeroComponent(props: ContactHeroBlock): JSX.Element {
  const heading = props?.heading || 'Let’s start a conversation that lands in the right inbox.'
  const description =
    props?.description ||
    'Pick the route that fits. Each one goes to a named owner with a posted response window — no shared mailbox, no triage queue, no “we’ll get back to you.”'
  const button_1 = props?.buttons?.[0]
  const button_2 = props?.buttons?.[1]

  return (
    <section className="space-y-8">
      <div className="max-w-[644px] space-y-6">
        {/* Above-the-fold display copy uses animate (not whileInView) so it never starts hidden. */}
        <Motion
          tag="h1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-display text-[clamp(2rem,5vw,2.5rem)] font-medium leading-[1.15] tracking-[-0.05em] text-cream"
        >
          {heading}
        </Motion>
        <Motion
          tag="p"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
          className="text-[16px] leading-relaxed text-body"
        >
          {description}
        </Motion>
      </div>

      <Motion
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
        className="flex flex-wrap items-center gap-4"
      >
        {button_1?.label && (
          <Link
            href={button_1.url || '#routes'}
            className={`group inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cream px-8 py-2 text-[16px] font-medium leading-[1.15] text-ink transition-colors hover:bg-cream-hover ${focusRing}`}
          >
            {button_1.label}
            <ArrowUpRight
              size={16}
              strokeWidth={2.5}
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        )}
        {button_2?.label && (
          <Link
            href={button_2.url || '#offices'}
            className={`inline-flex h-10 items-center justify-center rounded-lg bg-button-dark px-8 py-2 text-[16px] font-medium leading-[1.15] text-cream transition-colors hover:bg-button-dark/80 ${focusRing}`}
          >
            {button_2.label}
          </Link>
        )}
      </Motion>
    </section>
  )
}
