'use client'

import { careersBg, careersBorder } from '@/lib/careers-colors'
import type { Job } from '@/payload-types'
import { Clock } from 'lucide-react'
import type { JSX, MouseEvent } from 'react'
import { useRef, useState } from 'react'

type InterviewStep = NonNullable<NonNullable<Job['interviewProcess']>['steps']>[number]

interface InterviewProcessProps {
  interviewProcess?: Job['interviewProcess']
}

const gridColsClass: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
}

function getStepPercentPosition(index: number, total: number): number {
  if (total <= 1) return 0
  return (index / (total - 1)) * 100
}

export default function InterviewProcess({ interviewProcess }: InterviewProcessProps): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverPercent, setHoverPercent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const steps = interviewProcess?.steps
  if (!steps?.length) return null

  const gridClass = gridColsClass[Math.min(steps.length, 4)] ?? 'md:grid-cols-4'

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100)
    setHoverPercent(percentage)
  }

  return (
    <section>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setHoverPercent(0)
        }}
        className={`w-full ${careersBg.card} border ${careersBorder.subtle} rounded-xl p-8 md:p-10`}
      >
        <div className="flex items-center gap-3 mb-10 text-[#D5D5D5]">
          <Clock size={20} />
          <h2 className="text-base font-medium tracking-tight">{interviewProcess?.heading || 'Interview Process'}</h2>
        </div>

        <div className={`grid grid-cols-1 ${gridClass} gap-8 relative`}>
          <div className="hidden md:block absolute top-[14px] left-[14px] right-[14px] h-[2px] bg-[#27272a] z-0 pointer-events-none overflow-hidden rounded-full">
            <div
              className="h-full bg-white transition-[width] duration-75 ease-out"
              style={{ width: isHovered ? `${hoverPercent}%` : '0%' }}
            />
          </div>

          {steps.map((step: InterviewStep, index: number) => {
            const stepPercentPosition = getStepPercentPosition(index, steps.length)
            const isStepPassed = isHovered && hoverPercent >= stepPercentPosition

            return (
              <div key={step.id || index} className="flex flex-col relative z-10 group">
                <div className="flex items-center w-full mb-4 relative">
                  <div
                    className={`flex items-center text-sm justify-center w-7 h-7 rounded-full bg-[#121212] border transition-colors duration-300 text-xs font-medium z-10 shrink-0
                      ${
                        isStepPassed
                          ? 'border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                          : 'border-[#3f3f46] text-[#757571] group-hover:border-[#d5d5d5]'
                      }`}
                  >
                    {index + 1}
                  </div>
                </div>

                <div className="space-y-1.5 pr-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3
                      className={`text-base font-semibold tracking-tight transition-colors duration-300
                      ${isStepPassed ? 'text-white' : 'text-[#D5D5D5]'}`}
                    >
                      {step.title || 'Initial Screen'}
                    </h3>

                    {step.duration && (
                      <span className="text-sm text-[#757571] font-mono font-medium whitespace-nowrap">
                        {step.duration}
                      </span>
                    )}
                  </div>

                  {step.excerpt && (
                    <p className="text-base text-[#757571] leading-relaxed max-w-[220px]">{step.excerpt}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
