import type { ComponentPropsWithoutRef } from 'react'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

type HeadingProps = ComponentPropsWithoutRef<'h2'> & {
  /**
   * The semantic outline depth. This is independent of visual size — style with `className`.
   *
   * Site convention (blocks render as a flat, non-nested list, so these never shift):
   *   1 — the page's single <h1>: a hero block, or the page shell on detail routes
   *   2 — a block's own section heading
   *   3 — headings of repeated items *inside* a block (cards, panels, list rows)
   *   4 — anything nested below those
   *
   * Because every block opens at level 2 and steps down internally, reordering blocks in the CMS
   * can never introduce a skipped level (WCAG 2.2 SC 1.3.1).
   */
  level: HeadingLevel
}

/**
 * Renders the heading tag for a semantic level.
 *
 * Deliberately takes an explicit `level` rather than reading a React context: the blocks that
 * consume this are Server Components, which cannot subscribe to context. A context-based version
 * would have to be a Client Component, turning every heading on the site into a client island —
 * to model a nesting depth that does not exist, since `RenderBlocks` maps blocks as flat siblings.
 *
 * Keeping it as one component (rather than bare tags) gives CI a single place to enforce heading
 * policy and makes an incorrect level visible in review as data, not markup.
 */
export function Heading({ level, className, children, ...rest }: HeadingProps) {
  const Tag = `h${level}` as const
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  )
}

export default Heading
