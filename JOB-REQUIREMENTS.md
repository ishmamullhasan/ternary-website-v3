# Job Pages — API Field Status

Pages: `careers` (list), `job/[slug]` (detail), `job/[slug]/apply` (form).
All data flows through `src/lib/jobs-data.ts` (mock now → real API via toggle).

Base URL: `https://api.ternary.solutions/recruit/v1/public`
Endpoints: `GET /jobs` · `GET /jobs/{slug}` · `POST /applications/{slug}`

---

## ✅ Available from API (live)

`slug` · `title` · `location` · `excerpt` · `employment_type` · `department` · `team` ·
`seniority_level` · `comp_band_min` · `comp_band_max` · `comp_currency` · `comp_equity` ·
`comp_note` · `published_at` · `body_markdown` · `responsibilities[]` · `requirements[]` · `nice_to_haves[]`

> All nullable → treated as optional in the UI.

---

## ❌ Missing from API — needs to be added

Currently sourced from mock/CMS. To drop the CMS dependency, add these to the API (keyed by `slug`):

| Field                                                                                  | Used for                        | Notes                                          |
| -------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------- |
| `apply_button` `{ label, link }`                                                       | Detail "Apply Now" override     | optional; defaults to `/job/{slug}/apply`      |
| `section_titles` `{ mission, responsibilities, requirements, nice_to_haves }`          | Custom JD section headings      | falls back to defaults                         |
| `team_box` `{ reporting_to_name, reporting_to_role, pod_size, cross_functional }`      | Detail "The Team" sidebar       |                                                |
| `interview_process` `{ heading, steps[] { title, excerpt, duration } }`                | Interview Process section       |                                                |
| `open_roles` `{ heading, description }`                                                | "Other Open Roles" section copy | role list itself comes from `GET /jobs`        |
| `cta` `{ subheading, heading, description, background_image, button { label, link } }` | Detail CTA block                |                                                |
| `band`                                                                                 | Apply hero pill ("Band: …")     | currently 🔒 internal                          |
| `role_type`                                                                            | Apply sidebar "Role Type"       |                                                |
| `internal_level`                                                                       | Apply sidebar "Internal Level"  | currently 🔒 internal                          |
| `code`                                                                                 | Detail badge + tile badge       | currently 🔒 internal — decide expose vs. drop |

---

## ❌ Apply form — POST `/applications/{slug}` not wired

Needs from the API doc (`service/docs/recruiting-public-api.md`):

1. **Request body schema** — to map the 26 form fields in `applyForm.tsx` (`initialState`).
2. **File uploads** — `resume` / `cover_letter` (JSON endpoint can't carry files → multipart / pre-signed URL).
3. **Validation error response** shape.

---

## Also TODO (frontend)

- Render `body_markdown` as real Markdown (currently plain paragraphs).
- Flip mock → live API: uncomment the `fetch` lines in `jobs-data.ts` (GET) and `applyForm.tsx` (POST).
