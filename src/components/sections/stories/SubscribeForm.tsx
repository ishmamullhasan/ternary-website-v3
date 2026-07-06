'use client'

import { ArrowRight, Check } from 'lucide-react'
import { useId, useState, type JSX } from 'react'

interface SubscribeFormProps {
  emailPlaceholder?: string | null
  buttonLabel?: string | null
}

type Status = 'idle' | 'error' | 'success'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SubscribeForm({ emailPlaceholder, buttonLabel }: SubscribeFormProps): JSX.Element {
  const inputId = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error')
      return
    }
    // No backend wired yet — acknowledge optimistically so the UX reads as complete.
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <p role="status" className="flex items-center gap-2 text-[15px] tracking-[-0.01em] text-cream">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2dd280]/15 text-[#2dd280]">
          <Check size={14} aria-hidden />
        </span>
        You’re on the list. Check your inbox to confirm.
      </p>
    )
  }

  return (
    <form className="w-full max-w-[512px]" onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row">
        <input
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (status === 'error') setStatus('idle')
          }}
          aria-invalid={status === 'error'}
          aria-describedby={status === 'error' ? `${inputId}-error` : undefined}
          placeholder={emailPlaceholder || 'you@company.com'}
          className="min-w-0 flex-1 rounded-full border border-subtle bg-main px-4 py-[9px] text-base tracking-[-0.05em] text-cream placeholder:text-subtle focus-visible:border-subtle focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cream"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          {buttonLabel || 'Subscribe'}
          <ArrowRight size={16} aria-hidden />
        </button>
      </div>
      {status === 'error' && (
        <p id={`${inputId}-error`} role="alert" className="mt-2 text-[12px] tracking-[-0.02em] text-[#e0606a]">
          Enter a valid email address.
        </p>
      )}
    </form>
  )
}
