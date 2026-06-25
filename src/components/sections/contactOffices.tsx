'use client'

import Motion from '@/components/animation/motion'
import type { ContactOfficesBlock } from '@/payload-types'
import { ChevronLeft, ChevronRight, Clock, Mail, MapPin, Phone, type LucideIcon } from 'lucide-react'
import type { JSX, KeyboardEvent } from 'react'
import { useState } from 'react'

type OfficesData = ContactOfficesBlock

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Per-office gradient so each studio reads as a distinct map surface (azure/violet alternating).
// The signature grain sits on top — no external map asset, degrades to the gradient gracefully.
const TONE: string[] = [
  'radial-gradient(120% 120% at 30% 20%, #2f93da 0%, #134a78 46%, #08233c 100%)',
  'radial-gradient(120% 120% at 70% 25%, #7c3aed 0%, #3a1c8c 46%, #140f2c 100%)',
]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-card'

// One labelled detail column (icon + caption label, then the value(s)). `accent` lifts the value to
// cream for the contact channels (email/phone), matching the comp's text/primary on those fields.
function Detail({
  icon: Icon,
  label,
  accent,
  children,
}: {
  icon: LucideIcon
  label: string
  accent?: boolean
  children: JSX.Element | string | JSX.Element[]
}): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[12px] tracking-[-0.05em] text-subtle">
        <Icon size={12} aria-hidden />
        {label}
      </div>
      <div className={`text-[16px] leading-snug tracking-[-0.05em] ${accent ? 'text-cream' : 'text-body'}`}>
        {children}
      </div>
    </div>
  )
}

// Small eggshell square nav button (Figma 1528:6628 / 1516:5482).
function NavButton({ dir, onClick, label }: { dir: 'prev' | 'next'; onClick: () => void; label: string }): JSX.Element {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex size-8 shrink-0 items-center justify-center self-end rounded-sm bg-cream text-ink transition-colors hover:bg-cream-hover ${focusRing}`}
    >
      <Icon size={16} aria-hidden />
    </button>
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
  const addressLines = (office.address ?? []).filter((a) => a.line?.trim())

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
      <div className="max-w-2xl space-y-4">
        <h2 className="font-display text-[30px] font-medium leading-[1.15] tracking-[-0.05em] text-cream">
          {data?.heading}
        </h2>
        <p className="text-[15px] leading-snug tracking-[-0.05em] text-body md:text-[16px]">{data?.description}</p>
      </div>

      {/* Map surface — signature gradient + grain (graceful fallback for the map asset) with the
          office card floating at the bottom, matching Figma 1516:5470. */}
      <div
        className="relative flex h-[460px] items-end justify-center overflow-hidden rounded-md p-4 sm:h-[560px] lg:h-[660px] lg:p-8"
        role={multiple ? 'group' : undefined}
        aria-roledescription={multiple ? 'carousel' : undefined}
        aria-label={multiple ? 'Office locations' : undefined}
        tabIndex={multiple ? 0 : undefined}
        onKeyDown={onKeyDown}
      >
        <Motion
          key={`surface-${index}`}
          className="absolute inset-0"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span aria-hidden className="absolute inset-0" style={{ backgroundImage: tone }} />
          <span
            aria-hidden
            className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:260px] opacity-[0.14] mix-blend-overlay"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <span className="absolute left-1/2 top-1/2 inline-flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream/95 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)]">
            <MapPin size={22} className="text-ink" aria-hidden />
          </span>
        </Motion>

        {/* Floating office card */}
        <Motion
          key={office.city ?? index}
          className="relative flex w-full items-stretch gap-3 rounded-md bg-card p-4 lg:gap-6 lg:p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          aria-live="polite"
        >
          {multiple && <NavButton dir="prev" onClick={() => go(-1)} label="Previous office" />}

          <div className="flex flex-1 flex-col gap-4 px-1 lg:px-4">
            {/* Heading group */}
            <div className="flex flex-col gap-2">
              {office.tag && <p className="text-[16px] tracking-[-0.05em] text-subtle">{office.tag}</p>}
              <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                <h3 className="font-display text-[24px] font-medium leading-[1.15] tracking-[-0.05em] text-cream">
                  {office.city}
                </h3>
                {office.timezone && (
                  <span className="pb-1 text-[12px] tracking-[-0.05em] text-subtle">{office.timezone}</span>
                )}
              </div>
            </div>

            {/* Detail columns */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
              {addressLines.length > 0 && (
                <Detail icon={MapPin} label="Address">
                  {addressLines.map((entry, i) => (
                    <span key={entry.id ?? i} className="block">
                      {entry.line}
                    </span>
                  ))}
                </Detail>
              )}
              {office.hours && (
                <Detail icon={Clock} label="Hours">
                  {office.hours}
                </Detail>
              )}
              {office.email && (
                <Detail icon={Mail} label="Email" accent>
                  <a
                    href={`mailto:${office.email}`}
                    className={`break-all transition-colors hover:text-cream-hover ${focusRing} rounded-sm`}
                  >
                    {office.email}
                  </a>
                </Detail>
              )}
              {office.phone && (
                <Detail icon={Phone} label="Phone" accent>
                  <a
                    href={`tel:${phoneHref}`}
                    className={`transition-colors hover:text-cream-hover ${focusRing} rounded-sm`}
                  >
                    {office.phone}
                  </a>
                </Detail>
              )}
            </div>
          </div>

          {multiple && <NavButton dir="next" onClick={() => go(1)} label="Next office" />}
        </Motion>
      </div>
    </Motion>
  )
}
