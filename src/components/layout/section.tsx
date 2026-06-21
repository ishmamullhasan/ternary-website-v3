import Motion from '@/components/animation/motion'
import { cn } from '@/lib/utils'
import type { JSX, ReactNode } from 'react'

type SectionProps = {
  title?: string
  desc?: string
  children: ReactNode
  className?: string
}

export default function Section({ title = '', desc = '', children, className = '' }: SectionProps): JSX.Element {
  const showHeader = Boolean(title?.trim()) || Boolean(desc?.trim())

  return (
    <Motion
      tag="section"
      className={cn('space-y-8', className)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {showHeader ? (
        <Motion
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {title?.trim() ? (
            <h2 className="font-display max-w-none lg:max-w-3xl lg:text-3xl text-2xl font-medium text-cream mb-2">
              {title}
            </h2>
          ) : null}
          {desc?.trim() ? <p className="max-w-none lg:max-w-2xl text-body lg:text-base text-sm">{desc}</p> : null}
        </Motion>
      ) : null}
      {children}
    </Motion>
  )
}
