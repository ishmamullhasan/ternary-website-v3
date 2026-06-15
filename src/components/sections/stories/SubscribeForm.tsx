'use client'

import { ArrowRight } from 'lucide-react'
import type { JSX } from 'react'

interface SubscribeFormProps {
  emailPlaceholder?: string | null
  buttonLabel?: string | null
}

export default function SubscribeForm({ emailPlaceholder, buttonLabel }: SubscribeFormProps): JSX.Element {
  return (
    <form className="flex flex-col sm:flex-row gap-3 max-w-lg" onSubmit={(event) => event.preventDefault()}>
      <input
        type="email"
        placeholder={emailPlaceholder || 'you@company.com'}
        className="flex-1 h-9 px-4 rounded-lg bg-[#0F0E0E] border border-zinc-800/60 text-sm text-white placeholder:text-[#757571] focus:outline-none focus:border-zinc-600"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 h-9 px-5 rounded-lg bg-[#F4F3EC] text-[#0F0E0E] font-medium text-sm hover:bg-[#E8E7DF] transition-colors"
      >
        {buttonLabel || 'Subscribe'}
        <ArrowRight size={16} />
      </button>
    </form>
  )
}
