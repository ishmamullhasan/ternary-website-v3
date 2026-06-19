'use client'

import { getClientSideURL } from '@/utilities/getURL'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import type { JSX } from 'react'

// Leaf client component (WEB-449): listens for Payload live-preview `postMessage` updates and
// refreshes the current route so the iframe reflects unpublished edits in real time. Rendered
// only when draft mode is enabled (see the [locale] layout) — the surrounding layout stays a
// server component, this is the single client leaf.
export const LivePreviewListener = (): JSX.Element => {
  const router = useRouter()
  return <PayloadLivePreview refresh={router.refresh} serverURL={getClientSideURL()} />
}

export default LivePreviewListener
