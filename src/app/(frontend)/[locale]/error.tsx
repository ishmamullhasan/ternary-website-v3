'use client' // Error boundaries must be Client Components (Next requirement).

import ErrorComp from '@/components/sections/errorComp'

// Catches uncaught exceptions thrown by any page or nested layout BELOW this segment. It does not
// catch errors thrown by [locale]/layout.tsx itself — an error boundary never wraps the layout in
// its own segment. That case (and anything in the root shell) is handled by src/app/global-error.tsx.
//
// Because this sits inside [locale]/layout.tsx, the header, <main>, and footer still render around
// the error UI — the page fails, the site chrome does not.
export default function Error({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string }
  // Next 16.2 introduced `unstable_retry` (re-fetches AND re-renders the failed segment) and demoted
  // `reset` (re-renders only). Accept both so this keeps working either side of that rename.
  unstable_retry?: () => void
  reset?: () => void
}) {
  return <ErrorComp error={error} retry={() => (unstable_retry ?? reset ?? (() => {}))()} />
}
