import { makeContentCollection } from '@/collections/makeContentCollection'

export default makeContentCollection('solution', {
  group: 'Content',
  description: 'Solution offerings and their landing content.',
  defaultColumns: ['title', 'slug', 'updatedAt'],
  // Stage 8 — the seven-section solution detail template, as structured editable fields:
  // 01 hero (h1 = title; defn/intro/meta here) · 02 position (pull + two paragraphs) ·
  // 03 how it runs (five phases + plain-terms callout) · 04 what you walk away with ·
  // 05 proof (story links or an honest note) · 06 capabilities this draws on · 07 CTA.
  extraFields: [
    {
      name: 'detail',
      label: 'Detail page (Stage 8 template)',
      type: 'group',
      fields: [
        {
          name: 'h1',
          label: 'Detail h1 (sentence headline)',
          type: 'text',
          localized: true,
          admin: { description: 'The detail page headline (e.g. "Take an idea to a real product."). The canonical `title` stays the nav/footer/card name.' },
        },
        { name: 'defn', label: 'One-line definition', type: 'text', localized: true },
        { name: 'intro', label: 'Intro paragraph', type: 'textarea', localized: true },
        {
          type: 'row',
          fields: [
            { name: 'metaModels', label: 'Engagement models', type: 'text', admin: { width: '33%' } },
            { name: 'metaShape', label: 'Typical shape', type: 'text', localized: true, admin: { width: '33%' } },
          ],
        },
        {
          name: 'drawsOn',
          label: 'Draws on (capabilities)',
          type: 'relationship',
          relationTo: 'capability' as never,
          hasMany: true,
        },
        {
          name: 'pull',
          label: 'Position pull-quote',
          type: 'text',
          localized: true,
          admin: { description: 'Wrap the emphasised span in *asterisks* — it renders italic.' },
        },
        { name: 'positionA', label: 'Position paragraph 1', type: 'textarea', localized: true },
        { name: 'positionB', label: 'Position paragraph 2', type: 'textarea', localized: true },
        {
          name: 'phases',
          label: 'How it runs (phases)',
          type: 'array',
          maxRows: 6,
          fields: [
            { name: 'title', label: 'Phase', type: 'text', localized: true },
            { name: 'body', label: 'Body', type: 'textarea', localized: true },
          ],
        },
        { name: 'plainTerms', label: '"In plain terms" callout', type: 'textarea', localized: true },
        {
          name: 'walkAway',
          label: 'What you walk away with',
          type: 'array',
          maxRows: 6,
          fields: [
            { name: 'title', label: 'Item', type: 'text', localized: true },
            { name: 'body', label: 'Body', type: 'textarea', localized: true },
          ],
        },
        {
          name: 'proof',
          label: 'Proof (case studies)',
          type: 'relationship',
          relationTo: 'story' as never,
          hasMany: true,
        },
        {
          name: 'proofNote',
          label: 'Proof note (honest-empty / under-NDA)',
          type: 'textarea',
          localized: true,
          admin: { description: 'Shown alongside (or instead of) linked proof — e.g. the named-with-permission or under-NDA block.' },
        },
        { name: 'ctaHeading', label: 'CTA heading', type: 'text', localized: true },
        { name: 'ctaLine', label: 'CTA line', type: 'textarea', localized: true },
      ],
    },
  ],
})
