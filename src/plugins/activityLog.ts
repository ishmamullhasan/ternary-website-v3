import { changedFieldNames, diffDocs, type Change } from '@/utilities/diffDocs'
import type {
  CollectionConfig,
  GlobalConfig,
  Payload,
  PayloadRequest,
  Plugin,
  SanitizedCollectionConfig,
  SanitizedGlobalConfig,
} from 'payload'

/**
 * Activity log plugin. Appends an audit hook to EVERY collection and global, so each write lands as
 * a row in `activityLog`: the action, the document, the signed-in user, the time, the origin, and a
 * field-by-field diff. See collections/activityLog.ts for the schema.
 *
 * Written as a config-walking plugin rather than a hook added to each collection by hand, for the
 * same two reasons liveRefresh.ts is (see the note there):
 *
 *  1. Coverage without drift — a new collection is audited the day it is added, with nothing to
 *     remember.
 *  2. It reaches the collections *other plugins* create. `forms`, `form-submissions` and the authjs
 *     fields on `users` do not exist in the static `collections: [...]` array; they are only visible
 *     to a plugin that runs after the plugins that create them. Hence the registration order in
 *     plugins/index.ts.
 *
 * WRITES ARE FIRE-AND-FORGET. The log row is created with its own Local API call — deliberately not
 * passing `req`, so it does not join the caller's transaction — and the whole hook body is wrapped
 * in try/catch. An audit trail that can fail an editor's save is worse than one that occasionally
 * misses a row, and a rolled-back transaction must not take the record of the attempt with it.
 */

const LOG_SLUG = 'activityLog'

/**
 * Collections that must NOT be audited.
 *
 * `activityLog` itself is the load-bearing one — auditing the audit log is an infinite loop.
 * `analytics` takes a row per pageview, so mirroring it would double the write volume of the whole
 * site to record nothing a human did. `search` is written by searchPlugin on every source save; the
 * source's own entry already covers it. The rest are Payload's internal bookkeeping tables — locks,
 * preferences, job runs — which churn constantly and record no editorial intent.
 */
const NO_AUDIT = new Set([
  LOG_SLUG,
  'analytics',
  'search',
  'payload-kv',
  'payload-jobs',
  'payload-folders',
  'payload-locked-documents',
  'payload-preferences',
  'payload-migrations',
])

/** `revalidator` is a data-less UI shell — "saving" it is a button press, not a content change. */
const NO_AUDIT_GLOBALS = new Set(['revalidator'])

type Action = 'create' | 'update' | 'publish' | 'unpublish' | 'delete' | 'login' | 'logout'

type Entry = {
  action: Action
  entityType: 'collection' | 'global'
  slug: string
  documentId?: string
  documentTitle?: string
  locale?: string
  user?: string
  userEmail?: string
  userName?: string
  userRole?: string
  source: 'admin' | 'api' | 'system'
  ip?: string
  userAgent?: string
  changes: Change[]
  snapshot?: Record<string, unknown>
}

const str = (v: unknown): string | undefined => {
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  return undefined
}

/**
 * The document's display title, using whatever field the collection nominated as `useAsTitle`.
 * A localized title read with `locale: 'all'` is an object keyed by locale, not a string — fall
 * back to English, then to any locale that has a value.
 */
const titleOf = (doc: unknown, config: SanitizedCollectionConfig): string | undefined => {
  if (typeof doc !== 'object' || doc === null) return undefined
  const record = doc as Record<string, unknown>
  const field = config.admin?.useAsTitle ?? 'title'
  const raw = record[field] ?? record.title ?? record.name ?? record.slug

  if (typeof raw === 'object' && raw !== null) {
    const byLocale = raw as Record<string, unknown>
    return str(byLocale.en) ?? str(Object.values(byLocale).find((v) => typeof v === 'string'))
  }
  return str(raw)
}

const labelOf = (config: SanitizedCollectionConfig | SanitizedGlobalConfig): string => {
  const label = 'labels' in config ? config.labels?.singular : config.label
  if (typeof label === 'string') return label
  if (label && typeof label === 'object') return str((label as Record<string, unknown>).en) ?? config.slug
  return config.slug
}

/**
 * Payload's admin panel sends autosaves as `?autosave=true`. Pages autosaves every 100ms while an
 * editor types (versions.drafts.autosave.interval), so auditing them would write thousands of rows
 * per editing session and bury the deliberate saves. Draft autosaves are already recoverable from
 * the collection's version history; what belongs in an audit trail is the save the human chose to
 * make.
 */
const isAutosave = (req: PayloadRequest): boolean => {
  const q = (req.query as Record<string, unknown> | undefined)?.autosave
  if (q === true || q === 'true') return true
  return req.searchParams?.get('autosave') === 'true'
}

const header = (req: PayloadRequest, name: string): string | undefined => {
  try {
    return req.headers?.get(name) ?? undefined
  } catch {
    return undefined
  }
}

const originOf = (req: PayloadRequest): Pick<Entry, 'source' | 'ip' | 'userAgent'> => {
  const ip = header(req, 'x-forwarded-for')?.split(',')[0]?.trim() ?? header(req, 'x-real-ip')
  const userAgent = header(req, 'user-agent')
  const referer = header(req, 'referer') ?? ''

  // No user means nobody was signed in: a seed script, a cron job, or an internal adapter call.
  // These are the writes most worth being able to tell apart from a human's.
  const source: Entry['source'] = !req.user ? 'system' : referer.includes('/admin') ? 'admin' : 'api'

  return { source, ip, userAgent }
}

const actorOf = (req: PayloadRequest): Pick<Entry, 'user' | 'userEmail' | 'userName' | 'userRole'> => {
  const user = req.user as { id?: string | number; email?: string; name?: string; role?: string } | null | undefined
  if (!user?.id) return {}
  return {
    user: str(user.id),
    userEmail: user.email,
    userName: user.name,
    // Snapshotted, not looked up at read time: an audit entry must say what the actor's role WAS
    // when they acted, not what it happens to be now.
    userRole: user.role ?? 'admin (legacy, no role set)',
  }
}

/**
 * Does this entity have ANY localized field, at any depth (including inside blocks and array rows)?
 *
 * The `locale` column is recorded either way — it is a true fact about the write. But naming it in
 * the summary of an entity that has no localized fields ("Updated Ops Switches [en]") implies a
 * Bengali version exists and differs, which is worse than saying nothing. Memoised per slug: the
 * config is immutable once built, so this is walked at most once per collection.
 */
const localizedCache = new Map<string, boolean>()

const anyLocalized = (fields: unknown[]): boolean =>
  fields.some((f) => {
    const field = f as { localized?: boolean; fields?: unknown[]; blocks?: { fields?: unknown[] }[]; tabs?: unknown[] }
    if (field.localized) return true
    if (field.fields && anyLocalized(field.fields)) return true
    if (field.tabs && anyLocalized(field.tabs)) return true
    return Boolean(field.blocks?.some((b) => anyLocalized(b.fields ?? [])))
  })

const hasLocalizedFields = (config: SanitizedCollectionConfig | SanitizedGlobalConfig): boolean => {
  const cached = localizedCache.get(config.slug)
  if (cached !== undefined) return cached

  const result = anyLocalized(config.fields ?? [])
  localizedCache.set(config.slug, result)
  return result
}

const summarise = (entry: Entry, label: string, localized: boolean): string => {
  const verb: Record<Action, string> = {
    create: 'Created',
    update: 'Updated',
    publish: 'Published',
    unpublish: 'Unpublished',
    delete: 'Deleted',
    login: 'Signed in to',
    logout: 'Signed out of',
  }

  const target = entry.documentTitle ? `${label} › ${entry.documentTitle}` : label
  const scope = localized && entry.locale ? ` [${entry.locale}]` : ''

  if (entry.action === 'login' || entry.action === 'logout') {
    return `${verb[entry.action]} the admin — ${entry.userEmail ?? entry.userName ?? 'unknown user'}`
  }

  const n = entry.changes.length
  const count = entry.action === 'update' ? ` (${n} field${n === 1 ? '' : 's'})` : ''
  return `${verb[entry.action]} ${target}${scope}${count}`
}

/** Persist one entry. Never throws — a failure here must not fail the write being audited. */
const write = async (
  payload: Payload,
  entry: Entry,
  config: SanitizedCollectionConfig | SanitizedGlobalConfig,
): Promise<void> => {
  try {
    const fields = changedFieldNames(entry.changes)

    await payload.create({
      collection: LOG_SLUG,
      overrideAccess: true, // the collection's own create access is `false` — see activityLog.ts
      depth: 0,
      data: {
        ...entry,
        summary: summarise(entry, labelOf(config), hasLocalizedFields(config)),
        changeCount: entry.changes.length,
        fieldsChanged: fields.join(', ') || undefined,
        changes: entry.changes,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (err) {
    payload.logger.error({ err, entry: { action: entry.action, slug: entry.slug } }, 'Failed to write activity log')
  }
}

/**
 * Auth-collection writes are not editorial changes — they are sign-ins.
 *
 * payload-authjs stores Auth.js sessions as an array field on the user document, and its adapter
 * adds a row via `payload.update` on sign-in and removes it on sign-out (PayloadAdapter
 * createSession / deleteSession). That update is the only server-side trace of an SSO login, since
 * Google SSO never touches Payload's own `afterLogin` hook. So: a session row appearing is a login,
 * one disappearing is a logout, and a bare `expires` bump is a session refresh — pure noise, and
 * dropped.
 *
 * Those adapter calls also pass `select: { id, sessions }`, so the hook's `doc` carries no email or
 * name and `req.user` is still null (the login has not completed). The actor is therefore the user
 * document being written, fetched by ID.
 */
const classifySessionWrite = (changes: Change[]): 'login' | 'logout' | 'skip' | null => {
  const auth = changes.filter((c) => /^(sessions|accounts|verificationTokens)(\.|$)/.test(c.path))
  if (auth.length === 0) return null // an ordinary profile or role edit — audit it normally

  const sessions = auth.filter((c) => /^sessions(\.|$)/.test(c.path))
  if (sessions.some((c) => c.kind === 'added')) return 'login'
  if (sessions.some((c) => c.kind === 'removed')) return 'logout'

  // Token refresh / account-link housekeeping. Drop it only if it is ALL that changed — an admin who
  // edits a colleague's role in the same write must still be recorded doing so.
  return auth.length === changes.length ? 'skip' : null
}

const auditCollection = (collection: CollectionConfig): CollectionConfig => {
  if (NO_AUDIT.has(collection.slug)) return collection
  const isAuthCollection = Boolean(collection.auth)

  const afterChange: NonNullable<CollectionConfig['hooks']>['afterChange'] = [
    async ({ collection: config, doc, operation, previousDoc, req }) => {
      try {
        if (isAutosave(req)) return

        const changes = diffDocs(operation === 'create' ? undefined : previousDoc, doc)

        const base = {
          entityType: 'collection' as const,
          slug: config.slug,
          documentId: str((doc as Record<string, unknown>)?.id),
          locale: req.locale,
          ...originOf(req),
        }

        if (isAuthCollection && operation === 'update') {
          const kind = classifySessionWrite(changes)
          if (kind === 'skip') return

          if (kind === 'login' || kind === 'logout') {
            // The actor is the account being signed into, not `req.user` (still null mid-login).
            const id = base.documentId
            const account = id
              ? await req.payload
                  .findByID({ collection: config.slug, id, depth: 0, overrideAccess: true })
                  .catch(() => null)
              : null
            const actor = account as { id?: string | number; email?: string; name?: string; role?: string } | null

            await write(
              req.payload,
              {
                ...base,
                action: kind,
                source: 'admin', // sign-in exists to reach the admin panel
                documentTitle: actor?.name ?? actor?.email,
                user: str(actor?.id),
                userEmail: actor?.email,
                userName: actor?.name,
                userRole: actor?.role,
                // Session tokens are redacted by the differ; the row records only that a session
                // began or ended, never the credential itself.
                changes: [],
              },
              config,
            )
            return
          }
        }

        // A save that changed nothing (a no-op Save click, a plugin re-writing an identical doc) is
        // not an event. Creates and deletes always are, even when the document is empty.
        if (operation === 'update' && changes.length === 0) return

        const status = (d: unknown) => (d as Record<string, unknown> | undefined)?._status
        let action: Action = operation === 'create' ? 'create' : 'update'
        if (operation === 'update') {
          if (status(previousDoc) === 'draft' && status(doc) === 'published') action = 'publish'
          else if (status(previousDoc) === 'published' && status(doc) === 'draft') action = 'unpublish'
        }

        await write(
          req.payload,
          { ...base, action, documentTitle: titleOf(doc, config), ...actorOf(req), changes },
          config,
        )
      } catch (err) {
        req.payload.logger.error({ err, collection: collection.slug }, 'Activity log hook failed')
      }
    },
  ]

  const afterDelete: NonNullable<CollectionConfig['hooks']>['afterDelete'] = [
    async ({ collection: config, doc, id, req }) => {
      try {
        await write(
          req.payload,
          {
            action: 'delete',
            entityType: 'collection',
            slug: config.slug,
            documentId: str(id),
            documentTitle: titleOf(doc, config),
            locale: req.locale,
            ...originOf(req),
            ...actorOf(req),
            changes: diffDocs(doc, undefined),
            // The only action with no recoverable prior state: versions die with the document. Keep
            // the whole thing, so a delete can be reconstructed rather than merely regretted.
            snapshot: doc as Record<string, unknown>,
          },
          config,
        )
      } catch (err) {
        req.payload.logger.error({ err, collection: collection.slug }, 'Activity log hook failed')
      }
    },
  ]

  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      // PREPENDED, not appended — the same reasoning as liveRefresh.ts: the hand-written
      // revalidateTag hooks throw when a write happens outside a Next request (everything in
      // scripts/), and a hook that throws takes the rest of the chain down with it. Running last
      // would mean never running at all for exactly the writes least likely to be witnessed.
      afterChange: [...afterChange, ...(collection.hooks?.afterChange ?? [])],
      afterDelete: [...afterDelete, ...(collection.hooks?.afterDelete ?? [])],
    },
  }
}

const auditGlobal = (global: GlobalConfig): GlobalConfig => {
  if (NO_AUDIT_GLOBALS.has(global.slug)) return global

  return {
    ...global,
    hooks: {
      ...global.hooks,
      afterChange: [
        async ({ doc, global: config, previousDoc, req }) => {
          try {
            if (isAutosave(req)) return

            const changes = diffDocs(previousDoc, doc)
            if (changes.length === 0) return

            await write(
              req.payload,
              {
                action: 'update',
                entityType: 'global',
                slug: config.slug,
                locale: req.locale,
                ...originOf(req),
                ...actorOf(req),
                changes,
              },
              config,
            )
          } catch (err) {
            req.payload.logger.error({ err, global: global.slug }, 'Activity log hook failed')
          }
          return doc
        },
        ...(global.hooks?.afterChange ?? []),
      ],
    },
  }
}

export const activityLogPlugin: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map(auditCollection),
  globals: config.globals?.map(auditGlobal),
})

export default activityLogPlugin
