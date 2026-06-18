'use client'

import { careersBg, careersBorder, careersText } from '@/lib/careers-colors'
import { ChevronDown, Loader2, Upload } from 'lucide-react'
import type { ChangeEvent, FormEvent, JSX, ReactNode } from 'react'
import { useRef, useState } from 'react'

/* ---------- shared field primitives ---------- */

const fieldBase = `w-full bg-[#1b1a17] border ${careersBorder.input} text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#5a5a56] focus:outline-none focus:border-[#757571] hover:border-[#52525b] transition-colors`

function Label({ children, required }: { children: ReactNode; required?: boolean }): JSX.Element {
  return (
    <label className={`block mb-2 text-xs ${careersText.muted}`}>
      {children}
      {required ? <span className="text-[#D5D5D5]"> *</span> : null}
    </label>
  )
}

function Field({
  label,
  required,
  htmlFor,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  htmlFor?: string
  children: ReactNode
  className?: string
}): JSX.Element {
  return (
    <div className={className}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={`block mb-2 text-xs ${careersText.muted}`}>
          {label}
          {required ? <span className="text-[#D5D5D5]"> *</span> : null}
        </label>
      ) : (
        <Label required={required}>{label}</Label>
      )}
      {children}
    </div>
  )
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}): JSX.Element {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      className={fieldBase}
    />
  )
}

function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}): JSX.Element {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className={`${fieldBase} appearance-none pr-10 cursor-pointer ${value ? 'text-white' : 'text-[#5a5a56]'}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#1b1a17] text-white">
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
}: {
  id: string
  label: string
  file: File | null
  onChange: (file: File | null) => void
  accept?: string
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
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`${fieldBase} flex items-center justify-between text-left ${file ? 'text-white' : 'text-[#5a5a56]'}`}
      >
        <span className="truncate">{file?.name || label}</span>
        <Upload size={16} className={`${careersText.body} shrink-0 ml-3`} aria-hidden />
      </button>
    </>
  )
}

function SectionHeading({ children }: { children: ReactNode }): JSX.Element {
  return <h2 className={`text-2xl md:text-3xl font-semibold ${careersText.white} tracking-tight`}>{children}</h2>
}

function SubHeading({ children }: { children: ReactNode }): JSX.Element {
  return <h3 className={`text-lg font-medium ${careersText.white} tracking-tight`}>{children}</h3>
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

export default function ApplyForm({ slug }: ApplyFormProps): JSX.Element {
  const [form, setForm] = useState<FormState>(initialState)
  // Files live outside `form` (text) state so we can POST the real File objects, not their names.
  const [resume, setResume] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = (key: keyof FormState) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Client-side required validation. Resume is mandatory; the rest is enforced by the API.
    if (!resume) {
      setError('Please attach your resume before submitting.')
      return
    }

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-16">
      {/* Personal Information */}
      <section className="space-y-8">
        <SectionHeading>Personal Information</SectionHeading>

        <div className="space-y-4">
          <SubHeading>Legal Name</SubHeading>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="First Name" required htmlFor="firstName">
              <TextInput id="firstName" value={form.firstName} onChange={set('firstName')} placeholder="John" />
            </Field>
            <Field label="Middle Name" htmlFor="middleName">
              <TextInput id="middleName" value={form.middleName} onChange={set('middleName')} placeholder="Quincy" />
            </Field>
            <Field label="Last Name" required htmlFor="lastName">
              <TextInput id="lastName" value={form.lastName} onChange={set('lastName')} placeholder="Doe" />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <SubHeading>Contact Information</SubHeading>
          <Field label="Email" required htmlFor="email">
            <TextInput
              id="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="john.doe@gmail.com"
            />
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-[140px_1fr_120px] gap-4">
            <Field label="Country Code" required htmlFor="countryCode">
              <Select
                id="countryCode"
                value={form.countryCode}
                onChange={set('countryCode')}
                options={COUNTRY_CODES}
                placeholder="BD +880"
              />
            </Field>
            <Field label="Phone Number" required htmlFor="phone">
              <TextInput id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="1712345678" />
            </Field>
            <Field label="Extension" htmlFor="extension">
              <TextInput id="extension" value={form.extension} onChange={set('extension')} placeholder="123" />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <SubHeading>Location</SubHeading>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Country" required htmlFor="country">
              <Select
                id="country"
                value={form.country}
                onChange={set('country')}
                options={COUNTRIES}
                placeholder="Select Country"
              />
            </Field>
            <Field label="State / Province" htmlFor="state">
              <TextInput id="state" value={form.state} onChange={set('state')} placeholder="Example State" />
            </Field>
            <Field label="City" required htmlFor="city">
              <TextInput id="city" value={form.city} onChange={set('city')} placeholder="Example City" />
            </Field>
          </div>
        </div>
      </section>

      {/* Career */}
      <section className="space-y-8">
        <SectionHeading>Career</SectionHeading>

        <Field label="Current Employment Status" required htmlFor="employmentStatus" className="max-w-sm">
          <Select
            id="employmentStatus"
            value={form.employmentStatus}
            onChange={set('employmentStatus')}
            options={EMPLOYMENT_STATUS}
            placeholder="Select One"
          />
        </Field>

        <div className="space-y-4">
          <SubHeading>Most Recent Employer</SubHeading>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Employer Name" required htmlFor="employerName">
              <TextInput
                id="employerName"
                value={form.employerName}
                onChange={set('employerName')}
                placeholder="ABC Corporation, Inc."
              />
            </Field>
            <Field label="Job Title" required htmlFor="jobTitle">
              <TextInput id="jobTitle" value={form.jobTitle} onChange={set('jobTitle')} placeholder="Product Manager" />
            </Field>
          </div>
          <Field
            label="Time Spent with Employer"
            required
            htmlFor="timeWithEmployer"
            className="sm:max-w-[calc(50%-0.5rem)]"
          >
            <Select
              id="timeWithEmployer"
              value={form.timeWithEmployer}
              onChange={set('timeWithEmployer')}
              options={TIME_WITH_EMPLOYER}
              placeholder="Select Duration"
            />
          </Field>
        </div>
      </section>

      {/* Education */}
      <section className="space-y-8">
        <SectionHeading>Education</SectionHeading>

        <Field label="Highest Level of Education Completed" required htmlFor="educationLevel" className="max-w-sm">
          <Select
            id="educationLevel"
            value={form.educationLevel}
            onChange={set('educationLevel')}
            options={EDUCATION_LEVELS}
            placeholder="Example Degree"
          />
        </Field>

        <div className="space-y-4">
          <SubHeading>Most Recent Educational Qualification</SubHeading>
          <Field label="Institution Name" required htmlFor="institutionName">
            <TextInput
              id="institutionName"
              value={form.institutionName}
              onChange={set('institutionName')}
              placeholder="Example University"
            />
          </Field>
          <Field label="Major Area of Study" required htmlFor="majorAreaOfStudy">
            <TextInput
              id="majorAreaOfStudy"
              value={form.majorAreaOfStudy}
              onChange={set('majorAreaOfStudy')}
              placeholder="Computer Science"
            />
          </Field>
          <div className="grid sm:grid-cols-[220px_1fr] gap-4">
            <Field label="Degree" required htmlFor="degree">
              <Select
                id="degree"
                value={form.degree}
                onChange={set('degree')}
                options={DEGREES}
                placeholder="Bachelor of Science"
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
        <div className="space-y-4">
          <Field label="Resume" required htmlFor="resume">
            <FileUpload id="resume" label="Upload Resume" file={resume} onChange={setResume} accept=".pdf,.doc,.docx" />
          </Field>
          <Field label="Cover Letter" htmlFor="coverLetter">
            <FileUpload
              id="coverLetter"
              label="Upload Cover Letter"
              file={coverLetter}
              onChange={setCoverLetter}
              accept=".pdf,.doc,.docx"
            />
          </Field>
        </div>
      </section>

      {/* Voluntary Self Identification */}
      <section className="space-y-8">
        <SectionHeading>Voluntary Self Identification</SectionHeading>
        <div className={`space-y-4 text-sm leading-relaxed ${careersText.muted} max-w-3xl`}>
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

        <div className="space-y-4">
          <SubHeading>Diversity, Equity, and Inclusion</SubHeading>
          <div className="grid sm:grid-cols-3 gap-4">
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
            required
            htmlFor="disability"
          >
            <Select
              id="disability"
              value={form.disability}
              onChange={set('disability')}
              options={YES_NO_DISCLOSE}
              placeholder="Please Select an Option"
            />
          </Field>
          <Field
            label="Are you a veteran or active member of the United States Armed Forces?"
            required
            htmlFor="veteran"
          >
            <Select
              id="veteran"
              value={form.veteran}
              onChange={set('veteran')}
              options={YES_NO_DISCLOSE}
              placeholder="Please Select an Option"
            />
          </Field>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting || submitted}
            className={`${careersBg.button} ${careersBg.buttonHover} ${careersText.onLight} inline-flex items-center gap-2 font-medium px-8 py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {submitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
            {submitting ? 'Submitting…' : submitted ? 'Submitted' : 'Submit'}
          </button>
        </div>
        {error && (
          <p role="alert" className="text-right text-sm text-red-400">
            {error}
          </p>
        )}
        {submitted && (
          <div
            className={`${careersBg.card} border ${careersBorder.input} rounded-lg p-5 text-sm ${careersText.body}`}
            role="status"
          >
            <p className={`font-medium ${careersText.white} mb-1`}>Application received</p>
            <p>Thanks for applying. We&rsquo;ll review your application and be in touch soon.</p>
          </div>
        )}
      </section>
    </form>
  )
}
