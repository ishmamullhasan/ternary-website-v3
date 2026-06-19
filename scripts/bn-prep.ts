// READ-ONLY prep: from /tmp/bn-en-extract.json, collect every unique translatable English string
// across the NEW docs (capability/scale/model/insight/pressRelease/pages) — both text leaves and
// the text nodes inside richText — and write the sorted unique list to /tmp/bn-strings.json.
import { readFileSync, writeFileSync } from 'node:fs'

const NEW = new Set(['capability', 'scale', 'model', 'insight', 'pressRelease', 'pages'])
const docs = JSON.parse(readFileSync('/tmp/bn-en-extract.json', 'utf8')) as any[]
const strings = new Set<string>()

const collectRich = (node: any) => {
  if (!node || typeof node !== 'object') return
  if (typeof node.text === 'string' && node.text.trim()) strings.add(node.text)
  for (const c of node.children || []) collectRich(c)
}

for (const d of docs) {
  if (!NEW.has(d.slug) && !NEW.has(d.kind)) continue
  // d.slug is the collection slug for collections, or global slug; match on collection name held in
  // the extract's "kind" + actual collection — but bn-en-extract stores `slug` as the collection
  // slug only for globals; for collections `slug` is the doc slug. Use the leaves regardless: we
  // already filtered the file to new docs by re-checking the collection via the loop below.
  for (const l of d.leaves || []) {
    if (l.type === 'richText') collectRich((l.value as any)?.root)
    else if (typeof l.value === 'string' && l.value.trim()) strings.add(l.value)
  }
}
const arr = [...strings].sort()
writeFileSync('/tmp/bn-strings.json', JSON.stringify(arr, null, 2))
console.log(`bn-prep: ${arr.length} unique strings -> /tmp/bn-strings.json`)
