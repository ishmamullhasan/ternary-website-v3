import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutThesisBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * SCENE 02 — "Our thesis". WHITE ground, typography-led.
 *
 * REMOVED ENTIRELY: the floating-circle network. Successive versions of this scene put curves
 * and nodes near the copy, and even confined to a side canvas it was decoration competing with
 * the writing. There is no node system here at all now — one thin black rule crosses the section
 * and a single small green indicator travels it as the slides change. Nothing else moves except
 * the type.
 *
 * COMPOSITION: "Our thesis" is anchored small at the upper left; the active statement is set
 * large and ranged right, with its description directly beneath it and six markers below that.
 * One statement is visible at a time on desktop.
 *
 * RESPONSIVE: below 900px there is no pin — all six are large editorial blocks in normal flow.
 *
 * CONTENT: every heading, title and excerpt is the CMS string, unchanged.
 */
export function AboutThesisComponent({ heading, description, items }: AboutThesisBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  return (
    <section
      data-scene="thesis"
      className="ax-white ax-scene relative isolate w-full overflow-hidden px-5 py-24 md:px-10 lg:px-16 lg:py-0"
    >
      {/* The incoming white ground sweeps up over the black hero. */}
      <span aria-hidden data-ax="wipe" data-wipe="disc" className="ax-wipe ax-wipe-white" />

      <div className="ax-above mx-auto flex w-full max-w-[1400px] flex-col justify-center lg:min-h-[100svh]">
        {/* Anchored small, upper left. */}
        <div className="flex flex-col gap-4">
          <h2 className="ax-label" data-ax="th-title">
            {heading}
          </h2>
          {description ? (
            <div className="ax-copy" data-ax="th-intro">
              <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-inherit" />
            </div>
          ) : null}
        </div>

        {/* The statement. Ranged right on desktop so the eye travels from the small anchor
            across the section to the argument. */}
        <div className="ax-th-stack mt-14 lg:mt-20 lg:text-right">
          {items.map((item, index) => (
            <article key={item.id ?? `thesis-${index}`} className="ax-th-slide" data-th-slide={index}>
              <span aria-hidden className="ax-label block">
                {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
              {item.title ? (
                <h3 className="ax-hx-sm ax-h mt-5 lg:ml-auto lg:max-w-[16ch]">
                  <span data-th-head className="block">
                    {item.title}
                  </span>
                </h3>
              ) : null}
              {item.excerpt ? (
                <p className="ax-copy mt-6 lg:ml-auto" data-th-desc>
                  {item.excerpt}
                </p>
              ) : null}
            </article>
          ))}
        </div>

        {/* The rule, and the one indicator that travels it. This is the section's entire
            decorative vocabulary. */}
        <div className="relative mt-14 lg:mt-20">
          <span aria-hidden data-ax="th-rule" className="ax-hair block" />
          <span
            aria-hidden
            data-ax="th-marker"
            className="absolute top-1/2 left-0 block h-2 w-2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: '#090909' }}
          />
        </div>

        <div aria-hidden className="ax-th-dots mt-8">
          {items.map((_, i) => (
            <span key={i} className="ax-th-dot" data-th-dot={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
