import AboutMotion from '@/components/about/AboutMotion'
import MaskText from '@/components/about/MaskText'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { HeroBlock } from '@/payload-types'
import type { CSSProperties, JSX } from 'react'

/**
 * The About page's opening statement — an About-only treatment of the shared `hero` block.
 *
 * The shared HeroComponent centres a 2.5rem headline in a short band, which is the right
 * neutral for six hub pages and the wrong opening for a page that then runs as an editorial
 * sequence. This sets the page's register instead: the sentence typeset large and ranged left,
 * rising out of its own line box, with the standfirst dropped to the opposite corner and a rule
 * drawn between them.
 *
 * SCOPE: reached only when the page slug is `about` (see RenderBlocks). Every other page using
 * `hero` renders the shared component byte-for-byte as before.
 *
 * CONTENT: `heading` and `description` verbatim from the CMS. No word is added here — the
 * redesign is composition, type and motion only.
 */
export function AboutEditorialHero({ heading, description }: HeroBlock): JSX.Element {
  return (
    <AboutMotion tag="section" className="w-full pt-4 pb-2 lg:pt-6 lg:pb-8">
      <div className="flex flex-col gap-10 lg:gap-14">
        {heading ? (
          // The page's single <h1>. Ranged left and set to fill the measure — the sentence is
          // the composition, so it is given the room to be one.
          <h1 className="font-display max-w-[19ch] text-[clamp(2.25rem,6.4vw,4.75rem)] leading-[1.02] font-medium tracking-[-0.045em] text-cream text-balance">
            <MaskText>{heading}</MaskText>
          </h1>
        ) : null}

        {/* Draws left-to-right as the page opens: the rule that separates the headline from its
            standfirst, arriving rather than simply being there. Full width, so it reads as the
            page's opening rule rather than as a stray underline beside the text. */}
        <span
          aria-hidden
          className="am-rule h-px w-full bg-line-strong"
          style={{ '--am-d': '0.28s' } as CSSProperties}
        />

        {description ? (
          // Indented to the right on lg — the standfirst answers the headline rather than
          // sitting under it — but ranged LEFT. Right-ranging five lines of body copy gives a
          // ragged left edge the eye has to re-find on every line.
          <div
            className="am-r max-w-[62ch] lg:ml-auto lg:w-[58%]"
            style={{ '--am-d': '0.36s' } as CSSProperties}
          >
            <RichTextComp
              content={description as RichText}
              className="prose-p:mb-0 prose-p:text-[17px] prose-p:leading-[1.55] prose-p:tracking-[-0.01em] prose-p:text-body"
            />
          </div>
        ) : null}
      </div>
    </AboutMotion>
  )
}

export default AboutEditorialHero
