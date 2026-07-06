import type { GlobalConfig } from 'payload'

/**
 * Ops switches — operational toggles editors can flip without a deploy. Currently just the
 * `?reval=1` query-param revalidation (middleware → /next/revalidate?path=…); keep it OFF unless
 * actively needed, since while on anyone can force cache-busting re-renders of public pages.
 */
const Ops: GlobalConfig = {
  slug: 'ops',
  label: 'Ops Switches',
  admin: {
    group: 'Settings',
    description: 'Operational toggles. These take effect immediately — no deploy needed.',
  },
  fields: [
    {
      name: 'queryRevalidation',
      label: 'Allow ?reval=1 page revalidation',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'When on, visiting any page with ?reval=1 instantly busts its cache and re-renders it fresh. ' +
          'Leave off normally — while on, anyone (not just admins) can trigger re-renders.',
      },
    },
  ],
}

export default Ops
