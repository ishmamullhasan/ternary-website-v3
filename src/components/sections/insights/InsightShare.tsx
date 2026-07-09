'use client'

import { Check, Link2, Linkedin, Twitter } from 'lucide-react'
import { useState } from 'react'

interface InsightShareProps {
  url: string
  title?: string | null
}

/**
 * Article share card. Surface/Card (#1b1a17) at radius 4px (rounded-sm), p-16; links are
 * 16px #757571 (Inter) in the design's order: Copy link / Post on X / Share to LinkedIn.
 * Copy-link gives inline "Link copied" feedback; every control carries a focus-visible ring.
 */
export default function InsightShare({ url, title }: InsightShareProps) {
  const [copied, setCopied] = useState(false)
  const shareTitle = encodeURIComponent(title ?? '')

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const linkClass =
    'inline-flex items-center gap-2 rounded-sm text-left text-[16px] leading-[1.15] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70'

  return (
    <div className="flex flex-col gap-4 rounded-sm bg-main p-4">
      <p className="text-[14px] font-bold text-cream">Share</p>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={handleCopyLink} className={linkClass} aria-live="polite">
          {copied ? (
            <Check size={16} className="shrink-0" aria-hidden />
          ) : (
            <Link2 size={16} className="shrink-0" aria-hidden />
          )}
          {copied ? 'Link copied' : 'Copy link'}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${shareTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <Twitter size={16} className="shrink-0" aria-hidden />
          Post on X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <Linkedin size={16} className="shrink-0" aria-hidden />
          Share to LinkedIn
        </a>
      </div>
    </div>
  )
}
