import type { JSX } from 'react'

/**
 * Server component that renders a single JSON-LD <script>. Inline the structured-data object built
 * by the helpers in src/lib/seo/jsonLd.ts.
 *
 * Security: escape '<' to its unicode form so a string value containing "</script>" (or any markup)
 * can't break out of the script element.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }): JSX.Element {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
