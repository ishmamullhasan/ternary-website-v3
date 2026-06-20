/**
 * Canonical reveal/motion factories shared across the redesign.
 *
 * Extracted verbatim from the per-content slug pages (insights/capabilities/solutions/
 * industries/press-release) and StoryDetail, which each declared identical copies. Import
 * these so every surface animates with the same quiet upward fade and stagger curve. Motion
 * already honors prefers-reduced-motion, so no extra gating is needed at the call site.
 */

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Shared reveal — quiet upward fade, fires once. Motion already honors prefers-reduced-motion.
export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' } as const,
  transition: { duration: 0.6, ease: EASE },
}

export const revealItem = (index: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' } as const,
  transition: { duration: 0.55, ease: EASE, delay: Math.min(index * 0.06, 0.42) },
})
