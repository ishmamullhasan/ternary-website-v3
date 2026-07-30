import { revalidateTagSafe } from '@/utilities/revalidateTagSafe'
import type { GlobalConfig } from 'payload'

// Every string, label, and href on the unknown-error screen (error.tsx / global-error.tsx).
//
// Error boundaries MUST be Client Components (Next requirement), so unlike the 404 they cannot read
// this global on the server. The copy is fetched at runtime from /api/error-content, and errorComp
// ships a hardcoded English fallback so the screen still renders when the very thing that broke is
// the database. Treat the fields here as the normal case, not the only case.
const LINK_HELP =
  'Locale-less internal path (e.g. /contact) — the /bn prefix is added automatically. External URLs, mailto:, tel: and #anchors also work.'

const ErrorPage: GlobalConfig = {
  slug: 'errorPage',
  label: 'Error Page',
  admin: {
    group: 'Settings',
    description:
      'Everything shown when a page crashes with an unexpected error. Separate from the 404 screen, which has its own global.',
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTagSafe('error-page', { expire: 0 })
      },
    ],
  },
  fields: [
    {
      name: 'statusLabel',
      label: 'Status pill',
      type: 'text',
      localized: true,
      defaultValue: 'runtime.status: exception',
      admin: { description: 'The small monospace pill above the headline.' },
    },
    {
      name: 'headline',
      label: 'Display headline',
      type: 'text',
      localized: true,
      defaultValue: 'UNHANDLED',
      admin: { description: 'The oversized word. Long values shrink to fit, but keep it to one word.' },
    },
    {
      name: 'probingText',
      label: 'Terminal line',
      type: 'text',
      localized: true,
      defaultValue: 'Capturing stack trace and notifying the on-call engineer…',
      admin: { description: 'Monospace line with the blinking caret after it.' },
    },
    {
      name: 'title',
      label: 'Heading',
      type: 'text',
      localized: true,
      defaultValue: 'Something broke on our side.',
    },
    {
      name: 'description',
      label: 'Body copy',
      type: 'textarea',
      localized: true,
      defaultValue:
        'This one is on us, not you. The failure has been logged. Retrying often works — the fault may have been momentary.',
    },
    {
      name: 'retryLabel',
      label: 'Retry button label',
      type: 'text',
      localized: true,
      defaultValue: 'Try again',
      admin: {
        description:
          'The primary button. It re-renders the failed page in place, so it has no link — Next owns that behaviour.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'secondaryLabel',
          label: 'Secondary button label',
          type: 'text',
          localized: true,
          defaultValue: 'Return home',
          admin: { width: '50%' },
        },
        {
          name: 'secondaryLink',
          label: 'Secondary button link',
          type: 'text',
          defaultValue: '/',
          admin: { width: '50%', description: LINK_HELP },
        },
      ],
    },
    {
      name: 'digestLabel',
      label: 'Error reference label',
      type: 'text',
      localized: true,
      defaultValue: 'Reference',
      admin: {
        description:
          'Prefixes the error digest (e.g. "Reference: 1a2b3c"). Next only exposes a digest, never the raw message, so this is safe to show — it is what support quotes back to match the server log. Hidden when there is no digest.',
      },
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
        { name: 'title', label: 'Card title', type: 'text', required: true, localized: true },
        { name: 'link', label: 'Card link', type: 'text', required: true, admin: { description: LINK_HELP } },
      ],
    },
  ],
}

export default ErrorPage
