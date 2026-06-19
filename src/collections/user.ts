import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { isAdmin } from '../access/isAdmin'

const User: CollectionConfig = {
  slug: 'users',
  access: {
    // Any signed-in staff can reach the admin panel; read stays open so /me + relationship lookups
    // work. Creating, editing, and deleting accounts is admin-only — prevents an auto-provisioned
    // editor from minting or promoting admins.
    admin: authenticated,
    read: authenticated,
    create: isAdmin,
    delete: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'System',
    description: 'Admin accounts that can sign in and manage content.',
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      // Optional (not required) on purpose: payload-authjs updates the user doc on each login, and a
      // required field with no value on legacy docs would fail that update. New users still get the
      // default 'editor'; legacy users read back null and are grandfathered as admins by isAdmin().
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        // Only admins may assign/change a role — blocks self-promotion. (Defaults still apply on
        // create regardless of field access, so SSO-provisioned users land as 'editor'.)
        create: isAdmin,
        update: isAdmin,
      },
      admin: {
        description: 'Admins manage users, analytics, and settings. Editors manage content.',
      },
    },
  ],
  timestamps: true,
}

export default User
