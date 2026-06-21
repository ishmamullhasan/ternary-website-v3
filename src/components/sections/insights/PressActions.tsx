'use client'

import { Check, Printer, Share2 } from 'lucide-react'
import { useState } from 'react'

/**
 * Sub-nav actions for a press release: Share (copy permalink with success feedback) and
 * Print (window.print()). Client component because both touch browser APIs. Buttons carry
 * focus-visible rings; share announces success via aria-live. The print stylesheet lives in
 * the page via a `print:` utility pass on the layout containers.
 */
export default function PressActions({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    // Prefer the native share sheet where available, else copy the permalink.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ url })
        return
      } catch {
        // user dismissed or unsupported — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const btn =
    'inline-flex items-center gap-2 rounded-full border border-subtle px-3.5 py-1.5 text-[14px] text-subtle transition-colors hover:border-cream/40 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70'

  return (
    <div className="flex items-center gap-5 print:hidden">
      <button type="button" onClick={handleShare} className={btn} aria-live="polite">
        {copied ? <Check size={14} /> : <Share2 size={14} />}
        {copied ? 'Link copied' : 'Share'}
      </button>
      <button type="button" onClick={() => window.print()} className={btn}>
        <Printer size={14} />
        Print
      </button>
    </div>
  )
}
