import Motion from '@/components/animation/motion'
import { careersBg, careersBorder, careersText } from '@/lib/careers-colors'
import type { ContactStatsBlock } from '@/payload-types'
import type { JSX } from 'react'

const motionSectionProps = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

export function ContactStatsComponent(props: ContactStatsBlock): JSX.Element | null {
  const stats = props?.stats ?? []

  if (stats.length === 0) return null

  return (
    <Motion tag="section" className="grid grid-cols-1 md:grid-cols-3 gap-4" {...motionSectionProps}>
      {stats.map((stat, i) => (
        <div
          key={stat.id ?? i}
          className={`${careersBg.card} border ${careersBorder.subtle} rounded-lg p-8 text-center space-y-2`}
        >
          <p className={`text-2xl md:text-3xl font-semibold ${careersText.white}`}>{stat.value}</p>
          <p className={`text-base font-medium ${careersText.body}`}>{stat.label}</p>
          <p className={`text-sm ${careersText.muted}`}>{stat.detail}</p>
        </div>
      ))}
    </Motion>
  )
}
