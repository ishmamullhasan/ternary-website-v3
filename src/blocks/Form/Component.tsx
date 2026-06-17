import type { FormBlockType } from '@/payload-types'

import type { JSX } from 'react'

import ContactForm from '@/components/sections/contactForm'

export function FormBlockComponent({ heading, description, form }: FormBlockType): JSX.Element | null {
  if (typeof form !== 'object' || form === null) return null

  return (
    <section className="max-w-3xl mx-auto px-4 lg:px-6 py-16">
      {(description || heading) && (
        <div className="mb-8">
          {description && <p className="text-body mb-3">{description}</p>}
          {heading && <h2 className="text-3xl font-semibold text-white">{heading}</h2>}
        </div>
      )}
      <ContactForm fields={form.fields ?? []} formId={String(form.id)} submitLabel={form.submitButtonLabel} />
    </section>
  )
}
