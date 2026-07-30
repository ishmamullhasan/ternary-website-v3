import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import type { AboutLeadershipBlock, Team } from '@/payload-types'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { ArrowRight } from 'lucide-react'
import { TeamMemberCard } from '@/components/sections/teamMemberCard'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

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
 * Leadership section (Stage 7.7) — /about shows LEADERSHIP ONLY: photo, name, role, no bios.
 * Below the cards sits a directory strip — "[N] people across New York and Dhaka" with a
 * "Meet the team" link — instead of duplicating the entire roster here; the full directory
 * lives on /team. N is computed from published, COMPLETE team docs (name + role), matching
 * the render guard used everywhere else (Stage 6.4).
 */
export async function AboutLeadershipComponent({
  locale = 'en',
}: AboutLeadershipBlock & { locale?: TypedLocale }): Promise<JSX.Element | null> {
  const members = await getTeam(locale)

  // Render guard: complete entries only.
  const complete = members.filter((m) => m.name?.trim() && m.position?.trim())
  const leaders = complete.filter((m) => m.category === 'leader')
  if (leaders.length === 0) return null

  const total = complete.length

  return (
    <section className="rounded-md bg-main p-6 lg:p-12">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        {/* Left third — the fixed intro. An <h2> because the page already owns the single <h1>. */}
        <Motion
          tag="div"
          className="flex flex-col gap-4 lg:w-1/3 lg:shrink-0"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-display font-display font-medium text-cream">Leadership</h2>
          <p className="text-body">The people accountable for the standard — and for everything shipped under it.</p>
        </Motion>

        {/* Right two-thirds — leadership cards only (photo · name · role, no bios), then the
            directory strip pointing at the full roster. */}
        <div className="flex flex-col gap-10 lg:w-2/3">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {leaders.map((member, index) => (
              <TeamMemberCard key={member.id ?? index} member={member} index={index} />
            ))}
          </div>

          <Motion
            tag="div"
            className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            <p className="text-body">
              {total} people across two cities<span className="text-subtle"> — one standard.</span>
            </p>
            <Link
              href="/team"
              className="group inline-flex items-center gap-2 text-sm font-medium text-cream transition-colors hover:text-cream-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
            >
              Meet the team
              <ArrowRight size={16} aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Motion>
        </div>
      </div>
    </section>
  )
}
