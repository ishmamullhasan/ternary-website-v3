import AboutScene from '@/components/about/AboutScene'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { Button } from '@/components/ui/button'
import type { CtaBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

/**
 * The About page's closing call — an About-only treatment of the shared `ctaBlock`.
 *
 * SCOPE: reached only when the page slug is `about` (see RenderBlocks). Industries, Scales,
 * Solutions and Capabilities render the shared CtaBlockComponent exactly as before.
 *
 * The shared block and the funding band immediately above it are both full-width panels over
 * imagery, and stacked they read as the same beat played twice. This keeps the horizontal
 * split — statement left, actions right — that the shared block already used, so the two bands
 * differ in composition rather than only in copy: a tall plate with the statement at its foot,
 * then a compact line that asks for the click.
 *
 * CONTENT: heading, description and both button labels come from the CMS unchanged.
 */
export function AboutEditorialCta({
  heading,
  description,
  backgroundImage,
  button_1,
  button_2,
}: CtaBlock): JSX.Element {
  const bgUrl = (backgroundImage as Media)?.url

  return (
    <AboutScene
      tag="section"
      className="relative isolate overflow-hidden rounded-md border border-white/[0.04] px-6 py-12 md:px-10 lg:px-14 lg:py-16"
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: bgUrl
            ? `url(${bgUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1e3a5f 0%, #4c1d95 60%, #2e1065 100%)',
        }}
      />
      {/* The signature grain, and a scrim weighted to the left where the type sits. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/noise.svg')] bg-[length:240px] bg-repeat opacity-[0.15] mix-blend-overlay"
      />
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-page/70 via-page/45 to-transparent" />

      <div className="flex flex-col gap-9 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="flex max-w-[46ch] flex-col gap-3">
          {heading ? (
            <h2 className="font-display text-[clamp(1.625rem,3vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.04em] text-cream text-balance">
              <span data-anim="mask" className="block">
                {heading}
              </span>
            </h2>
          ) : null}
          {description ? (
            <div data-anim="rise" className="max-w-[52ch]">
              <RichTextComp
                content={description as RichText}
                className="prose-p:mb-0 prose-p:text-[15px] prose-p:leading-[1.6] prose-p:text-cream"
              />
            </div>
          ) : null}
        </div>

        <div
          data-anim="rise"
          className="flex w-full shrink-0 flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
        >
          {button_1?.label ? (
            <span data-anim="magnetic" className="inline-block">
            <Button
              asChild
              className="h-auto w-full px-5 py-2.5 text-base bg-button-dark text-cream hover:bg-button-dark/90 sm:w-auto"
            >
              <Link href={(button_1?.link as string) || '#'}>{button_1.label}</Link>
            </Button>
            </span>
          ) : null}
          {button_2?.label ? (
            <span data-anim="magnetic" className="inline-block">
            <Button
              asChild
              className="h-auto w-full px-5 py-2.5 text-base bg-cream text-ink hover:bg-cream-hover sm:w-auto"
            >
              <Link href={(button_2?.link as string) || '#'}>{button_2.label}</Link>
            </Button>
            </span>
          ) : null}
        </div>
      </div>
    </AboutScene>
  )
}

export default AboutEditorialCta
