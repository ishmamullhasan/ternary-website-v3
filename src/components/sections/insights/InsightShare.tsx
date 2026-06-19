'use client'

import { useState } from 'react'

interface InsightShareProps {
  url: string
  title?: string | null
}

/**
 * Article share card. Surface/Card (#1b1a17) at radius 4px, p-16; links are 16px #757571
 * (Inter, the global default) in the design's order: Copy link / Post on X / Share to LinkedIn.
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
    'rounded-[2px] text-left text-[16px] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70'

  return (
    <div className="flex flex-col gap-3 rounded-[4px] bg-main p-4">
      <p className="text-[12px] uppercase tracking-[0.14em] text-subtle">Share</p>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={handleCopyLink} className={linkClass} aria-live="polite">
          {copied ? 'Link copied' : 'Copy link'}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${shareTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Post on X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Share to LinkedIn
        </a>
      </div>
    </div>
  )
}
