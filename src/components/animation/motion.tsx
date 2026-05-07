'use client'

import type { MotionProps } from 'motion/react'
import { motion } from 'motion/react'
import type { ElementType, JSX, ReactNode } from 'react'

interface MotionWrapperProps extends MotionProps {
  tag?: ElementType
  className?: string
  children?: ReactNode
}

export default function Motion({ tag = 'div', children, ...rest }: MotionWrapperProps): JSX.Element {
  const Component = motion.create(tag)
  return <Component {...rest}>{children}</Component>
}
