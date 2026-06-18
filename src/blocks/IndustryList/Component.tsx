import Motion from '@/components/animation/motion'
import type { Industry, IndustryListBlock } from '@/payload-types'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import type { JSX } from 'react'

export function IndustryListComponent(props: IndustryListBlock): JSX.Element {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  const motionGridItemProps = {
    initial: { opacity: 0, scale: 0.985 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.35 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  const industries = props?.industry as Industry[] | undefined

  return (
    <Motion tag="section" className="w-full py-16 lg:m-0 m-4" {...motionSectionProps}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {industries?.map((item, index) => (
          <Link href={`/industries`} key={item.id ?? index} className="group block">
            <Motion
              className="bg-[#1B1A17] hover:bg-[#252420] border border-zinc-800/40 rounded-lg p-6 lg:p-8 h-[320px] flex flex-col justify-end transition-colors duration-300"
              {...motionGridItemProps}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: index * 0.05,
              }}
            >
              <div className="flex flex-col space-y-6">
                <div className="w-10 h-10 rounded-full bg-[#14120B] border border-zinc-800/60 flex items-center justify-center text-white/80 shadow-inner">
                  <Zap size={16} className="stroke-[2.5]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg lg:text-xl font-medium tracking-tight text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#D5D5D5] font-normal leading-relaxed line-clamp-4">
                    {item.excerpts ||
                      'Clear processes enable weekly releases and predictable continuous deployment, avoiding technical debt.'}
                  </p>
                </div>
              </div>
            </Motion>
          </Link>
        ))}
      </div>
    </Motion>
  )
}
