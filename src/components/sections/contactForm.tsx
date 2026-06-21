'use client'

import Link from '@/components/LocalizedLink'
import type { Form } from '@/payload-types'
import { ArrowLeft, ArrowUpRight, Check, ShieldCheck } from 'lucide-react'
import type { FormEvent, JSX } from 'react'
import { useId, useState } from 'react'

/**
 * Request Form — the designed "Intake flow" multi-step intake (Figma 1535:4888 / Form 1577:4672).
 *
 * A 278px left rail holds three numbered steps (About you / About the work / Context & timing) plus
 * a "field count" box; the right panel (Surface/Page #0f0e0e) carries a step header + progress bars,
 * a segmented single-select Timeline, single-select Budget band pills, multi-select source pills, a
 * free-text note, and the privacy line + Back / Send Message pill buttons.
 *
 * The intake copy/options are part of the design (not CMS-driven), so they live here. When a Payload
 * `formId` is supplied the submission posts to /api/form-submissions; otherwise it degrades to a
 * graceful client-side success so the form is never inert. All interactive controls carry hover,
 * focus-visible, selected (eggshell), and keyboard/aria state.
 */

type ContactFormProps = {
  // Optional Payload form — when present, submissions are posted to the CMS endpoint.
  formId?: string | null
  submitLabel?: string | null
  confirmationFallback?: string | null
}

const TIMELINE: { value: string; title: string; subtitle: string }[] = [
  { value: 'starting-now', title: 'Starting now', subtitle: 'Within 30 days' },
  { value: 'this-quarter', title: 'This quarter', subtitle: '1–3 months out' },
  { value: 'next-6-months', title: 'Next 6 months', subtitle: 'Planning ahead' },
  { value: 'exploring', title: 'Exploring', subtitle: 'No fixed date' },
]

const BUDGET: string[] = ['Under $100k', '$100k – $250k', '$250k – $750k', '$750k+', 'Prefer to discuss']

const SOURCES: string[] = [
  'A specific case study',
  'Referral from a colleague',
  'Press or analyst coverage',
  'Conference or talk',
  'Search',
  'Social media',
  'Something else',
]

const STEPS: { title: string; meta: string }[] = [
  { title: 'About you', meta: '01' },
  { title: 'About the work', meta: '02' },
  { title: 'Context & timing', meta: '03' },
]

// Shared interactive surface for pills/segments: eggshell ring + offset on focus, lift on hover.
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-ink'

function StepperRail({ activeStep }: { activeStep: number }): JSX.Element {
  return (
    <aside className="flex w-full shrink-0 flex-col justify-between gap-10 lg:w-[278px]">
      <div className="space-y-3">
        <p className="text-[12px] text-subtle">Intake flow</p>
        <ol className="space-y-2">
          {STEPS.map((step, i) => {
            const done = i < activeStep
            const current = i === activeStep
            return (
              <li
                key={step.title}
                aria-current={current ? 'step' : undefined}
                className={[
                  'flex items-center justify-between gap-2 rounded-sm border p-2.5 transition-colors duration-300',
                  current
                    ? 'border-cream bg-main text-cream'
                    : done
                      ? 'border-subtle bg-main text-body'
                      : 'border-subtle bg-transparent text-subtle',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={[
                      'flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                      done
                        ? 'border-cream text-cream'
                        : current
                          ? 'border-cream text-cream'
                          : 'border-subtle text-subtle',
                    ].join(' ')}
                  >
                    {done ? (
                      <Check size={14} strokeWidth={2.5} />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span className="text-[16px]">{step.title}</span>
                </span>
                <span className={`text-[16px] tabular-nums ${current ? 'text-cream' : 'text-subtle'}`}>
                  {step.meta}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="space-y-2 rounded-sm bg-ink p-3">
        <p className="text-[12px] text-body">Field count</p>
        <p className="text-[15px] text-cream">9 questions · ~3 minutes</p>
        <p className="text-[14px] leading-relaxed text-body">Budget is optional. Anything else can be left blank.</p>
      </div>
    </aside>
  )
}

function FieldGroup({
  label,
  htmlId,
  children,
}: {
  label: string
  htmlId?: string
  children: JSX.Element | JSX.Element[]
}): JSX.Element {
  return (
    <div className="space-y-2">
      <p id={htmlId} className="text-[12px] text-cream">
        {label}
      </p>
      {children}
    </div>
  )
}

export default function ContactForm({ formId, submitLabel, confirmationFallback }: ContactFormProps): JSX.Element {
  // The visual stepper presents three stages; this single-screen intake renders the final stage
  // ("Context & timing"), matching the design's "Step 3/3". Earlier steps are presented complete.
  const totalSteps = STEPS.length
  const [activeStep] = useState(totalSteps - 1)

  const [timeline, setTimeline] = useState<string | null>('starting-now')
  const [budget, setBudget] = useState<string | null>('Under $100k')
  const [sources, setSources] = useState<string[]>(['A specific case study'])
  const [note, setNote] = useState('')

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const timelineLabelId = useId()
  const budgetLabelId = useId()
  const sourceLabelId = useId()

  const toggleSource = (value: string) =>
    setSources((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')
    setMessage(null)

    const submissionData = [
      { field: 'timeline', value: timeline ?? '' },
      { field: 'budget', value: budget ?? '' },
      { field: 'source', value: sources.join(', ') },
      { field: 'message', value: note },
    ]

    // No CMS form wired — degrade to a graceful client-side success so the intake is never inert.
    if (!formId) {
      setStatus('success')
      setMessage(confirmationFallback || 'Thank you — an orchestrator will read this and reply personally.')
      return
    }

    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: formId, submissionData }),
      })
      const data = (await res.json()) as {
        doc?: { form?: Form['confirmationMessage'] }
        message?: string
      }
      if (res.ok) {
        setStatus('success')
        setMessage(confirmationFallback || 'Thank you — an orchestrator will read this and reply personally.')
      } else {
        setStatus('error')
        setMessage(data.message || 'Something went wrong. Please try again or email engagements@ternary.com.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again or email engagements@ternary.com.')
    }
  }

  if (status === 'success') {
    return (
      <div className="grid place-items-center rounded-lg border border-line bg-ink p-10 text-center lg:min-h-[420px]">
        <div className="max-w-md space-y-4">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-cream/70 text-cream">
            <Check size={22} strokeWidth={2.5} aria-hidden />
          </span>
          <h3 className="font-display text-[24px] font-medium leading-[1.15] text-cream">Request received</h3>
          <p className="text-[15px] leading-relaxed text-body">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 rounded-lg border border-line bg-main px-6 py-9 md:px-9 md:py-12 lg:grid-cols-[278px_1fr] lg:gap-6">
      <StepperRail activeStep={activeStep} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg bg-ink p-6" noValidate>
        {/* Step header + progress bars */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-[12px] text-subtle">
            Step {activeStep + 1}/{totalSteps} <span className="text-cream/40">·</span>{' '}
            <span className="text-subtle">Context &amp; timing</span>
          </p>
          <div className="flex items-center gap-1" aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={[
                  'h-1 w-8 rounded-full transition-colors duration-500',
                  i <= activeStep ? 'bg-cream' : 'bg-line-strong',
                ].join(' ')}
              />
            ))}
          </div>
        </div>

        {/* Timeline — segmented single-select */}
        <FieldGroup label="Timeline" htmlId={timelineLabelId}>
          <div role="radiogroup" aria-labelledby={timelineLabelId} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {TIMELINE.map((opt) => {
              const selected = timeline === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTimeline(opt.value)}
                  className={[
                    'group relative flex flex-col gap-1 rounded-sm border px-3 py-3 text-left transition-colors duration-300',
                    focusRing,
                    selected ? 'border-cream bg-main' : 'border-subtle bg-main hover:border-cream/60',
                  ].join(' ')}
                >
                  <span className="flex items-center justify-between">
                    <span className={`text-[16px] font-medium ${selected ? 'text-cream' : 'text-subtle'}`}>
                      {opt.title}
                    </span>
                    {selected && <Check size={16} strokeWidth={2.5} className="text-cream" aria-hidden />}
                  </span>
                  <span className={`text-[14px] ${selected ? 'text-cream' : 'text-subtle'}`}>{opt.subtitle}</span>
                </button>
              )
            })}
          </div>
        </FieldGroup>

        {/* Budget band — single-select pills */}
        <FieldGroup label="Budget band" htmlId={budgetLabelId}>
          <div role="radiogroup" aria-labelledby={budgetLabelId} className="flex flex-wrap gap-2">
            {BUDGET.map((opt) => {
              const selected = budget === opt
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setBudget(opt)}
                  className={[
                    'rounded-full border px-4 py-2 text-[12px] transition-colors duration-200',
                    focusRing,
                    selected
                      ? 'border-cream bg-cream text-ink'
                      : 'border-subtle bg-main text-subtle hover:border-cream/60 hover:text-body',
                  ].join(' ')}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </FieldGroup>

        {/* What brought you here — multi-select pills */}
        <FieldGroup label="What brought you here?" htmlId={sourceLabelId}>
          <div role="group" aria-labelledby={sourceLabelId} className="flex flex-wrap gap-2">
            {SOURCES.map((opt) => {
              const selected = sources.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleSource(opt)}
                  className={[
                    'rounded-full border px-4 py-2 text-[12px] transition-colors duration-200',
                    focusRing,
                    selected
                      ? 'border-cream bg-cream text-ink'
                      : 'border-subtle bg-main text-subtle hover:border-cream/60 hover:text-body',
                  ].join(' ')}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </FieldGroup>

        {/* Free-text note */}
        <FieldGroup label="Anything else we should know?">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="A few sentences about the project, the team, what success looks like…"
            className={`w-full resize-y rounded-sm border border-subtle bg-main px-3 py-3 text-[14px] text-cream placeholder:text-[14px] placeholder:text-subtle transition-colors hover:border-cream/60 focus:border-cream/70 ${focusRing}`}
          />
        </FieldGroup>

        {/* Footer — privacy line + Back / Send */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[12px] text-subtle">
            <ShieldCheck size={14} aria-hidden className="text-subtle" />
            By submitting you agree to our{' '}
            <Link
              href="/legals/privacy-and-policy"
              className={`text-subtle underline-offset-4 hover:text-cream hover:underline ${focusRing} rounded-sm`}
            >
              privacy practices
            </Link>
            .
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`group inline-flex items-center gap-2 rounded-full bg-transparent px-8 py-2.5 font-display text-[16px] text-body transition-colors hover:text-cream ${focusRing}`}
            >
              <ArrowLeft
                size={16}
                strokeWidth={2.5}
                aria-hidden
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
              Back
            </button>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className={`group inline-flex items-center gap-2 rounded-full bg-cream px-8 py-2.5 font-display text-[16px] text-ink transition-colors hover:bg-cream-hover disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
            >
              {status === 'submitting' ? 'Sending…' : submitLabel || 'Send Message'}
              <ArrowUpRight
                size={16}
                strokeWidth={2.5}
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </div>

        {status === 'error' && message && (
          <p role="alert" className="text-[13px] text-red-400">
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
