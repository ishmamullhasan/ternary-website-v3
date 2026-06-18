import Motion from '@/components/animation/motion'
import ContactFormSection from '@/components/sections/contactForm'
import { careersText } from '@/lib/careers-colors'
import type { ContactFormBlock, Form } from '@/payload-types'
import type { JSX } from 'react'

const motionSectionProps = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

export function ContactFormComponent(props: ContactFormBlock): JSX.Element | null {
  // With depth>=1 the relationship is populated to the full Form doc.
  const form = props?.form && typeof props.form === 'object' ? (props.form as Form) : null

  if (!form) return null

  return (
    <Motion tag="section" id="message" className="space-y-8" {...motionSectionProps}>
      <div className="space-y-3 max-w-2xl">
        <h2 className={`text-2xl md:text-3xl font-semibold ${careersText.white} tracking-tight`}>
          {props?.heading || 'Send us a message'}
        </h2>
        {props?.description && (
          <p className={`text-sm md:text-base ${careersText.muted}`}>{props.description}</p>
        )}
      </div>
      <ContactFormSection fields={form.fields ?? []} formId={form.id} submitLabel={form.submitButtonLabel} />
    </Motion>
  )
}
