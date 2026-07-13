import Motion from '@/components/animation/motion'
import { cn } from '@/lib/utils'
import type { JSX, ReactNode } from 'react'

/** Which side the primary column (`children`) sits on at `lg` breakpoints. Mobile order keeps primary content first when `right`. */
export type ColumnSectionMainSide = 'left' | 'right'

type ColumnSectionProps = {
  badge?: string
  title?: string
  description?: string
  desc?: string
  children: ReactNode
  /** Right column (e.g. hero card). When set, uses `max-w-7xl` + `lg:grid-cols-2`. */
  aside?: ReactNode
  /** Primary column side on large screens. Default `left` (aside on the right). */
  mainSide?: ColumnSectionMainSide
  className?: string
}

export default function ColumnSection({
  badge = '',
  title = '',
  description,
  desc = '',
  children,
  aside,
  mainSide = 'left',
  className = '',
}: ColumnSectionProps): JSX.Element {
  const resolvedDescription = description ?? desc
  const showHeader = Boolean(badge?.trim()) || Boolean(title?.trim()) || Boolean(resolvedDescription?.trim())

  const headerBlock = showHeader ? (
    <Motion
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {badge?.trim() ? (
        <div className="mb-6 inline-flex items-center rounded-md border border-line bg-main px-3 py-1 text-[12px] font-medium uppercase tracking-[0.14em] text-subtle">
          {badge}
        </div>
      ) : null}
      {title?.trim() ? (
        <h2 className="font-display text-2xl md:text-3xl font-medium text-cream mb-2 leading-tight">{title}</h2>
      ) : null}
      {resolvedDescription?.trim() ? <p className="text-body mb-10 text-base">{resolvedDescription}</p> : null}
    </Motion>
  ) : null

  if (aside !== undefined && aside !== null) {
    const primaryColClass = cn('min-w-0', mainSide === 'right' && 'order-1 lg:order-2')
    const asideColClass = cn('min-w-0', mainSide === 'right' && 'order-2 lg:order-1')

    // No max-width or horizontal gutter here: RenderBlocks already wraps every block in
    // `max-w-7xl mx-auto px-5`, so re-applying it would inset this section a further 20px per side
    // and leave it narrower than its siblings (e.g. SolutionsEngage).
    return (
      <Motion
        tag="section"
        className={cn(className)}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="grid lg:grid-cols-2 gap-4 items-start lg:items-stretch">
          <div className={primaryColClass}>
            {headerBlock}
            {children}
          </div>
          <div className={asideColClass}>{aside}</div>
        </div>
      </Motion>
    )
  }

  return (
    <Motion
      tag="section"
      className={cn('space-y-8', className)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {headerBlock}
      {children}
    </Motion>
  )
}
