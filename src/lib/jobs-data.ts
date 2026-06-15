/* ---------------------------------------------------------------------------
 * Recruiting jobs — single source of truth (mock for now)
 * ---------------------------------------------------------------------------
 * Owns its OWN types — intentionally NOT coupled to Payload. The job list,
 * detail, apply form, and careers board all read from here. Swap the getters
 * for real `fetch` to https://api.ternary.solutions/recruit/v1/public when ready.
 *
 *  ✅ API (PublicJobSummary on /jobs, + the rest on /jobs/{slug}):
 *     slug, title, location, excerpt, employment_type, department, team,
 *     seniority_level, comp_band_min/max, comp_currency, comp_equity, comp_note,
 *     published_at, body_markdown, responsibilities[], requirements[], nice_to_haves[]
 *     (all facets NULLABLE → optional in the UI).
 *
 *  🟡 CMS (Payload, keyed by slug) — marketing / structure copy, NOT on the API:
 *     applyButton, details (section titles), teamBox, interviewProcess, openRoles, cta.
 *
 *  🔒 internal-only (never on an unauthenticated endpoint), shown only because the
 *     design renders them: code, band, internalLevel, roleType.
 * ------------------------------------------------------------------------- */

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

export const mockJobs: JobListing[] = [
  {
    // ----- ✅ API -----
    slug: '0f8c2a6e-1d34-4b9a-8e21-5c7f9a0b1d22',
    title: 'Senior Systems Architect',
    location: 'New York, NY / Remote (US)',
    excerpt: 'Own the design of our agentic infrastructure — orchestration, observability, and reliability at scale.',
    employment_type: 'Full Time',
    department: 'Engineering',
    team: 'Agentic Infrastructure',
    seniority_level: 'Senior (8+ years)',
    comp_band_min: 240000,
    comp_band_max: 960000,
    comp_currency: 'BDT',
    comp_equity: '0.05% – 0.15%',
    comp_note: 'Final offer depends on experience and location.',
    published_at: '2026-06-01T09:00:00Z',
    body_markdown:
      'We are looking for a Senior Systems Architect to own the design of our agentic infrastructure — the systems that let autonomous engineering agents run safely in production. You will set the technical direction for orchestration, observability, and reliability across the platform.',
    responsibilities: [
      'Own the architecture of the agentic orchestration platform end-to-end',
      'Define reliability, observability, and rollback strategies for autonomous workloads',
      'Mentor senior engineers and set technical standards across pods',
      'Partner with Product and Research to turn ambiguous goals into shipped systems',
    ],
    requirements: [
      '8+ years building and operating distributed systems at scale',
      'Deep experience with orchestration, queues, and event-driven architectures',
      'Strong track record owning production reliability (SLOs, on-call, incident response)',
      'Fluency designing for failure in multi-tenant environments',
    ],
    nice_to_haves: [
      'Experience with LLM/agent runtimes in production',
      'Postgres internals and query optimization',
      'Prior staff/principal-level scope at a high-growth startup',
    ],
    // ----- 🔒 internal-only / display -----
    id: '0f8c2a6e-1d34-4b9a-8e21-5c7f9a0b1d22',
    code: 'SSA-L6',
    band: 'L6 (Staff/Principal equivalent)',
    internalLevel: 'TC21',
    roleType: 'Individual Contributor',
    // ----- 🟡 CMS marketing / structure -----
    applyButton: { label: 'Apply Now', link: '/job/0f8c2a6e-1d34-4b9a-8e21-5c7f9a0b1d22/apply' },
    details: {
      item1: { title: 'The Mission' },
      item2: { title: "What you'll do" },
      item3: { title: 'Who you are (Must-Haves)' },
      item4: { title: 'Nice-to-Haves' },
    },
    teamBox: {
      reportingToName: 'Jane Doe',
      reportingToRole: 'VP of Engineering',
      podSize: '6–8 engineers',
      crossFunctional: 'Product, Design, Data',
    },
    interviewProcess: {
      heading: 'Interview Process',
      steps: [
        { id: 'ip1', title: 'Initial Screen', excerpt: 'Culture & compensation alignment.', duration: '30m' },
        { id: 'ip2', title: 'Technical Deep Dive', excerpt: 'Systems design discussion.', duration: '60m' },
        { id: 'ip3', title: 'Architecture Review', excerpt: 'Real-world problem walkthrough.', duration: '60m' },
        { id: 'ip4', title: 'Final / Values', excerpt: 'Meet the leadership team.', duration: '45m' },
      ],
    },
    openRoles: {
      heading: 'Other Open Roles',
      description:
        'Openings for engineers wanting production ownership, technical growth, and operational impact. Roles include client collaboration, architecture, and system responsibility.',
    },
    cta: {
      subheading: 'Not the right fit?',
      heading: 'See all open roles',
      description: 'We are always looking for engineers who care about production ownership and technical depth.',
      backgroundImage: null,
      button: { label: 'Browse Careers', link: '/careers' },
    },
  },
  {
    slug: '3a1b5c7d-2e46-4f8a-9b01-6d2e8f0a3c14',
    title: 'Software Engineer',
    location: 'Dhaka, Bangladesh',
    excerpt: 'Format: Hybrid · Location: Dhaka, Bangladesh · 1 to 3 Years · Individual Contributor · Full Time.',
    employment_type: 'Full Time',
    department: 'Engineering',
    team: 'Platform',
    seniority_level: '1 to 3 Years',
    comp_band_min: 360000,
    comp_band_max: 1080000,
    comp_currency: 'BDT',
    comp_equity: null,
    comp_note: null,
    published_at: '2026-05-20T09:00:00Z',
    body_markdown: 'Build and ship production services on our backend platform alongside a small, senior pod.',
    responsibilities: ['Ship backend features end-to-end', 'Own services in production'],
    requirements: ['1–3 years backend experience', 'Strong SQL'],
    nice_to_haves: ['FastAPI', 'Postgres'],
    id: '3a1b5c7d-2e46-4f8a-9b01-6d2e8f0a3c14',
    code: 'ENCS3X',
    internalLevel: 'TC18',
    roleType: 'Individual Contributor',
  },
  {
    slug: '6b2d4e8f-3a57-41c9-8d12-7e3f0a1b4c25',
    title: 'Software Engineer',
    location: 'Dhaka, Bangladesh',
    excerpt: 'Format: Hybrid · Location: Dhaka, Bangladesh · 1 to 3 Years · Individual Contributor · Full Time.',
    employment_type: 'Full Time',
    department: 'Engineering',
    team: 'Product',
    seniority_level: '1 to 3 Years',
    comp_band_min: 360000,
    comp_band_max: 1080000,
    comp_currency: 'BDT',
    comp_equity: null,
    comp_note: null,
    published_at: '2026-05-18T09:00:00Z',
    body_markdown: 'Craft polished, accessible product UI in Next.js with a design-minded engineering team.',
    responsibilities: ['Build product UI in Next.js', 'Collaborate closely with design'],
    requirements: ['1–3 years frontend experience', 'Strong TypeScript + React'],
    nice_to_haves: ['Tailwind', 'Motion / animation'],
    id: '6b2d4e8f-3a57-41c9-8d12-7e3f0a1b4c25',
    code: 'ENCS3X',
    internalLevel: 'TC18',
    roleType: 'Individual Contributor',
  },
]

/* ---------------------------------------------------------------------------
 * Live API ↔ mock toggle
 * ---------------------------------------------------------------------------
 * Default = mock (so the UI renders without a backend). To use the real API,
 * in each getter below: comment the `data = mock…` line and uncomment the
 * `data = await fetch…` line. Nothing else changes — same shapes, same callers.
 * ------------------------------------------------------------------------- */
const API_BASE = 'https://api.ternary.solutions/recruit/v1/public'
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
  const data = mockJobs
  // const data = await fetchJobs()
  return [...data].sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
}

/** ✅ `GET /jobs/{slug}` — single role (null when not found / not open). */
export async function getJob(slug: string): Promise<JobListing | null> {
  const data = mockJobs.find((job) => job.slug === slug) ?? null
  // const data = await fetchJob(slug)
  return data
}

/** Other open roles — API has no curated relationship, so derive from the list. */
export async function getRelatedJobs(slug: string): Promise<JobListing[]> {
  const jobs = await getJobs()
  return jobs.filter((job) => job.slug !== slug)
}
