'use client'

import type { MotionProps } from 'motion/react'
import { motion, useReducedMotion } from 'motion/react'
import type { ElementType, JSX, ReactNode } from 'react'
import { useMemo } from 'react'

interface MotionWrapperProps extends MotionProps {
  tag?: ElementType
  className?: string
  id?: string
  children?: ReactNode
}

const MOTION_KEYS = [
  'initial',
  'animate',
  'whileInView',
  'whileHover',
  'whileTap',
  'whileFocus',
  'exit',
  'transition',
  'variants',
  'viewport',
] as const

export default function Motion({ tag = 'div', children, ...rest }: MotionWrapperProps): JSX.Element {
  const reduce = useReducedMotion()
  // Memoize the created motion component so its identity is stable across re-renders. Calling
  // motion.create(tag) inline would mint a new component on every render (e.g. when
  // useReducedMotion resolves its media query), remounting the node and resetting the reveal.
  const Component = useMemo(() => motion.create(tag), [tag])

  // Honor prefers-reduced-motion: strip all animation props and render the element statically.
  if (reduce) {
    const plain: Record<string, unknown> = { ...rest }
    for (const k of MOTION_KEYS) delete plain[k]
    return <Component {...(plain as MotionProps)}>{children}</Component>
  }

  // Scroll reveals fire once by default (previously re-triggered on every scroll into view,
  // causing jitter). Callers can still override viewport explicitly.
  const viewport = rest.whileInView ? { once: true, ...(rest.viewport ?? {}) } : rest.viewport
  return (
    <Component {...rest} viewport={viewport}>
      {children}
    </Component>
  )
}
