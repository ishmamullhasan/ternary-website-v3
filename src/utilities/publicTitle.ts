/**
 * Strip internal seniority markers from a public-facing title (Stage 6.4).
 *
 * HR data carries level markers — "Software Engineer I", "Accountant I", "Backend Engineer
 * (Level 31)" — that mean nothing to visitors and read as banding leaks. This removes them for
 * DISPLAY only; the CMS/API data is untouched, and job codes keep the level.
 *
 *   "Software Engineer I"        → "Software Engineer"
 *   "Software Engineer II"       → "Software Engineer"
 *   "Backend Engineer (Level 31)"→ "Backend Engineer"
 *   "Product Designer"           → unchanged
 */
export function stripPublicLevel(title: string | null | undefined): string {
  if (!title) return ''
  return title
    .replace(/\s*\(\s*Level\s*\d+\s*\)\s*/gi, ' ')
    .replace(/\s+(?:I{1,3}|IV|V)\s*$/u, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
