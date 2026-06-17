import type { StepsBlock } from '@/payload-types'

import type { JSX } from 'react'

export function StepsBlockComponent({ heading, description, steps }: StepsBlock): JSX.Element {
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
      {(description || heading) && (
        <div className="mb-8 lg:w-2/5">
          {description && <p className="lg:text-base text-sm mb-3 text-body">{description}</p>}
          {heading && <h2 className="lg:text-3xl text-2xl font-semibold text-white">{heading}</h2>}
        </div>
      )}
      <ol className="flex flex-col gap-4">
        {steps?.map((step, i) => (
          <li key={i} className="bg-main rounded-lg p-6 flex gap-5">
            <span className="text-subtle font-mono text-sm shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-white text-base font-semibold">{step.title}</h3>
                {step.duration && <span className="text-subtle text-xs shrink-0">{step.duration}</span>}
              </div>
              {step.description && <p className="text-body text-sm mt-2 leading-relaxed">{step.description}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
