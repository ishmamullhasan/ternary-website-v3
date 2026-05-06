import Motion from '@/components/animation/motion'
import { cn } from '@/lib/utils'
import type { JSX, ReactNode } from 'react'

type SectionProps = {
  title: string
  desc: string
  children: ReactNode
  className?: string
}

export function Section({ title, desc, children, className = '' }: SectionProps): JSX.Element {
  return (
    <Motion
      tag="section"
      className={cn('space-y-8', className)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Motion
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <h2 className="max-w-none lg:max-w-md text-3xl font-medium text-white tracking-tight mb-2">{title}</h2>
        <p className="max-w-none lg:max-w-2xl text-zinc-400 text-base">{desc}</p>
      </Motion>
      {children}
    </Motion>
  )
}
