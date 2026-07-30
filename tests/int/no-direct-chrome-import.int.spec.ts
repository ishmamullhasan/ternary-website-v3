import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Stage 2 guard: the site header and footer must be rendered from the ROOT layout only
// (src/app/(frontend)/[locale]/layout.tsx). Any other file importing the header/footer component
// re-introduces the per-page-chrome drift this stage eliminated. This test fails the build if that
// happens. If you legitimately need to move where chrome mounts, update ALLOWED below on purpose.
const FRONTEND_ROOT = join(process.cwd(), 'src', 'app', '(frontend)')
const ALLOWED = [join('[locale]', 'layout.tsx')]
const CHROME_IMPORT = /from\s+['"][^'"]*\/(sections\/(header|footer)|components\/sections\/(header|footer))['"]/

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(tsx|ts)$/.test(entry)) out.push(full)
  }
  return out
}

describe('site chrome is mounted once, from the root layout', () => {
  it('no file under (frontend) imports the header/footer except the root layout', () => {
    const offenders: string[] = []
    for (const file of walk(FRONTEND_ROOT)) {
      if (ALLOWED.some((a) => file.endsWith(a))) continue
      if (CHROME_IMPORT.test(readFileSync(file, 'utf8'))) {
        offenders.push(file.replace(process.cwd(), ''))
      }
    }
    expect(offenders, `header/footer imported outside the root layout:\n${offenders.join('\n')}`).toEqual([])
  })
})
