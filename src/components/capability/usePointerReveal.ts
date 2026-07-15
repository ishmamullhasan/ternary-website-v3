'use client'

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'

/**
 * Feeds the latent-reveal figures (capabilityArt.css / heroIcon.css). It writes the `--cap-*` pointer
 * variables DIRECTLY onto the element and never calls setState — the element must not re-render on
 * pointermove — and coalesces to one write per frame, because pointermove fires far more often than
 * the compositor can use.
 *
 * `cx`/`cy` are the figure's viewBox centre. The pointer is projected through the SVG's screen CTM so
 * the spot lands in user units regardless of how the viewBox is scaled into the card, and its
 * normalised (−1…1) distance from the centre drives the parallax lean (and 04's amplitude scale).
 *
 * The element must contain exactly one `<svg>`; its own class carries the `--cap-*` defaults so a card
 * that has never been hovered — or one rendered on the server — still draws correctly.
 */
export function usePointerReveal<T extends HTMLElement>(cx: number, cy: number) {
  const ref = useRef<T>(null)
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<T>) => {
      const el = ref.current
      if (!el) return

      // Read the pointer position now; by the time the frame runs, the event is recycled.
      const { clientX, clientY } = e

      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const svg = el.querySelector('svg')
        if (!svg) return

        const rect = el.getBoundingClientRect()
        el.style.setProperty('--cap-lx', `${(((clientX - rect.left) / rect.width) * 100).toFixed(1)}%`)
        el.style.setProperty('--cap-ly', `${(((clientY - rect.top) / rect.height) * 100).toFixed(1)}%`)

        // The mask spot lives in the SVG's coordinate space, not the card's, so the pointer has to be
        // projected through the screen CTM. Using the card's percentages here would drift as soon as
        // the card's aspect ratio stopped matching the viewBox — which it does at every breakpoint.
        const ctm = svg.getScreenCTM()
        if (!ctm) return
        const point = svg.createSVGPoint()
        point.x = clientX
        point.y = clientY
        const local = point.matrixTransform(ctm.inverse())

        el.style.setProperty('--cap-px', `${local.x.toFixed(1)}px`)
        el.style.setProperty('--cap-py', `${local.y.toFixed(1)}px`)
        // Normalised to roughly −1…1 about the viewBox centre: the parallax lean reads from these.
        el.style.setProperty('--cap-mx', ((local.x - cx) / cx).toFixed(3))
        el.style.setProperty('--cap-my', ((local.y - cy) / cy).toFixed(3))
        el.style.setProperty('--cap-on', '1')
      })
    },
    [cx, cy],
  )

  const onPointerLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    // Cancel first: a queued frame would otherwise re-light the card after the pointer had gone.
    cancelAnimationFrame(frame.current)
    el.style.setProperty('--cap-on', '0')
    el.style.setProperty('--cap-mx', '0')
    el.style.setProperty('--cap-my', '0')
    el.style.setProperty('--cap-px', `${cx}px`)
    el.style.setProperty('--cap-py', `${cy}px`)
  }, [cx, cy])

  return { ref, onPointerMove, onPointerLeave }
}
