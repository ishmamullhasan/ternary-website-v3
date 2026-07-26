'use client'

import { cn } from '@/utilities/ui'
import { type CSSProperties, type ElementType, type ReactNode, useEffect, useRef, useState } from 'react'

/**
 * Scroll reveal for the hub pages — the client half of the `.rv` choreography defined in hub.css.
 * Adds `.in` when the element first scrolls into view (fires once, like the site's `Motion` reveals).
 *
 * Reduced motion is handled entirely in CSS (hub.css collapses `.rv` under both the OS media query
 * and the in-app A11yFab `data-a11y-motion` toggle), so this component does no motion gating itself —
 * adding `.in` to an already-static element is a no-op. That keeps it a tiny, dependency-free leaf
 * that can wrap the dozens of revealed elements on each page without minting a Motion component each.
 *
 * @param i  stagger index — multiplied by 70ms in CSS via the `--i` custom property.
 * @param x  use the horizontal (from-left) entrance instead of the default rise.
 */
export default function Reveal({
  as: Tag = 'div',
  className,
  children,
  i = 0,
  x = false,
  id,
}: {
  as?: ElementType
  className?: string
  children?: ReactNode
  i?: number
  x?: boolean
  id?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.14 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <Tag
      ref={ref}
      id={id}
      className={cn('rv', x && 'lx', shown && 'in', className)}
      style={{ '--i': i } as CSSProperties}
    >
      {children}
    </Tag>
  )
}
