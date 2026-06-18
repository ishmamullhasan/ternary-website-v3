import Section from '@/components/layout/section'
import type { SolutionsEngageBlock } from '@/payload-types'
import { ArrowRight } from 'lucide-react'
import type { JSX } from 'react'

// Gradient/bar styling for the three "How We Engage" cards.
const engageStyles = [
  {
    gradient: 'from-emerald-900/40 to-teal-900/40',
    barColor: 'bg-gradient-to-r from-emerald-400 to-teal-400',
  },
  {
    gradient: 'from-violet-900/40 to-fuchsia-900/40',
    barColor: 'bg-gradient-to-r from-violet-400 to-fuchsia-400',
  },
  {
    gradient: 'from-indigo-900/40 to-purple-900/40',
    barColor: 'bg-gradient-to-r from-indigo-400 to-purple-400',
  },
]

export function SolutionsEngageComponent(props: SolutionsEngageBlock): JSX.Element {
  const engageCards = props?.cards ?? []

  return (
    <Section title={props?.heading || undefined} desc={props?.description || undefined}>
      <div className="grid md:grid-cols-3 gap-6">
        {engageStyles.map((item, i) => (
          <div
            key={i}
            className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-full hover:border-neutral-700 transition-colors cursor-pointer"
          >
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-white">{engageCards[i]?.title}</h3>
                <ArrowRight size={20} className="text-neutral-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-xs font-mono text-neutral-500 mb-4 whitespace-pre-line leading-relaxed">
                {(engageCards[i]?.subtitle || '').split(' ').map((word, j) => (
                  <div key={j}>{word}</div>
                ))}
              </div>
              <p className="text-sm text-neutral-400">{engageCards[i]?.description}</p>
            </div>

            <div className={`h-32 mt-auto bg-gradient-to-b ${item.gradient} relative`}>
              <div
                className={`absolute bottom-6 left-6 right-6 h-12 rounded-lg opacity-80 ${item.barColor} blur-[2px]`}
              ></div>
              <div
                className={`absolute bottom-6 left-6 right-6 h-12 rounded-lg opacity-50 ${item.barColor} blur-xl`}
              ></div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.1),transparent)]"></div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

export default SolutionsEngageComponent
