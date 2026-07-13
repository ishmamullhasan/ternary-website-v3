import config from '@/payload.config'
import { changedFieldNames, diffDocs, REDACTED } from '@/utilities/diffDocs'
import { getPayload, Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Guards the audit trail (src/plugins/activityLog.ts + src/collections/activityLog.ts).
 *
 * Two halves:
 *
 *  - The differ is pure, so it is tested directly. These are the cases that decide whether the log
 *    is readable or useless: a rich-text edit must not explode into fifty leaf changes, a block
 *    reorder must not report every row as modified, and auth material must never be stored.
 *  - The hooks are exercised against the real database, because that is the only thing that proves
 *    the plugin is actually WIRED — a diff engine nobody calls passes every unit test.
 *
 * The DB half writes to `users` and the `ops` global on purpose: they are the only audited entities
 * with no hand-written `revalidateTag` hook, which throws outside a Next request context (see the
 * note in plugins/liveRefresh.ts) and would fail the test for reasons unrelated to auditing.
 */

const richText = (text: string) => ({
  root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
})

describe('activity log — differ', () => {
  it('reports a scalar change with both sides', () => {
    const changes = diffDocs({ title: 'Old' }, { title: 'New' })
    expect(changes).toEqual([{ path: 'title', kind: 'changed', before: 'Old', after: 'New' }])
  })

  it('ignores bookkeeping fields that are rewritten on every save', () => {
    const before = { title: 'Same', updatedAt: '2026-01-01', createdAt: '2025-01-01', id: 'a' }
    const after = { title: 'Same', updatedAt: '2026-07-13', createdAt: '2025-01-01', id: 'a' }
    expect(diffDocs(before, after)).toEqual([])
  })

  it('treats rich text as one atomic change, not a tree of leaf edits', () => {
    const changes = diffDocs({ content: richText('Hello') }, { content: richText('Goodbye') })
    expect(changes).toHaveLength(1)
    expect(changes[0].path).toBe('content')
  })

  it('matches array rows by id, so inserting at the top is one change and not N', () => {
    const before = {
      layout: [
        { id: 'a', heading: 'A' },
        { id: 'b', heading: 'B' },
      ],
    }
    const after = {
      layout: [
        { id: 'c', heading: 'C' },
        { id: 'a', heading: 'A' },
        { id: 'b', heading: 'B' },
      ],
    }

    const changes = diffDocs(before, after)
    expect(changes).toHaveLength(1)
    expect(changes[0]).toMatchObject({ kind: 'added', path: 'layout.0' })
  })

  it('reports a pure reorder as a single move', () => {
    const before = { layout: [{ id: 'a' }, { id: 'b' }] }
    const after = { layout: [{ id: 'b' }, { id: 'a' }] }

    const changes = diffDocs(before, after)
    expect(changes).toHaveLength(1)
    expect(changes[0]).toMatchObject({ kind: 'moved', path: 'layout' })
  })

  it('reports a removed row', () => {
    const changes = diffDocs({ items: [{ id: 'a' }, { id: 'b' }] }, { items: [{ id: 'a' }] })
    expect(changes).toEqual([{ path: 'items.1', kind: 'removed', before: { id: 'b' } }])
  })

  it('does not treat a relationship read at a different depth as a change', () => {
    const populated = { thumbnail: { id: 'm1', filename: 'x.png', createdAt: '2025-01-01', updatedAt: '2025-01-01' } }
    const flat = { thumbnail: 'm1' }
    expect(diffDocs(populated, flat)).toEqual([])
  })

  it('redacts auth material at every depth', () => {
    const changes = diffDocs(
      { sessions: [{ id: 's1', sessionToken: 'old-secret' }] },
      { sessions: [{ id: 's1', sessionToken: 'new-secret' }], hash: 'deadbeef' },
    )

    const serialized = JSON.stringify(changes)
    expect(serialized).not.toContain('new-secret')
    expect(serialized).not.toContain('deadbeef')
    expect(serialized).toContain(REDACTED)
  })

  it('collapses array indices when naming the changed fields', () => {
    const names = changedFieldNames([
      { path: 'layout.2.heading', kind: 'changed' },
      { path: 'layout.5.heading', kind: 'changed' },
      { path: 'meta.title', kind: 'changed' },
    ])
    expect(names).toEqual(['layout.heading', 'meta.title'])
  })
})

describe('activity log — hooks', () => {
  let payload: Payload
  const createdUserIds: string[] = []

  const logsFor = async (documentId: string) =>
    (await payload.find({ collection: 'activityLog', where: { documentId: { equals: documentId } }, limit: 20 })).docs

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    // The log rows themselves are append-only by access control, so they are removed with
    // overrideAccess — the same door the plugin writes through.
    for (const id of createdUserIds) {
      await payload.delete({ collection: 'users', id, overrideAccess: true }).catch(() => null)
      const rows = await payload.find({ collection: 'activityLog', where: { documentId: { equals: id } }, limit: 50 })
      for (const row of rows.docs) {
        await payload.delete({ collection: 'activityLog', id: row.id, overrideAccess: true }).catch(() => null)
      }
    }
  })

  it('records create, update and delete of a document, with who and what', async () => {
    const email = `audit-probe-${Date.now()}@ternary.solutions`

    // No password: payload-authjs disables Payload's local strategy, so `users` carries no
    // credential of its own — sign-in is Google SSO only.
    const user = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: { email, name: 'Audit Probe' },
    })
    createdUserIds.push(user.id)

    await payload.update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: { name: 'Audit Probe Renamed' },
    })

    const afterUpdate = await logsFor(user.id)
    const create = afterUpdate.find((r) => r.action === 'create')
    const update = afterUpdate.find((r) => r.action === 'update')

    expect(create).toBeDefined()
    expect(create?.slug).toBe('users')
    expect(create?.entityType).toBe('collection')
    expect(create?.timestamp).toBeTruthy()
    // No signed-in user: this write came from a script, and the log must say so rather than
    // silently attributing it to nobody.
    expect(create?.source).toBe('system')

    expect(update).toBeDefined()
    expect(update?.fieldsChanged).toBe('name')
    expect(update?.changes).toEqual([
      { path: 'name', kind: 'changed', before: 'Audit Probe', after: 'Audit Probe Renamed' },
    ])

    await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })

    const afterDelete = await logsFor(user.id)
    const del = afterDelete.find((r) => r.action === 'delete')
    expect(del).toBeDefined()
    // A delete is the one action with no recoverable prior state, so the whole document is kept.
    expect(del?.snapshot).toMatchObject({ email })
  })

  it('records a change to a global', async () => {
    const before = await payload.findGlobal({ slug: 'ops' })
    const flipped = !before.queryRevalidation

    await payload.updateGlobal({ slug: 'ops', overrideAccess: true, data: { queryRevalidation: flipped } })

    const rows = await payload.find({
      collection: 'activityLog',
      where: { slug: { equals: 'ops' }, entityType: { equals: 'global' } },
      sort: '-timestamp',
      limit: 1,
    })

    const row = rows.docs[0]
    expect(row).toBeDefined()
    expect(row?.action).toBe('update')
    expect(row?.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'queryRevalidation',
          before: before.queryRevalidation ?? undefined,
          after: flipped,
        }),
      ]),
    )

    // Restore, then drop both rows so the log is not polluted by the test.
    await payload.updateGlobal({
      slug: 'ops',
      overrideAccess: true,
      data: { queryRevalidation: before.queryRevalidation },
    })
    const toRemove = await payload.find({
      collection: 'activityLog',
      where: { slug: { equals: 'ops' } },
      sort: '-timestamp',
      limit: 2,
    })
    for (const r of toRemove.docs) {
      await payload.delete({ collection: 'activityLog', id: r.id, overrideAccess: true }).catch(() => null)
    }
  })

  it('does not audit itself — an audit row must not generate an audit row', async () => {
    const rows = await payload.find({
      collection: 'activityLog',
      where: { slug: { equals: 'activityLog' } },
      limit: 1,
    })
    expect(rows.totalDocs).toBe(0)
  })
})
