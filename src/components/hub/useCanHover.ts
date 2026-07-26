import { useSyncExternalStore } from 'react'

const QUERY = '(hover: hover) and (pointer: fine)'

/**
 * True when the primary input can hover with a fine pointer (mouse / trackpad); false on touch and
 * during SSR. Read through `useSyncExternalStore` so it needs no mount effect — avoiding the
 * "setState synchronously within an effect" cascade — and stays correct if the input device changes.
 *
 * The hub accordions use this to decide their interaction model: hover-to-open on fine pointers,
 * tap-to-toggle on touch.
 */
export function useCanHover(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(QUERY)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
