import type { User } from '@/payload-types'

/**
 * Admin gate. With SSO + payload-authjs, any allowed Workspace account auto-provisions a user, so
 * privileged operations (managing users, reading analytics) must be limited to `role === 'admin'`.
 *
 * Users created before the `role` field existed have no role; they are grandfathered as admins so
 * adding roles never locks out the current admins. New (SSO-provisioned) users get the field default
 * 'editor', so only those legacy users are ever treated as admin-by-absence.
 *
 * Typed with a minimal `{ req: { user } }` arg so the same helper satisfies both collection `Access`
 * and field `FieldAccess` (both receive `req`).
 */
export const isAdmin = ({ req: { user } }: { req: { user?: User | null } }): boolean =>
  Boolean(user && (user.role === 'admin' || !user.role))
