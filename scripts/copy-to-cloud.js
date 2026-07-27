// Copies every collection from the local ternary-local DB up to a cloud MongoDB (Atlas).
// The target connection string is passed at RUNTIME via --eval so it never lives in this file
// or in chat. Indexes are recreated by Payload on boot, so only documents are copied here.
//
// Run (replace the URI with YOUR Atlas connection string, keeping /ternary-local as the db):
//   mongosh "mongodb://127.0.0.1:27017/ternary-local" \
//     --eval "TARGET_URI='mongodb+srv://USER:PASS@host/ternary-local?retryWrites=true&w=majority'" \
//     --file scripts/copy-to-cloud.js

if (typeof TARGET_URI === 'undefined' || !TARGET_URI) {
  print('ERROR: pass your Atlas URI via  --eval "TARGET_URI=\'mongodb+srv://...\'"')
  quit(1)
}

// SAFETY: the write TARGET must never be the production host. The script only ever reads `db`
// (the source) and writes to TARGET_URI — this guard makes writing to production impossible.
if (/54\.254\.242\.76/.test(TARGET_URI)) {
  print('ABORT: TARGET_URI points at the production host. Refusing to write to production.')
  quit(1)
}

// PII / ops collections that the public site never needs — skip them so real user accounts and
// form submissions don't get copied onto a staging cluster.
const EXCLUDE = new Set([
  'users',
  'form-submissions',
  'scales-form-submissions',
  'payload-preferences',
  'payload-locked-documents',
  'payload-jobs',
  'payload-kvs',
])

const TARGET_DB = 'ternary-local'
const src = db // the connected SOURCE database
const tgt = Mongo(TARGET_URI).getDB(TARGET_DB)

let collections = 0
let total = 0
src
  .getCollectionNames()
  .filter((c) => !c.startsWith('system.') && !EXCLUDE.has(c))
  .forEach((c) => {
    const docs = src.getCollection(c).find().toArray()
    tgt.getCollection(c).drop() // idempotent: safe to re-run
    if (docs.length) tgt.getCollection(c).insertMany(docs, { ordered: false })
    print(`  ${c}: ${docs.length}`)
    collections++
    total += docs.length
  })

print(`\nDONE — copied ${collections} collections, ${total} documents into "${TARGET_DB}" on the cloud cluster.`)
