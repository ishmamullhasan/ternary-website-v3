import type { Block } from 'payload'

/**
 * Signature homepage hero (WEB-458, CMS-ified). The thesis line + display headline open the page,
 * followed by a grid of "work stream" cards — each a hand-picked published case study, insight, or
 * press release, keyed to a content-type gradient.
 *
 * Previously this was a hardcoded component (`heroFeatured.tsx`) fed by an auto-query: the thesis
 * and headline were English string literals (so they never localized) and the cards were the newest
 * docs rather than an editor's selection. This block puts all three under CMS control:
 *   - thesis / headline → localized text (translate per locale)
 *   - items            → curated relationships, populated at depth 2 by the page query
 * Gradients/tones are still positional (chosen in the component by array index) — the CMS supplies
 * only the content, matching the project's "icons/gradients are positional" convention.
 */
export const HeroFeatured: Block = {
  slug: 'heroFeatured',
  interfaceName: 'HeroFeaturedBlock',
  labels: { singular: 'Hero (Featured)', plural: 'Hero (Featured)' },
  fields: [
    {
      name: 'thesis',
      label: 'Thesis line',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Small line above the headline, e.g. "AI agents do the work. Human orchestrators own the outcome."',
      },
    },
    {
      name: 'headline',
      label: 'Headline',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'Display headline. Each line is rendered on its own row, e.g. "Agentic Engineering." / "Human Orchestration."',
      },
    },
    {
      name: 'items',
      label: 'Featured items',
      type: 'relationship',
      relationTo: ['story', 'insight', 'pressRelease'],
      hasMany: true,
      maxRows: 8,
      admin: {
        description:
          'Up to 8 work cards — case studies, insights, and press releases — shown in display order. Card gradient is assigned positionally.',
      },
    },
  ],
}

export default HeroFeatured
