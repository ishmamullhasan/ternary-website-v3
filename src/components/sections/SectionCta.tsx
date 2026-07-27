import Link from '@/components/LocalizedLink'
import { ArrowUpRight } from 'lucide-react'
import type { JSX } from 'react'

/**
 * The "Learn more" affordance that sits top-right of a home-page section header,
 * level with the section's `h2`, and sends the reader to that section's hub.
 *
 * Four of these render on the home page (solutions, capabilities, industries,
 * scales), which is exactly why `destination` is required rather than optional.
 * Four links whose accessible name is the bare string "Learn more" would be
 * indistinguishable in a screen reader's link list — SC 2.4.4 Link Purpose. The
 * destination is appended in an `sr-only` span instead of via `aria-label`, so
 * the accessible name still *starts with* the visible words and speech-input
 * users can say "Learn more" and be understood (SC 2.5.3 Label in Name); an
 * `aria-label` would silently replace the visible text instead of extending it.
 *
 * Surface is `bg-ink` — the same #0f0e0e every card on the home page sits on —
 * so the button reads as part of that family against the `--color-card` panel
 * rather than introducing a fifth surface value.
 */
export default function SectionCta({
  href,
  destination,
}: {
  href: string
  /** Completes the sentence "Learn more …", e.g. "about our industries". */
  destination: string
}): JSX.Element {
  return (
    <Link
      href={href}
      className="group/cta inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-md bg-ink px-5 text-sm font-medium whitespace-nowrap text-cream transition-colors duration-300 hover:bg-[#23211d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
    >
      Learn more
      <span className="sr-only"> {destination}</span>
      <ArrowUpRight
        size={14}
        strokeWidth={2}
        aria-hidden
        className="shrink-0 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5 motion-reduce:transform-none"
      />
    </Link>
  )
}
