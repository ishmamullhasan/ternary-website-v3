import Motion from '@/components/animation/motion'
import ContactForm from '@/components/sections/contactForm'
import ContactOffices from '@/components/sections/contactOffices'
import ContactRoutes from '@/components/sections/contactRoutes'
import { careersBg, careersBorder, careersText } from '@/lib/careers-colors'
import type { ContactPage, Form } from '@/payload-types'
import config from '@/payload.config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { getPayload } from 'payload'
import type { JSX } from 'react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Pick the route that fits. Each one goes to a named owner with a posted response window — no shared mailbox, no triage queue.',
}

const motionSectionProps = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

const motionBlockProps = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.4 as const },
  transition: { duration: 0.35, ease: 'easeOut' as const },
}

export default async function Page(): Promise<JSX.Element> {
  const getContactPageData = unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      return payload.findGlobal({ slug: 'contactPage', depth: 2 })
    },
    ['contactPage'],
    { tags: ['contactPage'] },
  )

  const contactPageData: ContactPage | null = await getContactPageData()

  if (!contactPageData) {
    return (
      <div className="max-w-6xl text-red-700 font-bold flex justify-center items-center p-12">Error loading data.</div>
    )
  }

  const hero = contactPageData?.hero
  const stats = contactPageData?.stats ?? []
  const formGroup = contactPageData?.form
  // With depth>=1 the relationship is populated to the full Form doc.
  const form = formGroup?.form && typeof formGroup.form === 'object' ? (formGroup.form as Form) : null
  const cta = contactPageData?.cta

  return (
    <div className={`min-h-screen ${careersBg.page} ${careersText.cream} font-sans selection:bg-white/20`}>
      <main className="pt-10 pb-24 max-w-7xl mx-auto px-5 space-y-24">
        {/* Hero */}
        <Motion tag="section" className="space-y-6" {...motionSectionProps}>
          <Motion className="space-y-5 max-w-2xl" {...motionBlockProps}>
            <h1
              className={`text-3xl md:text-4xl lg:text-[40px] font-semibold ${careersText.white} tracking-tight leading-[1.1]`}
            >
              {hero?.heading}
            </h1>
            <p className={`text-base ${careersText.muted}`}>{hero?.description}</p>
            <div className="flex flex-wrap items-center gap-3">
              {hero?.button_1?.label && (
                <Link
                  href={hero.button_1.link || '#routes'}
                  className={`${careersBg.button} ${careersBg.buttonHover} ${careersText.onLight} text-sm font-medium px-5 py-3 rounded-lg transition-colors`}
                >
                  {hero.button_1.label}
                </Link>
              )}
              {hero?.button_2?.label && (
                <Link
                  href={hero.button_2.link || '#offices'}
                  className={`${careersBg.card} border ${careersBorder.input} ${careersText.body} text-sm font-medium px-5 py-3 rounded-lg hover:border-[#52525b] transition-colors`}
                >
                  {hero.button_2.label}
                </Link>
              )}
            </div>
          </Motion>
        </Motion>

        {/* Response-time stats */}
        {stats.length > 0 && (
          <Motion tag="section" className="grid grid-cols-1 md:grid-cols-3 gap-4" {...motionSectionProps}>
            {stats.map((stat, i) => (
              <div
                key={stat.id ?? i}
                className={`${careersBg.card} border ${careersBorder.subtle} rounded-lg p-8 text-center space-y-2`}
              >
                <p className={`text-2xl md:text-3xl font-semibold ${careersText.white}`}>{stat.value}</p>
                <p className={`text-base font-medium ${careersText.body}`}>{stat.label}</p>
                <p className={`text-sm ${careersText.muted}`}>{stat.detail}</p>
              </div>
            ))}
          </Motion>
        )}

        {/* Six routes. One owner each. */}
        <ContactRoutes data={contactPageData?.routes} />

        {/* Two studios. One operating rhythm. */}
        <ContactOffices data={contactPageData?.offices} />

        {/* Send us a message — only shown when a form is selected in the CMS. */}
        {form && (
          <Motion tag="section" id="message" className="space-y-8" {...motionSectionProps}>
            <div className="space-y-3 max-w-2xl">
              <h2 className={`text-2xl md:text-3xl font-semibold ${careersText.white} tracking-tight`}>
                {formGroup?.heading || 'Send us a message'}
              </h2>
              {formGroup?.description && (
                <p className={`text-sm md:text-base ${careersText.muted}`}>{formGroup.description}</p>
              )}
            </div>
            <ContactForm fields={form.fields ?? []} formId={form.id} submitLabel={form.submitButtonLabel} />
          </Motion>
        )}

        {/* CTA banner */}
        <Motion
          tag="section"
          className="relative overflow-hidden rounded-lg px-6 py-12 md:px-12 md:py-16 bg-linear-to-r from-[#1d4ed8] via-[#6d28d9] to-[#7c3aed]"
          {...motionSectionProps}
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight">
                {cta?.heading}
              </h2>
              <p className="text-sm md:text-base text-white/80">{cta?.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {cta?.button_1?.label && (
                <Link
                  href={cta.button_1.link || '#routes'}
                  className={`${careersBg.buttonDark} text-white text-sm font-medium px-5 py-3 rounded-lg hover:bg-[#0F0E0E] transition-colors`}
                >
                  {cta.button_1.label}
                </Link>
              )}
              {cta?.button_2?.label && (
                <Link
                  href={cta.button_2.link || '/solutions'}
                  className={`${careersBg.button} ${careersBg.buttonHover} ${careersText.onLight} text-sm font-medium px-5 py-3 rounded-lg transition-colors`}
                >
                  {cta.button_2.label}
                </Link>
              )}
            </div>
          </div>
        </Motion>
      </main>
    </div>
  )
}
