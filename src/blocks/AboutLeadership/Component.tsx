import Motion from '@/components/animation/motion'
import type { AboutLeadershipBlock, Team } from '@/payload-types'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'
import { RosterScroll } from './RosterScroll'

// Roster sections in display order, keyed by the collection's `category` select — an exact copy of
// the /team page's grouping. A category with no members disappears entirely (heading included).
const CATEGORY_SECTIONS = [
  { category: 'leader', title: 'Leadership' },
  { category: 'general', title: 'Team' },
  { category: 'advisor', title: 'Advisors' },
] as const

// Mirrors the /team page's fetch: the full roster in manual (_order) order, `image` populated.
const fetchTeam = async (locale: TypedLocale): Promise<Team[]> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'team',
    locale,
    depth: 1,
    limit: 200,
    overrideAccess: true,
    sort: '_order',
  })
  return result.docs as Team[]
}

// Same tag-based ISR entry the /team page uses (shared cache key, busted by the Team collection's
// afterChange/afterDelete hooks via the `team` tag), keyed per-locale.
const getTeam = (locale: TypedLocale): Promise<Team[]> =>
  unstable_cache(() => fetchTeam(locale), [`team_list_${locale}`], { tags: ['team'] })()

/**
 * Leadership section — an exact clone of the /team page inside the about page's `bg-main` section
 * box: a sticky left third with the /team page's own intro copy, and the full roster on the right
 * two-thirds grouped into Leadership / Team / Advisors by the collection's `category` (docs
 * predating the field count as 'general', matching the field default). Reads the whole team
 * collection — like /team — rather than the block's picked members.
 */
export async function AboutLeadershipComponent({
  locale = 'en',
}: AboutLeadershipBlock & { locale?: TypedLocale }): Promise<JSX.Element | null> {
  const members = await getTeam(locale)

  const sections = CATEGORY_SECTIONS.map(({ category, title }) => ({
    category,
    title,
    members: members.filter((m) => (m.category ?? 'general') === category),
  })).filter((s) => s.members.length > 0)

  if (sections.length === 0) return null

  return (
    // Fixed height on lg+ so the roster scrolls inside the panel (with fade masks) while the intro
    // stays put; below lg the panel grows to its content and the list flows normally.
    <section className="rounded-md bg-main p-6 lg:h-[640px] lg:p-12">
      <div className="flex flex-col gap-12 lg:h-full lg:flex-row lg:items-start lg:gap-16">
        {/* Left third — the fixed intro. Same copy as /team; an <h2> here because the page already
            owns the single <h1>. */}
        <Motion
          tag="div"
          className="flex flex-col gap-4 lg:w-1/3 lg:shrink-0"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-display font-display font-medium text-cream">Meet the Team</h2>
          <p className="text-body">
            The senior engineers and operators behind Ternary — the specialists already on your team.
          </p>
        </Motion>

        {/* Right two-thirds — the roster, grouped by category in manual (_order) order; scrolls
            inside the fixed-height panel with top/bottom fades on lg+. */}
        <RosterScroll sections={sections} />
      </div>
    </section>
  )
}
