import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * Append-only audit trail. One row per write to any collection or global: who did it, when, from
 * where, and exactly which fields changed.
 *
 * Rows are written by the activity-log plugin (src/plugins/activityLog.ts), which walks the whole
 * config and hangs hooks off every collection and global — including the ones other plugins create
 * (`forms`, `search`). Nothing writes here by hand.
 *
 * "Append-only" is enforced two ways: `update`/`delete` access are hard `false` (not `isAdmin` — an
 * audit trail an admin can quietly rewrite is not an audit trail), and `create` is `false` too, so
 * the admin UI offers no New button. The plugin's own writes go through the Local API with
 * `overrideAccess: true`, which is unaffected by any of that.
 */
const ActivityLog: CollectionConfig = {
  slug: 'activityLog',
  labels: {
    singular: 'Activity Log Entry',
    plural: 'Activity Log',
  },
  access: {
    // Any signed-in staff member, deliberately — NOT `isAdmin`, which is what `analytics` uses.
    //
    // Two reasons. Practically: with SSO auto-provisioning every account lands as 'editor', and no
    // account currently holds `role: 'admin'`, so an isAdmin gate would hide this collection from
    // the entire team (the admin NAV gates on read access, so an unreadable collection is an absent
    // one). Substantively: an audit trail visible only to the people most able to abuse it is worth
    // less than one the whole team can see.
    //
    // The trade-off, worth being explicit about: a log row carries the before/after values of the
    // fields it records, so read access here is effectively read access to the content history of
    // every collection. That is fine for editors, who can already read that content. Auth material
    // is redacted by the differ and never lands in a row.
    read: authenticated,
    // Written exclusively by the plugin, via overrideAccess. Nobody may forge, amend, or erase an
    // entry through the API or the admin panel — not editors, not admins, not the account that made
    // the change. An audit trail its subjects can rewrite is not an audit trail.
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    group: 'System',
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'userEmail', 'action', 'timestamp'],
    description:
      'Every create, update, and delete across the CMS, with the signed-in user who made it. Written automatically and append-only — entries cannot be edited or deleted, by anyone.',
    // Rows are machine-written; the editor view is a read-only receipt.
    pagination: { defaultLimit: 50 },
  },
  defaultSort: '-timestamp',
  fields: [
    {
      name: 'summary',
      label: 'Summary',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'Human-readable one-liner, e.g. "Updated Pages › Home (2 fields)".',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'action',
          label: 'Action',
          type: 'select',
          index: true,
          options: [
            { label: 'Created', value: 'create' },
            { label: 'Updated', value: 'update' },
            { label: 'Published', value: 'publish' },
            { label: 'Unpublished', value: 'unpublish' },
            { label: 'Deleted', value: 'delete' },
            { label: 'Signed in', value: 'login' },
            { label: 'Signed out', value: 'logout' },
          ],
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'entityType',
          label: 'Entity Type',
          type: 'select',
          index: true,
          options: [
            { label: 'Collection', value: 'collection' },
            { label: 'Global', value: 'global' },
          ],
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'timestamp',
          label: 'When',
          type: 'date',
          index: true,
          defaultValue: () => new Date().toISOString(),
          admin: {
            readOnly: true,
            width: '34%',
            date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm:ss' },
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'slug',
          label: 'Collection / Global',
          type: 'text',
          index: true,
          admin: { readOnly: true, width: '33%', description: 'Slug of the collection or global that changed.' },
        },
        {
          name: 'documentId',
          label: 'Document ID',
          type: 'text',
          index: true,
          admin: { readOnly: true, width: '33%', description: 'Empty for globals — a global has no document ID.' },
        },
        {
          name: 'documentTitle',
          label: 'Document',
          type: 'text',
          admin: { readOnly: true, width: '34%' },
        },
      ],
    },
    {
      name: 'locale',
      label: 'Locale',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'Which locale the write targeted. "all" means the write carried every locale at once.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          // The live link, for jumping to the actor's account. Nullable by design: SSO users can be
          // deleted, and a dangling relationship must not erase the record of what they did — hence
          // the denormalised email/name/role snapshot below, which survives the account.
          name: 'user',
          label: 'User',
          type: 'relationship',
          relationTo: 'users',
          index: true,
          admin: { readOnly: true, width: '50%' },
        },
        {
          name: 'userEmail',
          label: 'Email',
          type: 'text',
          index: true,
          admin: { readOnly: true, width: '50%', description: 'Captured at the time of the change.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'userName',
          label: 'Name',
          type: 'text',
          admin: { readOnly: true, width: '50%' },
        },
        {
          name: 'userRole',
          label: 'Role at the time',
          type: 'text',
          admin: { readOnly: true, width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          label: 'Source',
          type: 'select',
          index: true,
          options: [
            { label: 'Admin panel', value: 'admin' },
            { label: 'API', value: 'api' },
            { label: 'Server / script', value: 'system' },
          ],
          admin: {
            readOnly: true,
            width: '33%',
            description: 'A "system" write had no signed-in user: a seed script, a cron job, or an internal hook.',
          },
        },
        {
          name: 'ip',
          label: 'IP Address',
          type: 'text',
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'changeCount',
          label: 'Fields Changed',
          type: 'number',
          admin: { readOnly: true, width: '34%' },
        },
      ],
    },
    {
      name: 'fieldsChanged',
      label: 'Changed Fields',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Comma-separated field paths, for scanning the list view without opening the diff.',
      },
    },
    {
      name: 'userAgent',
      label: 'User Agent',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'changes',
      label: 'Changes',
      type: 'json',
      admin: {
        readOnly: true,
        description:
          'Field-by-field diff: path, kind (added/removed/changed/moved), and the before/after values. Rich text is recorded as a single atomic change; large values are truncated to a preview; auth tokens and password hashes are redacted.',
      },
    },
    {
      name: 'snapshot',
      label: 'Deleted Document',
      type: 'json',
      admin: {
        readOnly: true,
        condition: (data) => data?.action === 'delete',
        description:
          'Full copy of the document as it was immediately before deletion. Recorded only on delete — for every other action the diff above plus the collection version history reconstruct the state.',
      },
    },
  ],
  timestamps: true,
}

export default ActivityLog
