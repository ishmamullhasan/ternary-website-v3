/* ---------------------------------------------------------------------------
 * Recruiting jobs — single source of truth (live recruiting API)
 * ---------------------------------------------------------------------------
 * Owns its OWN types — intentionally NOT coupled to Payload. The job list,
 * detail, apply form, and careers board all read from here. The getters fetch
 * the public recruiting API (RECRUIT_API_BASE), which is the single source of
 * truth for job listings.
 *
 *  ✅ API (PublicJobSummary on /jobs, + the rest on /jobs/{slug}):
 *     slug, title, location, excerpt, employment_type, department, team,
 *     seniority_level, comp_band_min/max, comp_currency, comp_equity, comp_note,
 *     published_at, body_markdown, responsibilities[], requirements[], nice_to_haves[]
 *     (all facets NULLABLE → optional in the UI).
 *
 *  🔒 internal-only (never on an unauthenticated endpoint), shown only because the
 *     design renders them: code, band, internalLevel, roleType.
 *
 *  NOTE: the Payload `job` collection (a marketing-copy overlay) was removed; the
 *  recruiting API is now the sole source. The marketing-only fields below
 *  (applyButton/details/teamBox/interviewProcess/openRoles/cta) remain on the type
 *  and render only when the API supplies them.
 * ------------------------------------------------------------------------- */

import type { TypedLocale } from 'payload'

export interface JobInterviewStep {
  id?: string
  title?: string | null
  excerpt?: string | null
  duration?: string | null
}

export interface JobListing {
  // --- ✅ API-backed ---
  slug: string
  title?: string | null
  location?: string | null
  excerpt?: string | null
  employment_type?: string | null // → "Type"
  department?: string | null
  team?: string | null
  seniority_level?: string | null // → "Experience Level" / "Experience"
  comp_band_min?: number | null
  comp_band_max?: number | null
  comp_currency?: string | null
  comp_equity?: string | null
  comp_note?: string | null
  published_at?: string | null
  body_markdown?: string | null
  responsibilities?: string[]
  requirements?: string[]
  nice_to_haves?: string[]

  // --- 🔒 internal-only / display (shown per design) ---
  id?: string
  code?: string | null
  band?: string | null // hero pill, e.g. "L6 (Staff/Principal equivalent)"
  internalLevel?: string | null // apply sidebar "Internal Level"
  roleType?: string | null // apply sidebar "Role Type"

  // --- 🟡 CMS marketing / structure (mock now; later Payload by slug) ---
  applyButton?: { label?: string | null; link?: string | null }
  details?: {
    item1?: { title?: string | null; description?: string | null }
    item2?: { title?: string | null }
    item3?: { title?: string | null }
    item4?: { title?: string | null }
  }
  teamBox?: {
    reportingToName?: string | null
    reportingToRole?: string | null
    podSize?: string | null
    crossFunctional?: string | null
  }
  interviewProcess?: { heading?: string | null; steps?: JobInterviewStep[] | null }
  openRoles?: { heading?: string | null; description?: string | null }
  cta?: {
    subheading?: string | null
    heading?: string | null
    description?: string | null
    backgroundImage?: string | null // url
    button?: { label?: string | null; link?: string | null }
  }
}

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', BDT: '৳', GBP: '£', EUR: '€', INR: '₹' }

/** Format the API comp band (✅ comp_band_min/max/currency) into a display string. */
export function formatComp(min?: number | null, max?: number | null, currency?: string | null): string | null {
  if (min == null && max == null) return null
  const symbol = currency ? (CURRENCY_SYMBOLS[currency] ?? `${currency} `) : ''
  const money = (n: number) => `${symbol}${n.toLocaleString('en-US')}`
  if (min != null && max != null) return `${money(min)} to ${money(max)}`
  return money((min ?? max) as number)
}

const API_BASE = process.env.RECRUIT_API_BASE ?? 'https://api.ternary.solutions/recruit/v1/public'
const REVALIDATE_SECONDS = 300

/** Real `GET /jobs` (ordered published_at desc, then slug). */
export async function fetchJobs(): Promise<JobListing[]> {
  const res = await fetch(`${API_BASE}/jobs`, { next: { revalidate: REVALIDATE_SECONDS } })
  if (!res.ok) return []
  return (await res.json()) as JobListing[]
}

/** Real `GET /jobs/{slug}` (404 → null). */
export async function fetchJob(slug: string): Promise<JobListing | null> {
  const res = await fetch(`${API_BASE}/jobs/${slug}`, { next: { revalidate: REVALIDATE_SECONDS } })
  if (!res.ok) return null // 404 → role not open / no active JD
  return (await res.json()) as JobListing
}

/** ✅ `GET /jobs` — list of open roles, newest first. */
export async function getJobs(): Promise<JobListing[]> {
  const data = await fetchJobs()
  return [...data].sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
}

/** ✅ `GET /jobs/{slug}` — single role (null when not found / not open). */
export async function getJob(slug: string, _locale?: TypedLocale): Promise<JobListing | null> {
  return fetchJob(slug)
}

/** Other open roles — API has no curated relationship, so derive from the list. */
export async function getRelatedJobs(slug: string): Promise<JobListing[]> {
  const jobs = await getJobs()
  return jobs.filter((job) => job.slug !== slug)
}
