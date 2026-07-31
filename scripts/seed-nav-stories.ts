// Header/footer nav — remove "Work", keep "Stories" (owner direction 2026-07-31): the two items
// point at the same destination (/stories 308s to /work), which reads as a duplicate. "Stories"
// stays and now links straight to /work so the click skips the cached permanent redirect. The
// /work URL remains canonical — reversing the existing /stories→/work 308 would loop for anyone
// whose browser cached it. Raw-connection edit (same approach as seed-nav-work.js) because the
// localized `label` shape is easier to preserve untouched than through the Local API.
// DRY by default; SEED_DRY=0 to apply. Logged in COPY_CHANGELOG.md.
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY = process.env.SEED_DRY !== '0'

const run = async () => {
  const payload = await getPayload({ config })
  const globals = payload.db.connection.collection('globals')

  const header: any = await globals.findOne({ globalType: 'header' })
  if (!header) throw new Error('no header global found')
  const menu: any[] = header.menu ?? []
  const workIdx = menu.findIndex((m) => m && m.link === '/work' && m.label?.en !== 'Stories')
  const storiesIdx = menu.findIndex((m) => m && m.label?.en === 'Stories')
  console.log(`mode: ${DRY ? 'DRY' : 'APPLY'}`)
  console.log(`header nav: ${menu.map((m) => `${m.label?.en ?? '?'}→${m.link ?? '(mega)'}`).join(' · ')}`)
  console.log(`work item: ${workIdx === -1 ? 'none' : `index ${workIdx}`} | stories item: ${storiesIdx === -1 ? 'none' : `index ${storiesIdx} (link ${menu[storiesIdx].link})`}`)

  const footer: any = await globals.findOne({ globalType: 'footer' })
  const resMenu: any[] = footer?.resources?.menu ?? []
  const footStories = resMenu.findIndex((m) => m && m.link === '/stories')
  console.log(`footer resources: ${resMenu.map((m) => `${m.label?.en ?? m.label ?? '?'}→${m.link}`).join(' · ')}`)

  if (DRY) process.exit(0)

  if (workIdx !== -1) menu.splice(workIdx, 1)
  const sIdx = menu.findIndex((m) => m && m.label?.en === 'Stories')
  if (sIdx !== -1) menu[sIdx] = { ...menu[sIdx], link: '/work' }
  await globals.updateOne({ globalType: 'header' }, { $set: { menu, updatedAt: new Date() } })
  console.log(`✓ header nav now: ${menu.map((m) => `${m.label?.en ?? '?'}→${m.link ?? '(mega)'}`).join(' · ')}`)

  if (footStories !== -1) {
    resMenu[footStories] = { ...resMenu[footStories], link: '/work' }
    await globals.updateOne({ globalType: 'footer' }, { $set: { 'resources.menu': resMenu, updatedAt: new Date() } })
    console.log('✓ footer Stories → /work')
  }
  process.exit(0)
}
await run()
