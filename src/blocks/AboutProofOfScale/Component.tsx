import Motion from '@/components/animation/motion'
import type { AboutProofOfScaleBlock } from '@/payload-types'
import { Box } from 'lucide-react'
import type { JSX } from 'react'

export function AboutProofOfScaleComponent({ heading, description, stats, company }: AboutProofOfScaleBlock): JSX.Element {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  const motionBlockProps = {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.4 as const },
    transition: { duration: 0.35, ease: 'easeOut' as const },
  }

  const motionGridItemProps = {
    initial: { opacity: 0, scale: 0.985 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.35 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  return (
    <Motion tag="section" className="bg-[#1B1A17] lg:p-10 p-4 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
      <div className="mb-16">
        <Motion {...motionBlockProps}>
          <h2 className="lg:text-3xl text-2xl font-semibold mb-3">{heading}</h2>
          <p className="text-[#D5D5D5] text-base max-w-xl mb-12">{description}</p>
        </Motion>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats?.map((stat, i) => (
            <Motion
              key={i}
              className="text-center"
              {...motionGridItemProps}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: i * 0.05,
              }}
            >
              <div className="lg:text-6xl text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-lg">{stat.label}</div>
            </Motion>
          ))}
        </div>
      </div>

      <div className="lg:w-2/5 mb-10">
        <h2 className="lg:text-3xl text-2xl font-semibold mb-3">{company?.heading}</h2>
        <p className="text-[#D5D5D5] text-base mb-12">{company?.description}</p>
      </div>
      <div className="flex flex-row">
        <div className="lg:w-1/5"> </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:w-4/5">
          {company?.items?.map((item, index) => (
            <Motion
              key={index}
              className="bg-[#0F0E0E] p-4 flex flex-col justify-between h-full"
              {...motionGridItemProps}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: index * 0.05,
              }}
            >
              <div>
                <p className="text-base mb-3">{item.excerpt}</p>
                <div className="flex gap-2">
                  {item.stack?.map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-xs border border-[#757571] px-2 py-.5 rounded-full">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 font-semibold mt-15">
                <Box className="w-4 h-4 " />
                <span className="text-lg">{item.name}</span>
              </div>
            </Motion>
          ))}
        </div>
      </div>
    </Motion>
  )
}
