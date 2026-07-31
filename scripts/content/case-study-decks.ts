/**
 * Case-study write-ups transcribed from the six client decks (Frame 427322179–184), plus the
 * mockup that ships with each one.
 *
 * The section set is the decks' own: Client / Segment · Problem · Solution · Tech Stack · Impact ·
 * Why it matters. It replaces the older four-part write-up (The challenge / Our approach / What we
 * built / Outcome) because the decks are the source the client signed off on.
 *
 * TURFLY IS DELIBERATELY PARTIAL — see the note on its entry. Its deck is internally inconsistent
 * and publishing it whole would put a factual error on the site.
 *
 * English only. Payload's localization runs with `fallback: true`, so `bn` serves the English
 * string rather than an empty page — but a Bengali reader gets English until these are translated.
 */

export interface DeckSection {
  heading: string
  body: string
}

export interface CaseStudyDeck {
  slug: string
  /** Filename of the mockup extracted from the deck. */
  image: string
  /** Real alt text — what the mockup actually shows, not a restatement of the title. */
  alt: string
  caption: string
  sections: DeckSection[]
  /** Sections of the deck NOT imported, and why. Kept in-repo so the omission is reviewable. */
  withheld?: string
}

export const CASE_STUDY_DECKS: CaseStudyDeck[] = [
  {
    slug: 'hissho-sushiops360',
    image: 'Frame427322184_0_2048x2048.jpg',
    alt: 'The SushiOps360 dashboard, showing store-level sushi sales, shrinkage and inventory-outlook panels beside a low-inventory alert and an AI assistant prompt.',
    caption: 'SushiOps360 — the store dashboard, with inventory alerts and the assistant in the same surface.',
    sections: [
      {
        heading: 'Client / Segment',
        body: 'Hissho supports a large franchise network and regional field teams that require consistent execution across thousands of locations. The segment demands systems that combine usability in active store environments with enterprise-grade control and traceability.',
      },
      {
        heading: 'Problem',
        body: 'The core challenge was the last-mile gap between insight generation and day-to-day action. Without a coherent application plane, franchisees and regionals face fragmented tools, inconsistent decision-making, and limited feedback loops for continuous improvement.',
      },
      {
        heading: 'Solution',
        body: 'Ternary implemented role-aware user experiences for production planning, dashboards, ordering support, information retrieval, regional coaching insights, and communication workflows. The application layer integrated with required enterprise systems and embedded governance patterns such as permissions, auditable actions, and controlled overrides.',
      },
      {
        heading: 'Tech Stack',
        body: 'The solution context includes mobile-first app delivery, RBAC-driven workflow orchestration, secure integration touchpoints across core systems, and app-layer governance controls for auditability and operational reliability.',
      },
      {
        heading: 'Impact',
        body: 'The delivered layer creates a practical execution surface that helps users act on recommendations faster and more consistently. Program-level KPI targets are defined in requirements, but publicly verified realized metrics are not disclosed in available source material.',
      },
      {
        heading: 'Why it matters',
        body: 'In franchise operations, value is created when intelligence becomes repeatable field behavior. This application layer is the bridge that converts AI potential into accountable, daily execution.',
      },
    ],
  },

  {
    slug: 'doyouwork',
    image: 'Frame427322183_0_2428x1760.jpg',
    alt: 'The DoYouWork daily scheduling board, showing a week of technician assignments in columns with crew avatars and vehicle allocations against each job.',
    caption: 'DoYouWork — the daily scheduling board managers run the week from.',
    sections: [
      {
        heading: 'Client / Segment',
        body: 'Amistee Air Duct Insulation & Cleaning — Novi, Michigan; field service. The client needed a solution that would serve both field employees requiring self-service tools and managers needing centralized, real-time operational visibility.',
      },
      {
        heading: 'Problem',
        body: 'Field service managers lacked a real-time, unified view of daily operations — schedules, vehicle assignments, approval statuses. Employees had no self-service for essential requests (expenses, spiffs, time-off, tools and clothing), relying on slow paperwork.',
      },
      {
        heading: 'Solution',
        body: 'Ternary delivered a three-app ecosystem: a native-quality mobile employee app (Capacitor), a web admin portal for managers, and a scalable FastAPI backend. Features include Role-Based Access Control (RBAC), location-based data scoping, multi-tenant architecture, real-time WebSocket notifications, and secure AWS S3 integration for approval workflows.',
      },
      {
        heading: 'Tech Stack',
        body: 'The platform leverages modern, high-performance technologies: React 19 for the web portal, Capacitor for the mobile application, FastAPI for the backend API, PostgreSQL as the primary database, Redis for caching and sessions, and AWS for hosting and file storage.',
      },
      {
        heading: 'Impact',
        body: 'The project successfully launched a unified, mobile digital platform, replacing manual processes with real-time operational visibility and location-based manager approvals. This self-service solution, featuring robust RBAC and multi-tenancy, offers a scalable, extensible foundation for future growth, particularly for field technicians.',
      },
      {
        heading: 'Why it matters',
        body: 'Platform consolidation in field service immediately provided real-time operational visibility and workflow efficiency, replacing fragmented tools and paper-based processes.',
      },
    ],
  },

  {
    slug: 'farogl-odoo-erp',
    image: 'Frame427322182_0_2960x1440.jpg',
    alt: 'The Odoo 18 module workspace for FAR Oil & Gas, showing Accounting, CRM, Sales, Manufacturing, Inventory, Purchase and Website apps laid out as installable tiles.',
    caption: 'The Odoo module estate — mapped to validated workflows before anything was configured.',
    sections: [
      {
        heading: 'Client / Segment',
        body: 'The client operates in oil and gas, where financial accuracy, approval rigor, and cross-functional process traceability are core operating requirements. The segment demands systems that can scale without weakening governance.',
      },
      {
        heading: 'Problem',
        body: 'FAROGL faced fragmented workflows and inconsistent process enforcement across key operational areas. Manual handoffs and disconnected practices increased reconciliation effort, slowed cycle times, and constrained enterprise-level visibility.',
      },
      {
        heading: 'Solution',
        body: 'Ternary executed a phased Odoo program starting with structured requirements discovery, management alignment, and process baseline definition. Module planning and implementation were mapped to validated workflows, with selective configuration and controlled extension to preserve maintainability and adoption quality.',
      },
      {
        heading: 'Tech Stack',
        body: 'The solution is centered on Odoo with a phased delivery model that combines requirements engineering, process mapping, backlog-driven implementation, and readiness validation.',
      },
      {
        heading: 'Impact',
        body: 'The program established a coherent ERP foundation and a lower-risk path for enterprise-wide standardization. Public quantitative KPIs are not disclosed, but the delivered approach materially improves process clarity, governance confidence, and readiness for broader digital scaling.',
      },
      {
        heading: 'Why it matters',
        body: 'In control-sensitive industries, ERP value comes from reliable process behavior and sustained adoption, not feature volume. This implementation created the operational backbone required for disciplined execution and future transformation.',
      },
    ],
  },

  {
    slug: 'flex5',
    image: 'Frame427322181_0_1408x3052.jpg',
    alt: 'Flex5 mobile screens: a metabolic nutrition score with a logged breakfast, a biometrics panel tracking weight, A1c and blood pressure, and a gym finder listing nearby facilities.',
    caption: 'Flex5 — daily guidance, biometrics and discovery in one mobile surface.',
    sections: [
      {
        heading: 'Client / Segment',
        body: 'Reality Meets Science operates in digital health and lifestyle technology with both direct-user and enterprise commercialization goals. The product needed to satisfy two audiences simultaneously: users who expect intuitive daily guidance and enterprise stakeholders who require HIPAA-aligned operational rigor.',
      },
      {
        heading: 'Problem',
        body: 'RMS had strong product vision and market intent, but needed a production-capable platform that could launch quickly without creating compliance or architecture debt. The challenge was to deliver immediate functionality while preserving extensibility for future modules, integrations, and distribution partnerships.',
      },
      {
        heading: 'Solution',
        body: 'Ternary built the application and platform layer end to end: a mobile-first user experience, secure backend services, and an extensible AI orchestration layer. The first shipped capabilities included AI-guided coaching workflows and personalized engagement automation informed by behavior and account context, implemented on reusable platform foundations.',
      },
      {
        heading: 'Tech Stack',
        body: 'The solution includes a mobile application layer, HIPAA-aligned secure service architecture, and a modular AI application and orchestration layer designed for controlled, scalable rollout of additional coaching and engagement functions.',
      },
      {
        heading: 'Impact',
        body: 'The project kicked off and delivered what was discussed, converting strategy into a launch-ready system with clear expansion paths. Flex5 now has a credible product and architecture base for enterprise conversations, partner development, and iterative feature growth. Public quantitative KPIs are not disclosed, so impact is presented in terms of delivered capability and market readiness.',
      },
      {
        heading: 'Why it matters',
        body: 'This case demonstrates disciplined digital health execution: launch speed without sacrificing trust, and innovation without sacrificing governance. Flex5 is now positioned as a platform business with compounding product leverage rather than a one-off feature release.',
      },
    ],
  },

  {
    slug: 'alley-analytix',
    image: 'Frame427322180_2_1920x1080.jpg',
    alt: "A coach's dashboard listing today's athlete activity — completed sessions, ratings and practice footage — beside league standings and upcoming bookings.",
    caption: 'The coach view — longitudinal athlete tracking rather than raw telemetry.',
    sections: [
      {
        heading: 'Client / Segment',
        body: 'Alley Analytix operates in sports performance technology for competitive bowling. The product needed to serve two stakeholders: players who require real-time feedback on throw mechanics (speed, RPM, phase-state), and coaches who need longitudinal performance tracking and actionable training insights.',
      },
      {
        heading: 'Problem',
        body: 'Bowling analytics relied on expensive fixed infrastructure, limiting accessibility. Players and coaches needed performance data without prohibitive costs or stationary system constraints. Existing solutions forced trade-offs between affordability and analytical fidelity. The market needed portable technology preserving signal quality while delivering coaching intelligence, not just raw telemetry.',
      },
      {
        heading: 'Solution',
        body: 'Ternary built the end-to-end platform: purpose-built finger-grip hardware, real-time sensor processing for motion analytics, cloud infrastructure for high-concurrency ingestion, coaching dashboards for longitudinal tracking, and a context-aware AI assistant that translates data into coaching recommendations. The system includes OTA firmware updates and scalable analytics supporting thousands of simultaneous players.',
      },
      {
        heading: 'Tech Stack',
        body: 'Custom embedded hardware (finger-grip sensor), real-time motion processing, cloud data ingestion, coaching dashboards, AI assistant, OTA firmware updates, scalable analytics platform, and mobile and web interfaces.',
      },
      {
        heading: 'Impact',
        body: 'Alley Analytix shifted bowling analytics to portable coaching intelligence via miniaturized finger-grip hardware, maintaining fidelity for longitudinal tracking, complemented by an AI assistant for context-aware support, all on a scalable cloud architecture.',
      },
      {
        heading: 'Why it matters',
        body: 'Alley Analytix combines co-designed hardware and intelligent software to deliver accessible, precise performance analytics for niche sports. The platform demonstrates that portability and analytical accuracy are mutually achievable, paving the way for multi-sport growth and enhanced performance data utility for coaching.',
      },
    ],
  },

  {
    /**
     * TURFLY — TWO SECTIONS ONLY, AND THAT IS DELIBERATE.
     *
     * The Turfly deck is internally inconsistent. Its title, Solution, Tech Stack, Impact and
     * "Why it matters" describe an AI-powered CORPORATE TRAVEL AND EXPENSE platform — travellers,
     * finance teams, OCR receipt capture, multi-currency, policy compliance — while its
     * Client / Segment and Problem sections describe a SPORTS-FACILITY BOOKING MARKETPLACE in
     * Bangladesh, which is what Turfly is, what the site already says it is, and what the deck's
     * own mockup shows (a green turf-booking app with "Book Now" and futsal listings). Its lead
     * paragraph is a verbatim copy of the Flex5 deck's lead paragraph, which is the tell: sections
     * were pasted in from other documents.
     *
     * So the two sections that match the product are imported, and the four that describe a
     * different product are withheld rather than published — the existing write-up covers that
     * ground correctly. Publishing them would put a factual error about a named client on a live
     * page. Restore them here if the deck turns out to be right and the site wrong.
     */
    slug: 'turfly',
    image: 'Frame427322179_0_2048x2048.jpg',
    alt: 'The Turfly booking app on two phones: a futsal venue listing with a discount badge, and a prominent Book Now action over a pitch photograph.',
    caption: 'Turfly — venue discovery through to instant confirmation.',
    withheld:
      'Solution, Tech Stack, Impact, Why it matters — the deck describes a corporate travel and expense product, not this one.',
    sections: [
      {
        heading: 'Client / Segment',
        body: 'Sports facility marketplace serving players who need instant booking confirmation and turf operators who require utilization optimization, dynamic pricing, and demand visibility.',
      },
      {
        heading: 'Problem',
        body: "Sports facility booking in Bangladesh relied on fragmented manual processes, phone-based availability checks, and delayed confirmations. Operators faced low utilization rates, revenue leakage from booking errors, and zero real-time demand visibility. The market needed instant booking confirmation, integrated payments across Bangladesh's fragmented landscape, and dynamic pricing adjusting to demand patterns.",
      },
    ],
  },
]
