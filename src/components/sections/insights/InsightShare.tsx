'use client'

import { useState } from 'react'

interface InsightShareProps {
  url: string
  title?: string | null
}

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

  return (
    <div className="bg-[#1B1A17] rounded-lg p-5 flex flex-col gap-3">
      <p className="text-xs text-[#757571]">Share</p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="text-sm text-[#D5D5D5] hover:text-white transition-colors text-left"
        >
          {copied ? 'Link copied' : 'Copy link'}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${shareTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#D5D5D5] hover:text-white transition-colors"
        >
          Post on X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#D5D5D5] hover:text-white transition-colors"
        >
          Share to LinkedIn
        </a>
      </div>
    </div>
  )
}
