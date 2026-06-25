'use client'

import Motion from '@/components/animation/motion'
import type { ContactRoutesBlock } from '@/payload-types'
import {
  ArrowUpRight,
  Briefcase,
  Handshake,
  Info,
  Mail,
  MessageCircle,
  Newspaper,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { JSX } from 'react'
import { useState } from 'react'

type RoutesData = ContactRoutesBlock
type RouteItem = NonNullable<RoutesData['items']>[number]

// Icon + content-type gradient are fixed in code and matched to CMS routes by position.
// Six routes per design: New business · Partnerships · Press & analysts · Careers · General · Security.
const ICONS: LucideIcon[] = [Briefcase, Handshake, Newspaper, Briefcase, MessageCircle, ShieldCheck]

// Signature radial gradients keyed to content-type (matches heroFeatured TONE language). The grain
// overlay sits on top in code, so these render identically regardless of media availability.
const TONE: string[] = [
  'radial-gradient(135% 135% at 18% 12%, #c1285f 0%, #6d1734 42%, #1d0a14 100%)', // crimson — new business
  'radial-gradient(135% 135% at 22% 14%, #1f9d6b 0%, #0f5a3d 44%, #07211a 100%)', // emerald — partnerships
  'radial-gradient(135% 135% at 20% 12%, #b6249a 0%, #5e1457 44%, #190a1c 100%)', // magenta — press
  'radial-gradient(135% 135% at 22% 14%, #4f6bed 0%, #25307e 44%, #0c1030 100%)', // indigo — careers
  'radial-gradient(135% 135% at 22% 14%, #2f93da 0%, #134a78 44%, #08233c 100%)', // azure — general
  'radial-gradient(135% 135% at 22% 14%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)', // violet — security
]

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-main'

// A small gradient icon tile carrying the signature grain overlay.
function IconTile({ icon: Icon, tone }: { icon: LucideIcon; tone: string }): JSX.Element {
  return (
    <span className="relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: tone }} />
      <span
        aria-hidden
        className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:120px] opacity-[0.18] mix-blend-overlay"
      />
      <Icon size={17} className="relative text-cream" aria-hidden />
    </span>
  )
}

function RouteCard({
  route,
  index,
  selected,
  onSelect,
}: {
  route: RouteItem
  index: number
  selected: boolean
  onSelect: () => void
}): JSX.Element {
  const Icon = ICONS[index % ICONS.length]
  const tone = TONE[index % TONE.length]
  return (
    <Motion
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.05, 0.3) }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`group flex h-full w-full flex-col gap-3 rounded-sm bg-ink p-6 text-left transition-[background-color,transform] duration-300 ${focusRing} ${
          selected ? 'ring-1 ring-inset ring-cream/40' : 'hover:bg-[#151414]'
        }`}
      >
        <IconTile icon={Icon} tone={tone} />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-medium tracking-[-0.05em] text-cream">{route.title}</h3>
            {route.info && <Info size={14} className="text-subtle" aria-hidden />}
          </div>
          <p className="text-[14px] leading-snug tracking-[-0.05em] text-body">{route.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-[12px] tracking-[-0.05em] text-cream">{route.email}</span>
          <ArrowUpRight
            size={16}
            className={`transition-all duration-300 ${
              selected
                ? 'text-cream'
                : 'text-subtle group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cream'
            }`}
            aria-hidden
          />
        </div>
      </button>
    </Motion>
  )
}

export default function ContactRoutes({ data }: { data?: RoutesData }): JSX.Element | null {
  const routes = data?.items ?? []
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (routes.length === 0) return null

  const selected = routes[selectedIndex] ?? routes[0]
  const selectedTone = TONE[selectedIndex % TONE.length]
  const mailHref = selected.email ? `mailto:${selected.email}` : '#message'

  return (
    <Motion
      tag="section"
      id="routes"
      className="space-y-8 rounded-md bg-main px-6 py-10 lg:px-9 lg:py-12"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="max-w-3xl space-y-4">
        <h2 className="font-display text-[30px] font-medium leading-[1.15] tracking-[-0.05em] whitespace-pre-line text-cream">
          {data?.heading}
        </h2>
        <p className="max-w-2xl text-[15px] leading-snug tracking-[-0.05em] text-body md:text-[16px]">
          {data?.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route, i) => (
          <RouteCard
            key={route.id ?? i}
            route={route}
            index={i}
            selected={i === selectedIndex}
            onSelect={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      {/* Selected route summary — updates as you pick a card above. */}
      <Motion
        key={selectedIndex}
        className="grid grid-cols-1 overflow-hidden rounded-sm bg-ink lg:grid-cols-[412px_1fr]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        aria-live="polite"
      >
        {/* Left — signature noise gradient summary (412px) */}
        <div className="relative flex min-h-[188px] flex-col justify-between overflow-hidden p-8">
          <span aria-hidden className="absolute inset-0" style={{ backgroundImage: selectedTone }} />
          <span
            aria-hidden
            className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:220px] opacity-[0.16] mix-blend-overlay"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45" />
          <span className="relative text-[12px] tracking-[-0.05em] text-cream/75">Selected route</span>
          <div className="relative space-y-2">
            <p className="font-display text-[24px] font-medium leading-[1.15] tracking-[-0.05em] text-cream">
              {selected.title}
            </p>
            {selected.replyWindow && (
              <p className="text-[16px] tracking-[-0.05em] text-cream/80">{selected.replyWindow}</p>
            )}
          </div>
        </div>

        {/* Right — best for / reach the owner (996px) */}
        <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
          {/* Best for */}
          <div className="space-y-4">
            <span className="text-[12px] tracking-[-0.05em] text-body">Best for</span>
            <ul className="space-y-2">
              {(selected.bestFor ?? []).map((entry, i) => (
                <li key={entry.id ?? i} className="flex items-start gap-2 text-[16px] tracking-[-0.05em] text-body">
                  <span className="mt-[7px] size-1 shrink-0 rounded-full bg-body" aria-hidden />
                  {entry.item}
                </li>
              ))}
            </ul>
          </div>

          {/* Reach the owner */}
          <div className="space-y-4">
            <span className="text-[12px] tracking-[-0.05em] text-body">Reach the owner</span>
            <div className="space-y-3 rounded-sm bg-card p-3">
              <div className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-cream" aria-hidden />
                <span className="truncate text-[16px] tracking-[-0.05em] text-cream">{selected.email}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={mailHref}
                  className={`group inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-cream px-6 text-[15px] text-ink transition-colors hover:bg-cream-hover ${focusRing}`}
                >
                  {selected.cta || 'Start an engagement'}
                  <ArrowUpRight
                    size={15}
                    strokeWidth={2.5}
                    aria-hidden
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
                <a
                  href="#message"
                  className={`inline-flex h-10 items-center rounded-lg bg-button-dark px-6 text-[15px] text-cream/90 transition-colors hover:text-cream ${focusRing}`}
                >
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </div>
      </Motion>
    </Motion>
  )
}
