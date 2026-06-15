'use client'

import { careersBg, careersBorder, careersText } from '@/lib/careers-colors'
import type { Form } from '@/payload-types'
import { ChevronDown } from 'lucide-react'
import type { FormEvent, JSX } from 'react'
import { useState } from 'react'

type FormField = NonNullable<Form['fields']>[number]

type ContactFormProps = {
  fields: NonNullable<Form['fields']>
  formId: string
  submitLabel?: string | null
}

const fieldBase = `w-full bg-[#1b1a17] border ${careersBorder.input} text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#5a5a56] focus:outline-none focus:border-[#757571] hover:border-[#52525b] transition-colors`

// Flatten a Lexical richtext value to plain text (used for `message` blocks).
function lexicalToText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { text?: string; children?: unknown[]; root?: unknown }
  if (typeof n.text === 'string') return n.text
  if (n.root) return lexicalToText(n.root)
  if (Array.isArray(n.children)) return n.children.map(lexicalToText).join(' ')
  return ''
}

function colSpanFor(width?: number | null): string {
  return width === 50 ? 'sm:col-span-1' : 'sm:col-span-2'
}

function FieldLabel({ htmlFor, label, required }: { htmlFor?: string; label?: string | null; required?: boolean }) {
  if (!label) return null
  return (
    <label htmlFor={htmlFor} className={`block mb-2 text-xs ${careersText.muted}`}>
      {label}
      {required ? <span className="text-[#D5D5D5]"> *</span> : null}
    </label>
  )
}

export default function ContactForm({ fields, formId, submitLabel }: ContactFormProps): JSX.Element {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formEl = e.currentTarget
    const formData = new FormData(formEl)

    const submissionData = Array.from(formData.entries()).map(([field, value]) => ({
      field,
      value: value.toString(),
    }))

    setStatus('submitting')
    setMessage(null)

    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: formId, submissionData }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(
          data.doc?.form?.confirmationMessage?.root?.children?.[0]?.children?.[0]?.text ||
            'Thank you for your submission.',
        )
        formEl.reset()
      } else {
        setStatus('error')
        setMessage(data.message || 'An error occurred. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('An unexpected error occurred. Please try again.')
    }
  }

  const renderField = (field: FormField) => {
    const key = field.id || ('name' in field ? field.name : field.blockType)

    switch (field.blockType) {
      case 'text':
      case 'email':
      case 'number':
      case 'date': {
        const type =
          field.blockType === 'email'
            ? 'email'
            : field.blockType === 'number'
              ? 'number'
              : field.blockType === 'date'
                ? 'date'
                : 'text'
        return (
          <div key={key} className={colSpanFor(field.width)}>
            <FieldLabel htmlFor={field.name} label={field.label} required={!!field.required} />
            <input
              id={field.name}
              name={field.name}
              type={type}
              placeholder={field.label ?? undefined}
              required={!!field.required}
              defaultValue={
                'defaultValue' in field && field.defaultValue != null ? String(field.defaultValue) : undefined
              }
              className={fieldBase}
            />
          </div>
        )
      }

      case 'textarea':
        return (
          <div key={key} className="sm:col-span-2">
            <FieldLabel htmlFor={field.name} label={field.label} required={!!field.required} />
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.label ?? undefined}
              required={!!field.required}
              defaultValue={field.defaultValue ?? undefined}
              rows={6}
              className={`${fieldBase} resize-y`}
            />
          </div>
        )

      case 'select':
        return (
          <div key={key} className={colSpanFor(field.width)}>
            <FieldLabel htmlFor={field.name} label={field.label} required={!!field.required} />
            <div className="relative">
              <select
                id={field.name}
                name={field.name}
                required={!!field.required}
                defaultValue={field.defaultValue ?? ''}
                className={`${fieldBase} appearance-none pr-10 cursor-pointer`}
              >
                <option value="" disabled>
                  {field.placeholder || 'Select an option'}
                </option>
                {field.options?.map((option) => (
                  <option key={option.id || option.value} value={option.value} className="bg-[#1b1a17] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${careersText.muted} pointer-events-none`}
                aria-hidden
              />
            </div>
          </div>
        )

      case 'radio':
        return (
          <div key={key} className={colSpanFor(field.width)}>
            <FieldLabel label={field.label} required={!!field.required} />
            <div className="flex flex-wrap gap-4 pt-1">
              {field.options?.map((option) => (
                <label
                  key={option.id || option.value}
                  className={`flex items-center gap-2 text-sm ${careersText.body}`}
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    required={!!field.required}
                    defaultChecked={field.defaultValue === option.value}
                    className="h-4 w-4 accent-[#7c3aed]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        )

      case 'checkbox':
        return (
          <label key={key} className={`flex items-center gap-2 text-sm ${careersText.body} ${colSpanFor(field.width)}`}>
            <input
              id={field.name}
              type="checkbox"
              name={field.name}
              value="true"
              required={!!field.required}
              defaultChecked={!!field.defaultValue}
              className="h-4 w-4 accent-[#7c3aed]"
            />
            {field.label}
            {field.required ? <span className="text-[#D5D5D5]"> *</span> : null}
          </label>
        )

      // country / state ship no options in our setup — render as a text input so the
      // value is still captured. Swap to a select with a list if needed later.
      case 'country':
      case 'state':
        return (
          <div key={key} className={colSpanFor(field.width)}>
            <FieldLabel htmlFor={field.name} label={field.label} required={!!field.required} />
            <input
              id={field.name}
              name={field.name}
              type="text"
              placeholder={field.label ?? undefined}
              required={!!field.required}
              className={fieldBase}
            />
          </div>
        )

      case 'message':
        return (
          <p key={key} className={`sm:col-span-2 text-sm leading-relaxed ${careersText.muted}`}>
            {lexicalToText(field.message)}
          </p>
        )

      default:
        return null
    }
  }

  return (
    <div className={`${careersBg.card} border ${careersBorder.subtle} rounded-lg p-6 md:p-8`}>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {fields.map(renderField)}

        <div className="sm:col-span-2 flex flex-col gap-3 pt-1">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className={`${careersBg.button} ${careersBg.buttonHover} ${careersText.onLight} font-medium px-8 py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {status === 'submitting' ? 'Sending…' : submitLabel || 'Send message'}
          </button>
          {message && <p className={`text-sm ${status === 'error' ? 'text-red-400' : careersText.body}`}>{message}</p>}
        </div>
      </form>
    </div>
  )
}
