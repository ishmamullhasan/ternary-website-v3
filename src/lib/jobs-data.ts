/* ---------------------------------------------------------------------------
 * Recruiting jobs — single source of truth (live recruiting API)
 * ---------------------------------------------------------------------------
 * Owns its OWN types — intentionally NOT coupled to Payload. The job list,
 * detail, apply form, and careers board all read from here. The getters fetch
 * the public recruiting API (RECRUIT_API_BASE) and merge Payload CMS copy on
 * top for the detail view.
 *
 *  ✅ API (PublicJobSummary on /jobs, + the rest on /jobs/{slug}):
 *     slug, title, location, excerpt, employment_type, department, team,
 *     seniority_level, comp_band_min/max, comp_currency, comp_equity, comp_note,
 *     published_at, body_markdown, responsibilities[], requirements[], nice_to_haves[]
 *     (all facets NULLABLE → optional in the UI).
 *
 *  🟡 CMS (Payload `job` collection) — marketing / structure copy, NOT on the API:
 *     applyButton, details (section titles), teamBox, interviewProcess, openRoles, cta.
 *     Merged in by getJob() via mergeJobCms() — see the keying note on that helper.
 *
 *  🔒 internal-only (never on an unauthenticated endpoint), shown only because the
 *     design renders them: code, band, internalLevel, roleType.
 * ------------------------------------------------------------------------- */

import type { Job, Media } from '@/payload-types'
import config from '@payload-config'
import { getPayload, type TypedLocale, type Where } from 'payload'

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

/* ---------------------------------------------------------------------------
 * 🟡 CMS marketing merge
 * ---------------------------------------------------------------------------
 * KEYING ASSUMPTION: the recruiting API's `code` (an opaque role code, e.g.
 * "SSA-L6") is the join key to the Payload `job` collection. The Payload slug is
 * derived FROM `code` (`slugField({ fieldToUse: 'code' })`), whereas the API's
 * `slug` is an opaque UUID — so the two `slug` fields do NOT line up and must not
 * be matched on. We therefore match on `code` (and fall back to `slug` only if an
 * API role ever ships without a code). If a CMS doc is found, its marketing-only
 * fields (applyButton/details/teamBox/interviewProcess/openRoles/cta) are layered
 * onto the API result; the API stays authoritative for every API-backed key, so a
 * stale/duplicate CMS title or location can never override live data.
 * ------------------------------------------------------------------------- */

/** Resolve a Payload media `url` whether the relationship is populated (depth>0) or an id string. */
function mediaUrl(value: (string | null) | Media | undefined): string | null {
  if (value && typeof value === 'object') return value.url ?? null
  return null
}

/** Map Payload interview steps (id is nullable) onto JobListing's step shape. */
function mapSteps(steps: NonNullable<Job['interviewProcess']>['steps']): JobInterviewStep[] | null {
  if (!steps) return null
  return steps.map((step) => ({
    id: step.id ?? undefined,
    title: step.title,
    excerpt: step.excerpt,
    duration: step.duration,
  }))
}

/**
 * Layer the Payload `job` doc's marketing fields onto an API-backed JobListing.
 * API fields win for every API-backed key; the CMS only supplies the marketing
 * keys the API does not expose. Optional `locale` is threaded to payload.find for
 * forward-compat with localization (job copy is identical across locales today).
 */
export async function mergeJobCms(api: JobListing, locale?: TypedLocale): Promise<JobListing> {
  const payload = await getPayload({ config })
  const where: Where = api.code
    ? { code: { equals: api.code } } // primary join key (see KEYING ASSUMPTION above)
    : { slug: { equals: api.slug } } // fallback only when the API role has no code
  const result = await payload.find({
    collection: 'job',
    where,
    limit: 1,
    depth: 1, // populate cta.backgroundImage so we can read its url
    ...(locale ? { locale } : {}),
  })
  const cms = result.docs[0]
  if (!cms) return api

  // CMS provides only the marketing keys; API stays authoritative for its own fields.
  return {
    ...api,
    applyButton: cms.button ?? api.applyButton,
    details: cms.details ?? api.details,
    teamBox: cms.teamBox ?? api.teamBox,
    interviewProcess: cms.interviewProcess
      ? { heading: cms.interviewProcess.heading, steps: mapSteps(cms.interviewProcess.steps) }
      : api.interviewProcess,
    openRoles: cms.openRoles
      ? { heading: cms.openRoles.heading, description: cms.openRoles.description }
      : api.openRoles,
    cta: cms.cta
      ? {
          subheading: cms.cta.subheading,
          heading: cms.cta.heading,
          description: cms.cta.description,
          backgroundImage: mediaUrl(cms.cta.backgroundImage),
          button: cms.cta.button,
        }
      : api.cta,
  }
}

/** ✅ `GET /jobs` — list of open roles, newest first. */
export async function getJobs(): Promise<JobListing[]> {
  const data = await fetchJobs()
  return [...data].sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
}

/** ✅ `GET /jobs/{slug}` — single role (null when not found / not open), with CMS copy merged in. */
export async function getJob(slug: string, locale?: TypedLocale): Promise<JobListing | null> {
  const api = await fetchJob(slug)
  if (!api) return null
  return mergeJobCms(api, locale)
}

/** Other open roles — API has no curated relationship, so derive from the list. */
export async function getRelatedJobs(slug: string): Promise<JobListing[]> {
  const jobs = await getJobs()
  return jobs.filter((job) => job.slug !== slug)
}
