'use client'

import { careersText } from '@/lib/careers-colors'
import { ChevronDown, Loader2, Upload, X } from 'lucide-react'
import type { ChangeEvent, FormEvent, JSX, ReactNode } from 'react'
import { useId, useRef, useState } from 'react'

/* ---------- shared field primitives ----------

   Field surface = Surface/Card #1b1a17 (bg-main), Radius/sm = 4px (rounded-sm), subtle 1px line
   border (border-line). Invalid fields shift the border to the destructive token and expose
   aria-invalid. Focus relies on the global focus-visible ring (globals.css) for a consistent
   keyboard outline across the site — no invented per-field colour shift. */

const fieldBase =
  'w-full min-h-[44px] bg-main border rounded-sm px-4 py-3 text-base text-cream placeholder:text-subtle/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-page'

function borderClass(invalid?: boolean): string {
  return invalid ? 'border-red-500/70 focus-visible:border-red-500' : 'border-line hover:border-line-strong'
}

function Field({
  label,
  required,
  htmlFor,
  children,
  className = '',
  error,
}: {
  label: string
  required?: boolean
  htmlFor?: string
  children: ReactNode
  className?: string
  error?: string
}): JSX.Element {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block mb-2.5 font-display text-[15px] text-cream/90">
        {label}
        {required ? <span className="text-body"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  invalid,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  invalid?: boolean
}): JSX.Element {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      className={`${fieldBase} ${borderClass(invalid)}`}
    />
  )
}

function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
  invalid,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  required?: boolean
  invalid?: boolean
}): JSX.Element {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={`${fieldBase} ${borderClass(invalid)} appearance-none pr-10 cursor-pointer ${value ? 'text-cream' : 'text-subtle/70'}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-main text-cream">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className={`absolute right-3 top-1/2 -translate-y-1/2 ${careersText.muted} pointer-events-none`}
        aria-hidden
      />
    </div>
  )
}

function FileUpload({
  id,
  label,
  file,
  onChange,
  accept,
  invalid,
}: {
  id: string
  label: string
  file: File | null
  onChange: (file: File | null) => void
  accept?: string
  invalid?: boolean
}): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)
  // Capture the actual File object (needed for multipart upload), not just its name.
  return (
    <>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.files?.[0] ?? null)}
      />
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`${fieldBase} ${borderClass(invalid)} group/file flex flex-1 items-center justify-between text-left ${file ? 'text-cream' : 'text-subtle/70'}`}
        >
          <span className="truncate">{file?.name || label}</span>
          <Upload
            size={16}
            className="text-subtle shrink-0 ml-3 transition-colors group-hover/file:text-body"
            aria-hidden
          />
        </button>
        {file && (
          <button
            type="button"
            onClick={() => {
              onChange(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            aria-label={`Remove ${file.name}`}
            className="flex w-11 min-h-[44px] shrink-0 items-center justify-center rounded-sm border border-line bg-main text-subtle transition-colors hover:border-line-strong hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            <X size={16} aria-hidden />
          </button>
        )}
      </div>
    </>
  )
}

function SectionHeading({ children }: { children: ReactNode }): JSX.Element {
  return (
    <h2 className="font-display text-[28px] md:text-[32px] font-medium leading-[1.15] text-cream/90">{children}</h2>
  )
}

function SubHeading({ children }: { children: ReactNode }): JSX.Element {
  return <h3 className="font-display text-[22px] font-semibold leading-[1.15] text-cream/90">{children}</h3>
}

/* ---------- options ---------- */

const COUNTRY_CODES = ['BD +880', 'US +1', 'UK +44', 'IN +91', 'AU +61', 'CA +1']
const COUNTRIES = ['Bangladesh', 'United States', 'United Kingdom', 'India', 'Australia', 'Canada']
const EMPLOYMENT_STATUS = ['Employed', 'Self-Employed', 'Unemployed', 'Student', 'Freelancer']
const TIME_WITH_EMPLOYER = ['Less than 1 year', '1 to 2 years', '2 to 5 years', '5 to 10 years', '10+ years']
const EDUCATION_LEVELS = ['High School', 'Associate Degree', "Bachelor's Degree", "Master's Degree", 'Doctorate (PhD)']
const DEGREES = ['Bachelor of Science', 'Bachelor of Arts', 'Master of Science', 'Master of Arts', 'PhD', 'Diploma']
const GENDER_IDENTITY = ['Male', 'Female', 'Non-binary', 'Prefer to self-describe', 'I don’t wish to answer']
const SEXUAL_ORIENTATION = [
  'Heterosexual',
  'Gay or Lesbian',
  'Bisexual',
  'Prefer to self-describe',
  'I don’t wish to answer',
]
const RACIAL_BACKGROUND = [
  'Asian',
  'Black or African',
  'Hispanic or Latino',
  'White',
  'Two or More',
  'I don’t wish to answer',
]
const YES_NO_DISCLOSE = ['Yes', 'No', 'I don’t wish to answer']

/* ---------- form ---------- */

const initialState = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  countryCode: '',
  phone: '',
  extension: '',
  country: '',
  state: '',
  city: '',
  employmentStatus: '',
  employerName: '',
  jobTitle: '',
  timeWithEmployer: '',
  educationLevel: '',
  institutionName: '',
  majorAreaOfStudy: '',
  degree: '',
  additionalDetails: '',
  genderIdentity: '',
  sexualOrientation: '',
  racialBackground: '',
  disability: '',
  veteran: '',
}

type FormState = typeof initialState

interface ApplyFormProps {
  /** Role slug — used as the POST /applications/{slug} path param. */
  slug?: string
}

const API_BASE = process.env.RECRUIT_API_BASE ?? 'https://api.ternary.solutions/recruit/v1/public'

// Accepted document types + a human-readable hint surfaced under the upload controls.
const DOC_ACCEPT = '.pdf,.doc,.docx'
const DOC_HINT = 'PDF, DOC or DOCX · up to 10MB'
const MAX_FILE_BYTES = 10 * 1024 * 1024

// Fields required client-side. The API is still the source of truth, but validating here gives
// inline, per-field feedback instead of a single opaque server rejection.
const REQUIRED_TEXT: (keyof FormState)[] = [
  'firstName',
  'lastName',
  'email',
  'countryCode',
  'phone',
  'country',
  'city',
  'employmentStatus',
  'employerName',
  'jobTitle',
  'timeWithEmployer',
  'educationLevel',
  'institutionName',
  'majorAreaOfStudy',
  'degree',
  'disability',
  'veteran',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ApplyForm({ slug }: ApplyFormProps): JSX.Element {
  const [form, setForm] = useState<FormState>(initialState)
  // Files live outside `form` (text) state so we can POST the real File objects, not their names.
  const [resume, setResume] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // Per-field errors, keyed by field id; `resume` is included for the file control.
  const [errors, setErrors] = useState<Record<string, string>>({})
  const confirmationRef = useRef<HTMLDivElement>(null)
  const formTitleId = useId()

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => {
      // Clear a field's error as soon as the candidate starts correcting it.
      if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
      return { ...prev, [key]: value }
    })

  const setResumeFile = (file: File | null) => {
    if (file && file.size > MAX_FILE_BYTES) {
      setErrors((e) => ({ ...e, resume: 'File is too large (max 10MB).' }))
      return
    }
    setErrors((e) => ({ ...e, resume: '' }))
    setResume(file)
  }

  const setCoverLetterFile = (file: File | null) => {
    if (file && file.size > MAX_FILE_BYTES) {
      setErrors((e) => ({ ...e, coverLetter: 'File is too large (max 10MB).' }))
      return
    }
    setErrors((e) => ({ ...e, coverLetter: '' }))
    setCoverLetter(file)
  }

  // Validate required text/selects + resume + email format. Returns the error map (also stored).
  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {}
    for (const key of REQUIRED_TEXT) {
      if (!form[key]?.trim()) next[key] = 'This field is required.'
    }
    if (form.email && !EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address.'
    if (!resume) next.resume = 'Please attach your resume.'
    return next
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setError('Please complete the required fields highlighted below.')
      // Move focus/scroll to the first field with an error.
      const firstKey = Object.keys(validationErrors)[0]
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      document.getElementById(firstKey)?.focus({ preventScroll: true })
      return
    }
    setErrors({})

    if (!resume) return

    setSubmitting(true)

    // Multipart POST to the recruit public-apply endpoint (the "brains"): it stores the
    // resume in S3 and writes the application to its DB. We map our fields onto its
    // snake_case contract, send the resume file, and bundle the FULL form as `extra_fields`
    // JSON so nothing the candidate entered is lost. No Content-Type header — the browser
    // sets the multipart boundary itself.
    const body = new FormData()
    const core: Record<string, string> = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: [form.countryCode, form.phone].filter(Boolean).join(' ').trim(),
      current_employer: form.employerName,
      summary: form.additionalDetails,
    }
    for (const [key, value] of Object.entries(core)) {
      if (value) body.append(key, value)
    }
    body.append('extra_fields', JSON.stringify({ ...form, coverLetterFilename: coverLetter?.name ?? null }))
    body.append('resume', resume, resume.name)
    // The recruit service models a single resume today, so the cover-letter file isn't
    // uploaded — its filename rides along in extra_fields until a cover-letter slot exists.

    try {
      const res = await fetch(`${API_BASE}/applications/${slug}`, { method: 'POST', body })
      if (!res.ok) {
        const detail = (await res.json().catch(() => null)) as { detail?: string } | null
        throw new Error(detail?.detail || `Submission failed (${res.status})`)
      }
      setSubmitted(true)
      // The form is long; bring the confirmation into view so the candidate sees the result.
      requestAnimationFrame(() => confirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Small helpers so each field forwards its inline-error/invalid state without 3× boilerplate.
  const fieldProps = (key: keyof FormState) => ({ error: errors[key], required: REQUIRED_TEXT.includes(key) })
  const inputProps = (key: keyof FormState) => ({
    invalid: Boolean(errors[key]),
    required: REQUIRED_TEXT.includes(key),
  })

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby={formTitleId} className="space-y-16">
      <h2 id={formTitleId} className="sr-only">
        Job application form
      </h2>
      {/* Personal Information */}
      <section className="space-y-8">
        <SectionHeading>Personal Information</SectionHeading>

        <div className="space-y-5">
          <SubHeading>Legal Name</SubHeading>
          <div className="grid sm:grid-cols-3 gap-5">
            <Field label="First Name" htmlFor="firstName" {...fieldProps('firstName')}>
              <TextInput
                id="firstName"
                value={form.firstName}
                onChange={set('firstName')}
                placeholder="John"
                {...inputProps('firstName')}
              />
            </Field>
            <Field label="Middle Name" htmlFor="middleName">
              <TextInput id="middleName" value={form.middleName} onChange={set('middleName')} placeholder="Quincy" />
            </Field>
            <Field label="Last Name" htmlFor="lastName" {...fieldProps('lastName')}>
              <TextInput
                id="lastName"
                value={form.lastName}
                onChange={set('lastName')}
                placeholder="Doe"
                {...inputProps('lastName')}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-5">
          <SubHeading>Contact Information</SubHeading>
          <Field label="Email" htmlFor="email" {...fieldProps('email')}>
            <TextInput
              id="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="john.doe@gmail.com"
              {...inputProps('email')}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr_120px] gap-5">
            <Field label="Country Code" htmlFor="countryCode" {...fieldProps('countryCode')}>
              <Select
                id="countryCode"
                value={form.countryCode}
                onChange={set('countryCode')}
                options={COUNTRY_CODES}
                placeholder="BD +880"
                {...inputProps('countryCode')}
              />
            </Field>
            <Field label="Phone Number" htmlFor="phone" {...fieldProps('phone')}>
              <TextInput
                id="phone"
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="1712345678"
                {...inputProps('phone')}
              />
            </Field>
            <Field label="Extension" htmlFor="extension">
              <TextInput id="extension" value={form.extension} onChange={set('extension')} placeholder="123" />
            </Field>
          </div>
        </div>

        <div className="space-y-5">
          <SubHeading>Location</SubHeading>
          <div className="grid sm:grid-cols-3 gap-5">
            <Field label="Country" htmlFor="country" {...fieldProps('country')}>
              <Select
                id="country"
                value={form.country}
                onChange={set('country')}
                options={COUNTRIES}
                placeholder="Select Country"
                {...inputProps('country')}
              />
            </Field>
            <Field label="State / Province" htmlFor="state">
              <TextInput id="state" value={form.state} onChange={set('state')} placeholder="Example State" />
            </Field>
            <Field label="City" htmlFor="city" {...fieldProps('city')}>
              <TextInput
                id="city"
                value={form.city}
                onChange={set('city')}
                placeholder="Example City"
                {...inputProps('city')}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Career */}
      <section className="space-y-8">
        <SectionHeading>Career</SectionHeading>

        <Field
          label="Current Employment Status"
          htmlFor="employmentStatus"
          className="max-w-sm"
          {...fieldProps('employmentStatus')}
        >
          <Select
            id="employmentStatus"
            value={form.employmentStatus}
            onChange={set('employmentStatus')}
            options={EMPLOYMENT_STATUS}
            placeholder="Select One"
            {...inputProps('employmentStatus')}
          />
        </Field>

        <div className="space-y-5">
          <SubHeading>Most Recent Employer</SubHeading>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Employer Name" htmlFor="employerName" {...fieldProps('employerName')}>
              <TextInput
                id="employerName"
                value={form.employerName}
                onChange={set('employerName')}
                placeholder="ABC Corporation, Inc."
                {...inputProps('employerName')}
              />
            </Field>
            <Field label="Job Title" htmlFor="jobTitle" {...fieldProps('jobTitle')}>
              <TextInput
                id="jobTitle"
                value={form.jobTitle}
                onChange={set('jobTitle')}
                placeholder="Product Manager"
                {...inputProps('jobTitle')}
              />
            </Field>
          </div>
          <Field
            label="Time Spent with Employer"
            htmlFor="timeWithEmployer"
            className="sm:max-w-[calc(50%-0.5rem)]"
            {...fieldProps('timeWithEmployer')}
          >
            <Select
              id="timeWithEmployer"
              value={form.timeWithEmployer}
              onChange={set('timeWithEmployer')}
              options={TIME_WITH_EMPLOYER}
              placeholder="Select Duration"
              {...inputProps('timeWithEmployer')}
            />
          </Field>
        </div>
      </section>

      {/* Education */}
      <section className="space-y-8">
        <SectionHeading>Education</SectionHeading>

        <Field
          label="Highest Level of Education Completed"
          htmlFor="educationLevel"
          className="max-w-sm"
          {...fieldProps('educationLevel')}
        >
          <Select
            id="educationLevel"
            value={form.educationLevel}
            onChange={set('educationLevel')}
            options={EDUCATION_LEVELS}
            placeholder="Select One"
            {...inputProps('educationLevel')}
          />
        </Field>

        <div className="space-y-5">
          <SubHeading>Most Recent Educational Qualification</SubHeading>
          <Field label="Institution Name" htmlFor="institutionName" {...fieldProps('institutionName')}>
            <TextInput
              id="institutionName"
              value={form.institutionName}
              onChange={set('institutionName')}
              placeholder="Example University"
              {...inputProps('institutionName')}
            />
          </Field>
          <Field label="Major Area of Study" htmlFor="majorAreaOfStudy" {...fieldProps('majorAreaOfStudy')}>
            <TextInput
              id="majorAreaOfStudy"
              value={form.majorAreaOfStudy}
              onChange={set('majorAreaOfStudy')}
              placeholder="Computer Science"
              {...inputProps('majorAreaOfStudy')}
            />
          </Field>
          <div className="grid sm:grid-cols-[220px_1fr] gap-5">
            <Field label="Degree" htmlFor="degree" {...fieldProps('degree')}>
              <Select
                id="degree"
                value={form.degree}
                onChange={set('degree')}
                options={DEGREES}
                placeholder="Bachelor of Science"
                {...inputProps('degree')}
              />
            </Field>
            <Field
              label="Additional Details (Notable Achievements, Relevant Courses, or Extra Curricular Activities)"
              htmlFor="additionalDetails"
            >
              <TextInput
                id="additionalDetails"
                value={form.additionalDetails}
                onChange={set('additionalDetails')}
                placeholder="Runner Up at 2024 Citadel Hackathon"
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Upload Documents */}
      <section className="space-y-8">
        <SectionHeading>Upload Documents</SectionHeading>
        <div className="space-y-5">
          <Field label="Resume" required htmlFor="resume" error={errors.resume}>
            <FileUpload
              id="resume"
              label="Upload Resume"
              file={resume}
              onChange={setResumeFile}
              accept={DOC_ACCEPT}
              invalid={Boolean(errors.resume)}
            />
            <p className="mt-1.5 text-xs text-subtle">{DOC_HINT}</p>
          </Field>
          <Field label="Cover Letter" htmlFor="coverLetter" error={errors.coverLetter}>
            <FileUpload
              id="coverLetter"
              label="Upload Cover Letter"
              file={coverLetter}
              onChange={setCoverLetterFile}
              accept={DOC_ACCEPT}
              invalid={Boolean(errors.coverLetter)}
            />
            <p className="mt-1.5 text-xs text-subtle">{DOC_HINT} · optional</p>
          </Field>
        </div>
      </section>

      {/* Voluntary Self Identification */}
      <section className="space-y-8">
        <SectionHeading>Voluntary Self Identification</SectionHeading>
        <div className="space-y-4 text-sm leading-relaxed text-subtle max-w-3xl">
          <p>
            At Ternary we are committed to attracting diverse talent and cultivating a culture of equity, inclusion, and
            belonging. Below is a set of voluntary demographic questions that are a part of our inclusion efforts and
            will be used to help us identify areas for improvement in our process.
          </p>
          <p>
            Self-identification in the section is completely voluntary and if you choose not to provide any information,
            please select the &ldquo;I don&rsquo;t wish to answer&rdquo; option under the question. Whatever your
            decision, it will not be considered in the hiring process or thereafter. Any information that you do provide
            will be submitted in aggregate and will not be associated with your application.
          </p>
        </div>

        {/* Grouped as a fieldset so assistive tech announces these questions as one related set. */}
        <fieldset className="space-y-4 border-0 p-0 m-0">
          <legend className="font-display text-[22px] font-semibold leading-[1.15] text-cream/90 mb-4">
            Diversity, Equity, and Inclusion
          </legend>
          <div className="grid sm:grid-cols-3 gap-5">
            <Field label="Gender Identity" htmlFor="genderIdentity">
              <Select
                id="genderIdentity"
                value={form.genderIdentity}
                onChange={set('genderIdentity')}
                options={GENDER_IDENTITY}
                placeholder="Please Select an Option"
              />
            </Field>
            <Field label="Sexual Orientation" htmlFor="sexualOrientation">
              <Select
                id="sexualOrientation"
                value={form.sexualOrientation}
                onChange={set('sexualOrientation')}
                options={SEXUAL_ORIENTATION}
                placeholder="Please Select an Option"
              />
            </Field>
            <Field label="Racial Background" htmlFor="racialBackground">
              <Select
                id="racialBackground"
                value={form.racialBackground}
                onChange={set('racialBackground')}
                options={RACIAL_BACKGROUND}
                placeholder="Please Select an Option"
              />
            </Field>
          </div>
          <Field
            label="Do you have a disability/chronic condition (physical, visual, auditory, cognitive, mental, emotional or other) that substantially limits one or more of your major life activities, including mobility, communication (seeing/hearing/speaking) and learning?"
            htmlFor="disability"
            {...fieldProps('disability')}
          >
            <Select
              id="disability"
              value={form.disability}
              onChange={set('disability')}
              options={YES_NO_DISCLOSE}
              placeholder="Please Select an Option"
              {...inputProps('disability')}
            />
          </Field>
          <Field
            label="Are you a veteran or active member of the United States Armed Forces?"
            htmlFor="veteran"
            {...fieldProps('veteran')}
          >
            <Select
              id="veteran"
              value={form.veteran}
              onChange={set('veteran')}
              options={YES_NO_DISCLOSE}
              placeholder="Please Select an Option"
              {...inputProps('veteran')}
            />
          </Field>
        </fieldset>

        <div className="flex flex-col items-end gap-3 pt-2">
          {error && (
            <p role="alert" className="text-right text-sm text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || submitted}
            className="group/submit inline-flex min-h-[44px] items-center gap-2 rounded-md bg-cream px-8 py-3 text-sm font-medium text-ink transition-[background-color,box-shadow] duration-200 hover:bg-cream-hover hover:shadow-[0_10px_30px_-12px_rgba(244,243,236,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {submitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
            {submitting ? 'Submitting…' : submitted ? 'Submitted' : 'Submit'}
          </button>
        </div>

        {submitted && (
          <div
            ref={confirmationRef}
            className="bg-main border border-line rounded-md p-5 text-sm text-body"
            role="status"
            aria-live="polite"
          >
            <p className="font-medium text-cream mb-1">Application received</p>
            <p>Thanks for applying. We&rsquo;ll review your application and be in touch soon.</p>
          </div>
        )}
      </section>
    </form>
  )
}
