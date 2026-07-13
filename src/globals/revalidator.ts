import type { GlobalConfig } from 'payload'

/**
 * Revalidator — the admin screen for rebuilding the site's cache (Settings → Revalidator).
 *
 * Published content is served from Next's Data Cache and only refreshed when something calls
 * `revalidateTag`. Editing a doc in the admin fires that automatically (each collection/global has
 * an afterChange hook), but a write that happens *outside* a Next request cannot — a seed or ops
 * script writing straight to Mongo, a bulk import, a document restored from a version. In those
 * cases production keeps serving the old copy indefinitely, and this screen is how an editor forces
 * it to re-read from Payload: whole site, or just the collections/globals that actually changed.
 *
 * This global deliberately holds NO data. Its only field is a `ui` field mounting the panel, and the
 * Save button is overridden away (see NoSaveButton) — the buttons in the panel call server actions
 * directly. It is a global rather than a custom admin view purely so it lands in the Settings nav
 * group alongside Ops Switches, where editors already look for this kind of thing.
 */
const Revalidator: GlobalConfig = {
  slug: 'revalidator',
  label: 'Revalidator',
  admin: {
    group: 'Settings',
    description:
      'Rebuild the live site’s cached content from Payload. Use it when the production site is not showing a change you have already published.',
    hideAPIURL: true,
    components: {
      // Nothing to save — the panel's own buttons do the work. See NoSaveButton.
      elements: {
        SaveButton: '@/components/admin/revalidate/NoSaveButton',
      },
    },
  },
  fields: [
    {
      name: 'panel',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/revalidate/RevalidatorPanel',
        },
      },
    },
  ],
}

export default Revalidator
