'use client'

import Motion from '@/components/animation/motion'
import { careersBg, careersBorder, careersText } from '@/lib/careers-colors'
import type { ContactPage } from '@/payload-types'
import { ChevronLeft, ChevronRight, Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { JSX } from 'react'
import { useState } from 'react'

type OfficesData = NonNullable<ContactPage['offices']>

const motionSectionProps = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin
  label: string
  children: JSX.Element | string | JSX.Element[]
}): JSX.Element {
  return (
    <div className="space-y-1">
      <div className={`flex items-center gap-1.5 text-xs ${careersText.muted}`}>
        <Icon size={13} aria-hidden />
        {label}
      </div>
      <div className={`text-sm ${careersText.body}`}>{children}</div>
    </div>
  )
}

export default function ContactOffices({ data }: { data?: OfficesData }): JSX.Element | null {
  const offices = data?.items ?? []
  const [index, setIndex] = useState(0)

  if (offices.length === 0) return null

  const office = offices[index] ?? offices[0]
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + offices.length) % offices.length)
  const phoneHref = (office.phone ?? '').replace(/[^\d+]/g, '')

  return (
    <Motion tag="section" id="offices" className="space-y-8" {...motionSectionProps}>
      <div className="space-y-3">
        <h2 className={`text-2xl md:text-3xl font-semibold ${careersText.white} tracking-tight`}>{data?.heading}</h2>
        <p className={`text-sm md:text-base ${careersText.muted} max-w-2xl`}>{data?.description}</p>
      </div>

      <div className={`relative rounded-lg overflow-hidden border ${careersBorder.subtle}`}>
        {/* Map placeholder — image not wired yet. */}
        <div className="relative h-[360px] md:h-[460px] bg-[#0F0E0E]">
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                'linear-gradient(#52525b 1px, transparent 1px), linear-gradient(90deg, #52525b 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-[#7c3aed] to-[#4c1d95] shadow-xl">
              <MapPin size={22} className="text-white" aria-hidden />
            </span>
          </div>
        </div>

        {/* Office card overlay */}
        <Motion
          key={office.city ?? index}
          className={`absolute inset-x-3 bottom-3 md:inset-x-6 md:bottom-6 ${careersBg.card}/95 backdrop-blur border ${careersBorder.subtle} rounded-lg p-5 md:p-6`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className={`text-xs ${careersText.muted}`}>{office.tag}</p>
              <div className="flex items-center gap-3">
                <h3 className={`text-lg font-semibold ${careersText.white}`}>{office.city}</h3>
                <span
                  className={`${careersBg.badge} ${careersText.muted} text-[11px] px-2 py-0.5 rounded-full border ${careersBorder.subtle}`}
                >
                  {office.timezone}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous office"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${careersBg.cardInner} border ${careersBorder.input} ${careersText.body} hover:border-[#52525b] transition-colors`}
              >
                <ChevronLeft size={16} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next office"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${careersBg.cardInner} border ${careersBorder.input} ${careersText.body} hover:border-[#52525b] transition-colors`}
              >
                <ChevronRight size={16} aria-hidden />
              </button>
            </div>
          </div>

          <div className={`mt-5 pt-5 border-t ${careersBorder.subtle} grid grid-cols-2 lg:grid-cols-4 gap-5`}>
            <Detail icon={MapPin} label="Address">
              {(office.address ?? []).map((entry, i) => (
                <span key={entry.id ?? i} className="block">
                  {entry.line}
                </span>
              ))}
            </Detail>
            <Detail icon={Clock} label="Hours">
              {office.hours ?? ''}
            </Detail>
            <Detail icon={Mail} label="Email">
              <a href={`mailto:${office.email ?? ''}`} className="hover:text-white transition-colors break-all">
                {office.email}
              </a>
            </Detail>
            <Detail icon={Phone} label="Phone">
              <a href={`tel:${phoneHref}`} className="hover:text-white transition-colors">
                {office.phone}
              </a>
            </Detail>
          </div>
        </Motion>
      </div>
    </Motion>
  )
}
