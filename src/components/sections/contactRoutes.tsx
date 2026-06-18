'use client'

import Motion from '@/components/animation/motion'
import { careersBg, careersBorder, careersText } from '@/lib/careers-colors'
import type { ContactRoutesBlock } from '@/payload-types'
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Handshake,
  Info,
  MessageCircle,
  Newspaper,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { JSX } from 'react'
import { useState } from 'react'

type RoutesData = ContactRoutesBlock
type RouteItem = NonNullable<RoutesData['items']>[number]

// Icon + gradient are fixed in code and matched to CMS routes by position.
const ICONS: LucideIcon[] = [Briefcase, Handshake, Newspaper, Briefcase, MessageCircle, ShieldCheck]
const GRADIENTS = [
  'from-[#6366f1] to-[#a855f7]',
  'from-[#10b981] to-[#14b8a6]',
  'from-[#d946ef] to-[#a855f7]',
  'from-[#f97316] to-[#ef4444]',
  'from-[#3b82f6] to-[#06b6d4]',
  'from-[#14b8a6] to-[#22c55e]',
]

const motionBlockProps = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.3 as const },
  transition: { duration: 0.35, ease: 'easeOut' as const },
}

function RouteCard({ route, index, onSelect }: { route: RouteItem; index: number; onSelect: () => void }): JSX.Element {
  const Icon = ICONS[index % ICONS.length]
  const gradient = GRADIENTS[index % GRADIENTS.length]
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group text-left ${careersBg.cardInner} border ${careersBorder.subtle} rounded-lg p-5 flex flex-col gap-4 hover:border-[#52525b] transition-colors`}
    >
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br ${gradient} shadow-lg`}
      >
        <Icon size={18} className="text-white" aria-hidden />
      </span>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className={`text-base font-medium ${careersText.white}`}>{route.title}</h3>
          {route.info && <Info size={14} className={careersText.muted} aria-hidden />}
        </div>
        <p className={`text-sm leading-relaxed ${careersText.muted}`}>{route.description}</p>
      </div>
      <div className={`mt-auto pt-4 border-t ${careersBorder.subtle} flex items-center justify-between`}>
        <span className={`text-sm ${careersText.body}`}>{route.email}</span>
        <ArrowUpRight
          size={16}
          className={`${careersText.muted} group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all`}
          aria-hidden
        />
      </div>
    </button>
  )
}

export default function ContactRoutes({ data }: { data?: RoutesData }): JSX.Element | null {
  const routes = data?.items ?? []
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (routes.length === 0) return null

  const selected = routes[selectedIndex] ?? routes[0]

  return (
    <Motion
      tag="section"
      id="routes"
      className={`${careersBg.card} border ${careersBorder.subtle} rounded-lg p-6 md:p-10 space-y-10`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="space-y-3">
        <h2
          className={`text-2xl md:text-3xl font-semibold ${careersText.white} tracking-tight leading-tight whitespace-pre-line`}
        >
          {data?.heading}
        </h2>
        <p className={`text-sm md:text-base ${careersText.muted} max-w-2xl`}>{data?.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route, i) => (
          <RouteCard key={route.id ?? i} route={route} index={i} onSelect={() => setSelectedIndex(i)} />
        ))}
      </div>

      {/* Selected route summary — updates as you pick a card above. */}
      <Motion
        className={`${careersBg.cardInner} border ${careersBorder.subtle} rounded-lg grid grid-cols-1 lg:grid-cols-3 overflow-hidden`}
        {...motionBlockProps}
      >
        {/* Left — gradient summary */}
        <div className="relative p-6 bg-linear-to-br from-[#7c3aed] via-[#6d28d9] to-[#4c1d95] min-h-[160px] flex flex-col justify-between">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <span className="relative text-xs uppercase tracking-wider text-white/70">Selected route</span>
          <div className="relative space-y-1">
            <p className="text-xl font-semibold text-white">{selected.title}</p>
            <p className="text-sm text-white/80">{selected.replyWindow}</p>
          </div>
        </div>

        {/* Middle — best for */}
        <div className="p-6 space-y-3">
          <span className={`text-xs uppercase tracking-wider ${careersText.muted}`}>Best for</span>
          <ul className="space-y-2">
            {(selected.bestFor ?? []).map((entry, i) => (
              <li key={entry.id ?? i} className={`flex items-start gap-2 text-sm ${careersText.body}`}>
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#757571] shrink-0" aria-hidden />
                {entry.item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — reach the owner */}
        <div className="p-6 space-y-3">
          <span className={`text-xs uppercase tracking-wider ${careersText.muted}`}>Reach the owner</span>
          <div
            className={`flex items-center gap-2 ${careersBg.card} border ${careersBorder.input} rounded-lg px-3 py-2`}
          >
            <span className={`text-sm ${careersText.body} truncate`}>{selected.email}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${selected.email ?? ''}`}
              className={`inline-flex items-center gap-2 ${careersBg.button} ${careersBg.buttonHover} ${careersText.onLight} text-sm font-medium px-4 py-2 rounded-lg transition-colors`}
            >
              {selected.cta}
              <ArrowRight size={15} aria-hidden />
            </a>
            <button
              type="button"
              className={`${careersBg.card} border ${careersBorder.input} ${careersText.body} text-sm font-medium px-4 py-2 rounded-lg hover:border-[#52525b] transition-colors`}
            >
              Learn more
            </button>
          </div>
        </div>
      </Motion>
    </Motion>
  )
}
