/**
 * Structural diff between two Payload documents, for the activity log (see
 * collections/activityLog.ts and plugins/activityLog.ts).
 *
 * Payload's own versions system already snapshots whole documents, but only for the four
 * collections that opted into drafts, and it answers "what did this doc look like at time T" —
 * not "who changed which field, and when". This produces the latter: a flat list of
 * `{ path, before, after }` entries an auditor can read without diffing two JSON blobs by eye.
 *
 * Three things make a naive deep-compare useless on this schema:
 *
 *  1. **Rich text.** A Lexical value is a deeply nested `{ root: { children: [...] } }` tree. A
 *     one-word edit expands to dozens of leaf changes at paths like
 *     `content.root.children.0.children.0.text`. Rich text is therefore treated as ATOMIC — one
 *     entry saying the field changed, with truncated previews.
 *  2. **Array row identity.** Blocks and array rows carry a Payload-assigned `id`. Comparing by
 *     index means inserting one block at the top reports every subsequent row as modified. Rows
 *     are matched by `id`, so an insert is one `added` entry and a drag-reorder is one `moved`.
 *  3. **Secrets.** The `users` collection carries auth material (session tokens, OAuth
 *     access/refresh tokens, password hashes) that must never land in a log row. Those keys are
 *     redacted by name, at every depth.
 */

export type ChangeKind = 'added' | 'removed' | 'changed' | 'moved'

export type Change = {
  /** Dot/bracket path into the doc, e.g. `layout.2.heading` or `meta.title`. */
  path: string
  kind: ChangeKind
  before?: unknown
  after?: unknown
}

/**
 * Fields that are either bookkeeping (rewritten on every save, so they'd make every diff non-empty)
 * or identity (never meaningfully "changed"). Matched at any depth, including on array rows — a
 * block row's `id` is how we match it, not something to report.
 */
const IGNORED_KEYS = new Set(['id', '_id', '__v', 'createdAt', 'updatedAt', 'globalType'])

/**
 * Auth material. Never logged — the value is replaced with a marker, though the *fact* that it
 * changed still is (that's the login/logout signal the plugin keys off).
 */
const REDACTED_KEYS = new Set([
  'password',
  'hash',
  'salt',
  'sessionToken',
  'resetPasswordToken',
  'resetPasswordExpiration',
  'apiKey',
  'apiKeyIndex',
  'access_token',
  'refresh_token',
  'id_token',
  'token',
  'secret',
  'client_secret',
])

export const REDACTED = '[redacted]'

/** Values longer than this (as JSON) are stored as a truncated preview instead. */
const MAX_VALUE_CHARS = 400
/** A single save touching more than this many paths is summarised rather than fully enumerated. */
const MAX_CHANGES = 200
/** Runaway guard for pathological nesting. Nothing in this schema comes close. */
const MAX_DEPTH = 12

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date)

/** A Lexical editor state. Compared whole, never walked into. */
const isRichText = (v: unknown): boolean => isPlainObject(v) && isPlainObject(v.root) && 'children' in v.root

/** An unset field and an empty array are the same absence — Payload returns either, interchangeably. */
const isEmpty = (v: unknown): boolean =>
  v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)

/**
 * Relationship and upload fields come back either as an ID or as a populated object, depending on
 * the `depth` of the request that triggered the hook. The same value read at two different depths
 * is not a change, so both sides are normalised to their ID before comparison.
 */
const toComparable = (v: unknown): unknown => {
  if (v instanceof Date) return v.toISOString()
  if (isPlainObject(v) && 'id' in v && !isRichText(v)) {
    // A populated relationship/upload doc. An array *row* also has an `id`, but rows have no
    // `createdAt` — the presence of timestamps is what distinguishes a real document.
    if ('createdAt' in v || 'updatedAt' in v) return v.id
  }
  return v
}

/**
 * `normalizeRelations` MUST be off at the root. The document under audit is itself an object with
 * an `id` and a `createdAt`, so normalising it collapses both sides to the same ID and every
 * document compares equal to itself — a silent, total failure in which the log records creates and
 * deletes but never a single update. Only values *nested inside* the document can be relationships.
 */
const stableEqual = (a: unknown, b: unknown, normalizeRelations = true): boolean => {
  const x = normalizeRelations ? toComparable(a) : a
  const y = normalizeRelations ? toComparable(b) : b
  if (Object.is(x, y)) return true
  if (isEmpty(x) && isEmpty(y)) return true
  try {
    return JSON.stringify(x) === JSON.stringify(y)
  } catch {
    return false
  }
}

/** Shrink a value to something safe to persist: no secrets, bounded size. */
const summarize = (value: unknown, key?: string): unknown => {
  if (value === undefined) return undefined
  if (key && REDACTED_KEYS.has(key)) return REDACTED
  if (value instanceof Date) return value.toISOString()

  let json: string
  try {
    json = JSON.stringify(value) ?? 'null'
  } catch {
    return '[unserializable]'
  }
  if (json.length <= MAX_VALUE_CHARS) return redactDeep(value)

  return {
    __truncated: true,
    length: json.length,
    preview: `${json.slice(0, MAX_VALUE_CHARS)}…`,
  }
}

/** Strip secret-named keys anywhere inside a value that is small enough to store whole. */
const redactDeep = (value: unknown, depth = 0): unknown => {
  if (depth > MAX_DEPTH) return value
  if (Array.isArray(value)) return value.map((v) => redactDeep(v, depth + 1))
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, REDACTED_KEYS.has(k) ? REDACTED : redactDeep(v, depth + 1)]),
    )
  }
  return value
}

const join = (path: string, key: string | number): string => (path ? `${path}.${key}` : String(key))

/** Array rows and blocks are matched by their Payload-assigned row id when every row has one. */
const rowId = (v: unknown): string | undefined =>
  isPlainObject(v) && (typeof v.id === 'string' || typeof v.id === 'number') ? String(v.id) : undefined

const allRowsIdentified = (arr: unknown[]): boolean => arr.length > 0 && arr.every((v) => rowId(v) !== undefined)

const walk = (before: unknown, after: unknown, path: string, out: Change[], depth: number, key?: string): void => {
  if (out.length >= MAX_CHANGES) return
  if (stableEqual(before, after, depth > 0)) return

  // Rich text: one entry for the whole field. Walking a Lexical tree yields noise, not information.
  if (isRichText(before) || isRichText(after)) {
    out.push({ path, kind: 'changed', before: summarize(before, key), after: summarize(after, key) })
    return
  }

  if (depth >= MAX_DEPTH) {
    out.push({ path, kind: 'changed', before: summarize(before, key), after: summarize(after, key) })
    return
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    walkArray(before, after, path, out, depth)
    return
  }

  if (isPlainObject(before) && isPlainObject(after)) {
    // Both sides are objects but one is a populated relationship and the other an ID — already
    // handled by stableEqual. Here they are genuinely two structures: compare key by key.
    for (const k of new Set([...Object.keys(before), ...Object.keys(after)])) {
      if (IGNORED_KEYS.has(k)) continue
      walk(before[k], after[k], join(path, k), out, depth + 1, k)
    }
    return
  }

  out.push({ path, kind: 'changed', before: summarize(before, key), after: summarize(after, key) })
}

const walkArray = (before: unknown[], after: unknown[], path: string, out: Change[], depth: number): void => {
  // Rows without ids (e.g. a `select` with hasMany, an array of strings) have no identity to match
  // on — report the array as a single changed value.
  if (!allRowsIdentified(before) || !allRowsIdentified(after)) {
    out.push({ path, kind: 'changed', before: summarize(before), after: summarize(after) })
    return
  }

  const beforeById = new Map(before.map((row) => [rowId(row)!, row]))
  const afterById = new Map(after.map((row) => [rowId(row)!, row]))

  before.forEach((row, i) => {
    const id = rowId(row)!
    if (!afterById.has(id)) out.push({ path: join(path, i), kind: 'removed', before: summarize(row) })
  })

  after.forEach((row, i) => {
    if (out.length >= MAX_CHANGES) return
    const id = rowId(row)!
    const prev = beforeById.get(id)
    if (!prev) {
      out.push({ path: join(path, i), kind: 'added', after: summarize(row) })
      return
    }
    walk(prev, row, join(path, i), out, depth + 1)
  })

  // Reorder: same membership, different sequence. One entry, not N.
  const beforeOrder = before.map((r) => rowId(r)!).filter((id) => afterById.has(id))
  const afterOrder = after.map((r) => rowId(r)!).filter((id) => beforeById.has(id))
  if (beforeOrder.length === afterOrder.length && beforeOrder.some((id, i) => id !== afterOrder[i])) {
    out.push({ path, kind: 'moved', before: beforeOrder, after: afterOrder })
  }
}

/**
 * Diff two documents. `before` is `undefined` on create; `after` is `undefined` on delete — in both
 * cases every top-level field is reported as added/removed rather than the doc as one opaque blob,
 * so the log stays readable.
 */
export const diffDocs = (before: unknown, after: unknown): Change[] => {
  const out: Change[] = []

  if (isPlainObject(before) && isPlainObject(after)) {
    walk(before, after, '', out, 0)
  } else if (isPlainObject(after)) {
    for (const [k, v] of Object.entries(after)) {
      if (IGNORED_KEYS.has(k) || isEmpty(v)) continue
      out.push({ path: k, kind: 'added', after: summarize(v, k) })
    }
  } else if (isPlainObject(before)) {
    for (const [k, v] of Object.entries(before)) {
      if (IGNORED_KEYS.has(k) || isEmpty(v)) continue
      out.push({ path: k, kind: 'removed', before: summarize(v, k) })
    }
  }

  if (out.length > MAX_CHANGES) {
    const dropped = out.length - MAX_CHANGES
    return [
      ...out.slice(0, MAX_CHANGES),
      { path: '…', kind: 'changed', after: `${dropped} further change(s) not recorded` },
    ]
  }

  return out
}

/**
 * The list of changed field paths, deduplicated and shortened for the admin list column. Array
 * indices are collapsed (`layout.2.heading` → `layout.heading`) so a page edit reads as
 * "layout, meta.title" rather than fifteen numbered variants of the same field.
 */
export const changedFieldNames = (changes: Change[]): string[] => {
  const names = changes.map((c) => c.path.replace(/\.\d+(?=\.|$)/g, '')).filter(Boolean)
  return [...new Set(names)]
}
