import Motion from '@/components/animation/motion'
import type { CareersHeroBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

export function CareersHeroComponent(props: CareersHeroBlock): JSX.Element {
  const button = props.buttons?.[0]

  return (
    <Motion
      tag="section"
      className="grid lg:grid-cols-2 gap-12 items-center"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Motion
        className="space-y-8 pr-8"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <h1 className="text-3xl lg:text-[40px] font-medium text-white tracking-tighter leading-[1.1]">
          {props.heading || 'Agentic Engineering. Human Orchestration.'}
        </h1>
        <p className="text-[#D5D5D5] text-base">
          {props.description ||
            'Welcome to our company. We build tools that help you work better. Join our team to make an impact.'}
        </p>
        <button className="bg-[#F4F3EC] text-[#0F0E0E] px-6 py-3 rounded-lg font-medium hover:bg-[#E8E7DF] transition-colors">
          {button?.label || 'View Open Roles'}
        </button>
      </Motion>
      <Motion
        className="aspect-4/3 rounded-lg overflow-hidden relative border border-white/10"
        initial={{ opacity: 0, scale: 0.985 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.35 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Synthetic noisy gradient background to match original image */}
        <div className="absolute inset-0 bg-linear-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] opacity-80 mix-blend-screen"></div>
        <div
          className={`absolute inset-0 bg-[url('${(props.image as Media)?.url || 'https://grainy-gradients.vercel.app/noise.svg'}')] opacity-50 contrast-150 mix-blend-overlay`}
        ></div>
      </Motion>
    </Motion>
  )
}
