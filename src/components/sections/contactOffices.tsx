'use client'

import Motion from '@/components/animation/motion'
import type { ContactOfficesBlock } from '@/payload-types'
import { ChevronLeft, ChevronRight, Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { JSX, KeyboardEvent } from 'react'
import { useState } from 'react'

type OfficesData = ContactOfficesBlock

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Per-office gradient so each studio reads as a distinct surface (azure/violet alternating). The
// signature grain sits on top — no external map asset, degrades to the gradient gracefully.
const TONE: string[] = [
  'radial-gradient(120% 120% at 30% 20%, #2f93da 0%, #134a78 46%, #08233c 100%)',
  'radial-gradient(120% 120% at 70% 25%, #7c3aed 0%, #3a1c8c 46%, #140f2c 100%)',
]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

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
      <div className="flex items-center gap-1.5 text-[12px] text-subtle">
        <Icon size={13} aria-hidden />
        {label}
      </div>
      <div className="text-[14px] text-body">{children}</div>
    </div>
  )
}

export default function ContactOffices({ data }: { data?: OfficesData }): JSX.Element | null {
  const offices = data?.items ?? []
  const [index, setIndex] = useState(0)

  if (offices.length === 0) return null

  const office = offices[index] ?? offices[0]
  const multiple = offices.length > 1
  const tone = TONE[index % TONE.length]
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + offices.length) % offices.length)
  const phoneHref = (office.phone ?? '').replace(/[^\d+]/g, '')

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!multiple) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    }
  }

  return (
    <Motion
      tag="section"
      id="offices"
      className="space-y-8"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="max-w-2xl space-y-3">
        <h2 className="font-display text-[30px] font-medium leading-tight tracking-[-0.04em] text-cream">
          {data?.heading}
        </h2>
        <p className="text-[15px] leading-relaxed text-body md:text-[16px]">{data?.description}</p>
      </div>

      <div
        className="relative flex flex-col overflow-hidden rounded-md border border-line"
        role={multiple ? 'group' : undefined}
        aria-roledescription={multiple ? 'carousel' : undefined}
        aria-label={multiple ? 'Office locations' : undefined}
        tabIndex={multiple ? 0 : undefined}
        onKeyDown={onKeyDown}
      >
        {/* Studio surface — signature gradient + grain. No external map dependency; this is the
            graceful fallback when a map/photo asset is unavailable. Full-bleed framing. */}
        <Motion
          key={`surface-${index}`}
          className="relative h-[380px] md:h-[520px] lg:h-[480px]"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span aria-hidden className="absolute inset-0" style={{ backgroundImage: tone }} />
          <span
            aria-hidden
            className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:260px] opacity-[0.14] mix-blend-overlay"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-cream/95 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)]">
              <MapPin size={22} className="text-ink" aria-hidden />
            </span>
          </div>
        </Motion>

        {/* Office detail bar — full-width, flush to the bottom edge, square top corners, top border only. */}
        <Motion
          key={office.city ?? index}
          className="relative flex items-stretch border-t border-line bg-ink"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          aria-live="polite"
        >
          {/* Far-left previous arrow */}
          {multiple && (
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous office"
              className={`flex shrink-0 items-center justify-center self-stretch border-r border-line px-4 text-body transition-colors hover:bg-main hover:text-cream ${focusRing}`}
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
          )}

          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                {office.tag && <p className="text-[12px] text-subtle">{office.tag}</p>}
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-[24px] font-medium leading-tight text-cream">{office.city}</h3>
                  {office.timezone && <span className="text-[12px] text-subtle">{office.timezone}</span>}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
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
                <a
                  href={`mailto:${office.email ?? ''}`}
                  className={`break-all transition-colors hover:text-cream ${focusRing} rounded-sm`}
                >
                  {office.email}
                </a>
              </Detail>
              <Detail icon={Phone} label="Phone">
                <a href={`tel:${phoneHref}`} className={`transition-colors hover:text-cream ${focusRing} rounded-sm`}>
                  {office.phone}
                </a>
              </Detail>
            </div>

            {/* Slide indicators */}
            {multiple && (
              <div className="mt-6 flex items-center gap-2">
                {offices.map((o, i) => (
                  <button
                    key={o.id ?? i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show ${o.city ?? `office ${i + 1}`}`}
                    aria-current={i === index ? 'true' : undefined}
                    className={`h-1.5 rounded-full transition-all duration-300 ${focusRing} ${
                      i === index ? 'w-6 bg-cream' : 'w-1.5 bg-line-strong hover:bg-subtle'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Far-right next arrow */}
          {multiple && (
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next office"
              className={`flex shrink-0 items-center justify-center self-stretch border-l border-line px-4 text-body transition-colors hover:bg-main hover:text-cream ${focusRing}`}
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          )}
        </Motion>
      </div>
    </Motion>
  )
}
