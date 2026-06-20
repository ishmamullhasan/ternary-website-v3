'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Owns the floating-pill "liquid glass" nav state (extracted from header.tsx).
 *
 * The bar shrinks (`compact`) only while the user is *actively* scrolling away from the top,
 * then re-expands the moment scrolling stops, or whenever the user is hovering/focusing inside
 * the bar. Concretely:
 *   - `scrolledPast` — past the top threshold (~24px). Used so the bar never compacts at rest.
 *   - a transient `scrolling` flag set on every scroll event and cleared by an idle timeout
 *     (~600ms after the last scroll), giving the "re-expand when scrolling stops" behaviour.
 *   - `interacting` — hover/focus within the bar; while true the bar stays expanded so menus
 *     and the CTA are at full size under the pointer/keyboard.
 *
 * compact = scrolledPast && scrolling && !interacting
 *
 * Listener + timeout are passive and cleaned up on unmount.
 */
export function useNavState() {
  const [scrolledPast, setScrolledPast] = useState(false)
  const [scrolling, setScrolling] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const idleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolledPast(window.scrollY > 24)
      setScrolling(true)
      if (idleTimeout.current) clearTimeout(idleTimeout.current)
      idleTimeout.current = setTimeout(() => setScrolling(false), 600)
    }

    // Seed the resting state on mount (e.g. when navigating back to a scrolled position).
    setScrolledPast(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (idleTimeout.current) clearTimeout(idleTimeout.current)
    }
  }, [])

  const compact = scrolledPast && scrolling && !interacting

  return { compact, scrolledPast, setInteracting }
}
