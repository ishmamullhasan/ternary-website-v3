import Motion from '@/components/animation/motion'
import type { ContactStatsBlock } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Adapt the column count to the data so the row never leaves an orphan wrapping below md.
const COLS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

export function ContactStatsComponent(props: ContactStatsBlock): JSX.Element | null {
  const stats = props?.stats ?? []
  if (stats.length === 0) return null

  const cols = COLS[Math.min(stats.length, 4)] ?? 'sm:grid-cols-3'

  return (
    <Motion
      tag="section"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={`grid grid-cols-1 gap-8 ${cols}`}
    >
      {stats.map((stat, i) => (
        <Motion
          key={stat.id ?? i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.07, 0.28) }}
          className="group flex flex-col items-center justify-center gap-4 rounded-lg border border-line bg-main px-4 py-6 text-center transition-colors duration-300 hover:border-line-strong"
        >
          {stat.value && (
            <p className="font-display text-[30px] font-medium leading-[1.15] tracking-[-0.05em] text-cream">
              {stat.value}
            </p>
          )}
          <div className="flex flex-col items-center gap-2">
            {stat.label && (
              <p className="font-display text-[24px] font-medium leading-[1.15] tracking-[-0.05em] text-cream">
                {stat.label}
              </p>
            )}
            {stat.detail && <p className="text-[16px] leading-[1.15] text-body">{stat.detail}</p>}
          </div>
        </Motion>
      ))}
    </Motion>
  )
}
