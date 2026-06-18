import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

// First-party pageview log (WEB-447). One row per pageview, written via the local API from the
// /api/track route with overrideAccess (see src/app/api/track/route.ts) — NOT publicly creatable.
// The in-admin dashboard (admin.components.beforeDashboard) reads + aggregates these rows.
const Analytics: CollectionConfig = {
  slug: 'analytics',
  access: {
    // Reads power the admin dashboard; writes/edits/deletes are staff-only. The public track route
    // is the only creator and it bypasses access via overrideAccess, so create stays authenticated.
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    group: 'System',
    defaultColumns: ['path', 'locale', 'timestamp'],
    useAsTitle: 'path',
    description:
      'First-party pageview log. Rows are written automatically by the site beacon — do not edit by hand. See the dashboard on the admin home for aggregates.',
  },
  fields: [
    {
      name: 'path',
      label: 'Path',
      type: 'text',
      required: true,
    },
    {
      name: 'locale',
      label: 'Locale',
      type: 'text',
    },
    {
      name: 'referrer',
      label: 'Referrer',
      type: 'text',
    },
    {
      name: 'userAgent',
      label: 'User Agent',
      type: 'text',
    },
    {
      name: 'timestamp',
      label: 'Timestamp',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      index: true,
    },
  ],
}

export default Analytics
