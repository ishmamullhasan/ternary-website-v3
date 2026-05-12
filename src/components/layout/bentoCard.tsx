import Motion from '@/components/animation/motion'
import { cn } from '@/lib/utils'
import { Zap } from 'lucide-react'
import type { JSX, ReactNode } from 'react'

type BentoCardProps = {
  title?: string
  desc?: string
  children?: ReactNode
  className?: string
  noIcon?: boolean
  imageBg?: string
  isImageOnly?: boolean
  variant?: 'default' | 'splitImageRight'
  /** When false, renders a static div so a parent can own scroll-driven motion (e.g. grid wrappers). */
  animated?: boolean
}

export function BentoCard({
  title,
  desc,
  children,
  className = '',
  noIcon = false,
  imageBg,
  isImageOnly = false,
  variant = 'default',
  animated = true,
}: BentoCardProps): JSX.Element {
  if (variant === 'splitImageRight') {
    const splitClassName = cn(
      `bg-main border border-white/5 rounded-lg relative overflow-hidden flex flex-col group transition-all duration-300 hover:bg-dark`,
      className,
    )
    const splitInner = (
      <div className="relative h-full">
        {imageBg && (
          <div className="absolute inset-y-0 right-0 w-full lg:w-1/2">
            <img
              src={imageBg}
              className="absolute inset-0 w-full h-full object-cover opacity-55"
              alt={title ?? 'Card image'}
            />
            <div className="absolute inset-0 bg-linear-to-l from-transparent via-black/35 to-[#050505]"></div>
          </div>
        )}
        <div className="relative z-10 h-full p-8 flex flex-col justify-end max-w-xl">
          {!noIcon && (
            <div className="p-2 bg-white/5 rounded-full inline-flex backdrop-blur-sm w-fit mb-6">
              <Zap className="w-4 h-4 text-white/70" />
            </div>
          )}
          {title && <h3 className="max-w-lg text-2xl font-medium text-white mb-4 tracking-tight">{title}</h3>}
          {desc && <p className="max-w-lg text-zinc-400 text-sm leading-relaxed">{desc}</p>}
        </div>
        {children}
      </div>
    )

    if (!animated) {
      return <div className={splitClassName}>{splitInner}</div>
    }

    return (
      <Motion
        tag="div"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={splitClassName}
      >
        {splitInner}
      </Motion>
    )
  }

  const defaultClassName = cn(
    `bg-main rounded-lg p-6 lg:p-8 relative overflow-hidden flex flex-col group transition-all duration-300 hover:bg-dark`,
    className,
  )

  const defaultInner = (
    <>
      {imageBg && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${imageBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {!isImageOnly && !noIcon && (
        <div className="mb-auto relative z-10">
          <div className="p-2 bg-white/5 rounded-full inline-flex backdrop-blur-sm">
            <Zap className="w-4 h-4 text-white/70" />
          </div>
        </div>
      )}

      {!isImageOnly && (
        <div className={`mt-auto max-w-lg ${noIcon ? 'h-full flex flex-col justify-end' : ''} relative z-10`}>
          {title && <h3 className="text-lg lg:text-xl font-medium text-white mb-2 tracking-tight">{title}</h3>}
          {desc && <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>}
        </div>
      )}
      {children}
    </>
  )

  if (!animated) {
    return <div className={defaultClassName}>{defaultInner}</div>
  }

  return (
    <Motion
      tag="div"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={defaultClassName}
    >
      {defaultInner}
    </Motion>
  )
}
