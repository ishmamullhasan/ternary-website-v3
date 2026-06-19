// Build /tmp/bn-trans-0.json (seed-bn input) for the NEW content collections by applying the
// merged {en:bn} dictionary to the extracted leaves. Text leaves -> dict string; richText leaves ->
// a clone with each text node translated via the dict. Excludes 'pages' (home) and any leaf with no
// real translation (seed-bn skips bn===value anyway). Run after merging /tmp/bn-dict-*.json.
import { readFileSync, writeFileSync } from 'node:fs'

const NEW = new Set(['capability', 'scale', 'model', 'insight', 'pressRelease'])
const docs = JSON.parse(readFileSync('/tmp/bn-en-extract.json', 'utf8')) as any[]
const dict = JSON.parse(readFileSync('/tmp/bn-dict.json', 'utf8')) as Record<string, string>

const tr = (s: string): string => (typeof dict[s] === 'string' && dict[s].trim() ? dict[s] : s)

// Deep-clone a Lexical node tree, translating each text node's `.text` via the dict.
const cloneRich = (node: any): any => {
  if (Array.isArray(node)) return node.map(cloneRich)
  if (!node || typeof node !== 'object') return node
  const out: any = { ...node }
  if (typeof out.text === 'string') out.text = tr(out.text)
  if (Array.isArray(out.children)) out.children = out.children.map(cloneRich)
  return out
}

let leafCount = 0,
  translated = 0
const result: any[] = []
for (const d of docs) {
  if (!NEW.has(d.slug)) continue
  const leaves: any[] = []
  for (const l of d.leaves || []) {
    leafCount++
    if (l.type === 'richText') {
      const bn = { ...l.value, root: cloneRich((l.value as any).root) }
      leaves.push({ ...l, bn })
      translated++ // richText always re-emitted (text nodes translated in place)
    } else if (typeof l.value === 'string') {
      const bn = tr(l.value)
      leaves.push({ ...l, bn })
      if (bn !== l.value) translated++
    }
  }
  result.push({ kind: d.kind, slug: d.slug, id: d.id, title: d.title, leaves })
}
writeFileSync('/tmp/bn-trans-0.json', JSON.stringify(result, null, 2))
console.log(
  `bn-apply: ${result.length} docs, ${leafCount} leaves, ${translated} with a bn translation -> /tmp/bn-trans-0.json`,
)
console.log(`dict entries: ${Object.keys(dict).length}`)
