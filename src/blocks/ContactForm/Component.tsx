import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import ContactFormSection from '@/components/sections/contactForm'
import type { ContactFormBlock, Form } from '@/payload-types'
import { Mail } from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const motionSectionProps = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 as const },
  transition: { duration: 0.6, ease: EASE },
}

// The promise row beneath the header is part of the Request Form design (Figma 1535:4914),
// not CMS-driven, so it lives here.
const PROMISES: { title: string; detail: string }[] = [
  { title: 'Read by a human', detail: 'An orchestrator triages every new business inquiry the same day.' },
  { title: 'Substantive reply', detail: 'Not a calendar link, a real response to your context.' },
  { title: '48-hour bar', detail: 'We commit publicly, so we hold ourselves to it.' },
  { title: 'No spam, ever', detail: 'Your details aren’t added to any marketing list.' },
]

export function ContactFormComponent(props: ContactFormBlock): JSX.Element {
  // With depth>=1 the relationship is populated to the full Form doc; otherwise it may be a string id.
  const formDoc = props?.form && typeof props.form === 'object' ? (props.form as Form) : null
  const formId = formDoc?.id ?? (typeof props?.form === 'string' ? props.form : null)
  const submitLabel = formDoc?.submitButtonLabel ?? null

  const heading = props?.heading || 'Start a conversation'
  const description =
    (props?.description as RichText) ||
    'Tell us a little about your work and what you’re trying to move. An orchestrator reads every submission and replies — not a templated auto-response.'

  return (
    <Motion tag="section" id="message" className="space-y-10" {...motionSectionProps}>
      <div className="max-w-2xl space-y-5">
        <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.04em] text-cream">
          {heading}
        </h2>
        <RichTextComp
          content={description}
          className="prose-p:mb-0 prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-body md:prose-p:text-[16px]"
        />
        <a
          href="mailto:engagements@ternary.com"
          className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-main px-4 py-2 text-[13px] text-body transition-colors hover:border-subtle hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
        >
          <Mail size={14} aria-hidden className="text-subtle" />
          engagements@ternary.com
        </a>
      </div>

      {/* Promise row */}
      <div className="grid grid-cols-1 gap-6 border-y border-line py-8 sm:grid-cols-2 lg:grid-cols-4">
        {PROMISES.map((p, i) => (
          <Motion
            key={p.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.06, 0.24) }}
            className="space-y-2"
          >
            <h3 className="text-[15px] font-medium text-cream">{p.title}</h3>
            <p className="text-[13px] leading-relaxed text-subtle">{p.detail}</p>
          </Motion>
        ))}
      </div>

      <ContactFormSection formId={formId} submitLabel={submitLabel} />
    </Motion>
  )
}
