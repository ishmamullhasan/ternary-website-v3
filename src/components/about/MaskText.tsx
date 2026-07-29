import type { CSSProperties, JSX, ReactNode } from 'react'

/**
 * One masked line of editorial type: the clip sits on the wrapper, the travel on the inner
 * span, so the glyphs rise out of their own box instead of fading in place.
 *
 * Renders two plain spans and no motion state of its own — both are inert until an ancestor
 * <AboutMotion> turns the layer on, and the text is present and readable either way. Use
 * inside a real heading element rather than in place of one; this carries no semantics.
 *
 * `delay` feeds the shared `--am-d` stagger so consecutive lines arrive in sequence.
 */
export default function MaskText({
  children,
  className = '',
  delay,
}: {
  children: ReactNode
  className?: string
  delay?: number
}): JSX.Element {
  return (
    <span className={`am-mask ${className}`} style={delay ? ({ '--am-d': `${delay}s` } as CSSProperties) : undefined}>
      <span className="am-mask-i">{children}</span>
    </span>
  )
}
