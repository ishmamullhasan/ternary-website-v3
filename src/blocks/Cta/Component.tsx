import type { CtaBlock } from '@/payload-types'

import Link from 'next/link'
import type { CSSProperties, JSX } from 'react'

export function CtaBlockComponent({
  heading,
  description,
  backgroundImage,
  button_1,
  button_2,
}: CtaBlock): JSX.Element {
  const bg = typeof backgroundImage === 'object' && backgroundImage !== null ? backgroundImage : null
  const bgStyle: CSSProperties | undefined = bg?.url
    ? { backgroundImage: `url(${bg.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-20">
      <div className="relative rounded-lg overflow-hidden bg-main p-10 text-center" style={bgStyle}>
        {heading && <h2 className="text-cream text-3xl lg:text-4xl font-semibold mb-4">{heading}</h2>}
        {description && <p className="text-body max-w-2xl mx-auto mb-8 leading-relaxed">{description}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          {button_1?.label && button_1.link && (
            <Link href={button_1.link} className="bg-cream text-ink px-6 py-3 rounded-lg font-medium">
              {button_1.label}
            </Link>
          )}
          {button_2?.label && button_2.link && (
            <Link href={button_2.link} className="border border-line text-cream px-6 py-3 rounded-lg font-medium">
              {button_2.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
