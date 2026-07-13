'use client' // Error boundaries must be Client Components (Next requirement).

import ErrorComp from '@/components/sections/errorComp'
import './(frontend)/globals.css'

// Last-resort boundary: catches errors thrown by the ROOT LAYOUT itself (and anything else no other
// error.tsx wraps). Per Next's rules it REPLACES the root layout when active, so it must ship its
// own <html> and <body> — and consequently there is no header, no footer, and no next/font variables
// here. Type falls back to the ui-sans-serif stack in globals.css, which is correct: at this point
// the layout that would have loaded the fonts is the thing that crashed.
//
// `metadata` exports are not supported in a client boundary, so the tab title is set with React 19's
// hoisted <title>.
//
// Everything below the root layout is caught earlier and more gracefully by
// (frontend)/[locale]/error.tsx, which keeps the site chrome.
export default function GlobalError({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string }
  unstable_retry?: () => void
  reset?: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-page text-cream antialiased">
        <title>Something went wrong</title>
        <ErrorComp error={error} retry={() => (unstable_retry ?? reset ?? (() => {}))()} />
      </body>
    </html>
  )
}
