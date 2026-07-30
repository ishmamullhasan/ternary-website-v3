import { revalidateTagSafe } from '@/utilities/revalidateTagSafe'
import type { GlobalConfig } from 'payload'

// Every string, label, and href on the 404 page. The page itself is a Server Component that reads
// this global for BOTH locales at once (it gets no `params` — see [locale]/not-found.tsx), so keep
// the shape flat and cheap.
//
// Hrefs are stored LOCALE-LESS (`/stories`, not `/bn/stories`). The component runs them through
// `localizedHref`, which adds the `/bn` prefix when needed and passes external URLs, `mailto:`,
// `tel:`, and `#anchors` straight through. Storing a prefixed path here would double-prefix.
const LINK_HELP =
  'Locale-less internal path (e.g. /stories) — the /bn prefix is added automatically. External URLs, mailto:, tel: and #anchors also work.'

const NotFound: GlobalConfig = {
  slug: 'notFound',
  label: '404 Page',
  admin: {
    group: 'Settings',
    description:
      'Everything shown on the 404 (page-not-found) screen. The header and footer come from their own globals.',
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTagSafe('not-found', { expire: 0 })
      },
    ],
  },
  fields: [
    {
      name: 'statusLabel',
      label: 'Status pill',
      type: 'text',
      localized: true,
      defaultValue: 'route.status: unresolved',
      admin: { description: 'The small monospace pill above the headline.' },
    },
    {
      name: 'headline',
      label: 'Display headline',
      type: 'text',
      localized: true,
      defaultValue: 'UNORCHESTRATED',
      admin: { description: 'The oversized word. Long values shrink to fit, but keep it to one word.' },
    },
    {
      name: 'probingText',
      label: 'Terminal line',
      type: 'text',
      localized: true,
      defaultValue: 'Searching orchestration graph for this route…',
      admin: { description: 'Monospace line with the blinking caret after it.' },
    },
    {
      name: 'title',
      label: 'Heading',
      type: 'text',
      localized: true,
      defaultValue: "This route didn't ship.",
    },
    {
      name: 'description',
      label: 'Body copy',
      type: 'textarea',
      localized: true,
      defaultValue:
        "The page you're looking for was either never deployed, deprecated, or the URL took a wrong turn somewhere upstream.",
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primaryLabel',
          label: 'Primary button label',
          type: 'text',
          localized: true,
          defaultValue: 'Return home',
          admin: { width: '50%' },
        },
        {
          name: 'primaryLink',
          label: 'Primary button link',
          type: 'text',
          defaultValue: '/',
          admin: { width: '50%', description: LINK_HELP },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'secondaryLabel',
          label: 'Secondary button label',
          type: 'text',
          localized: true,
          defaultValue: 'View recent work',
          admin: { width: '50%' },
        },
        {
          name: 'secondaryLink',
          label: 'Secondary button link',
          type: 'text',
          defaultValue: '/stories',
          admin: { width: '50%', description: LINK_HELP },
        },
      ],
    },
    {
      name: 'cards',
      label: 'Recovery cards',
      type: 'array',
      maxRows: 4,
      admin: {
        description: 'The cards below the buttons. Three fit the row on desktop; a fourth wraps.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'eyebrow',
          label: 'Eyebrow',
          type: 'text',
          localized: true,
          admin: { description: 'Small monospace label — conventionally the route, e.g. "contact".' },
        },
        {
          name: 'title',
          label: 'Card title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'link',
          label: 'Card link',
          type: 'text',
          required: true,
          admin: { description: LINK_HELP },
        },
      ],
    },
  ],
}

export default NotFound
