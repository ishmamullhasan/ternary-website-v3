import Motion from '@/components/animation/motion'
import { TeamMemberCard } from '@/components/sections/teamMemberCard'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import type { Team } from '@/payload-types'
import config from '@payload-config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// SSG: prebuild one static page per locale (generateStaticParams). Freshness is purely tag-driven
// (no time-based revalidate): the Team collection's afterChange/afterDelete hooks bust the `team`
// tag, so edits surface on the next request.

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

const fetchTeam = async (locale: TypedLocale): Promise<Team[]> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'team',
    locale,
    depth: 1, // populate the `image` upload so portraits render
    limit: 200,
    overrideAccess: true,
    // `_order` is the collection's manual (drag-and-drop) ordering — see orderable in collections/team.ts.
    sort: '_order',
  })
  return result.docs as Team[]
}

// Tag-based ISR: cache the published read under the `team` tag the collection's afterChange hook
// revalidates, keyed per-locale so /team and /bn/team don't share an entry.
const getTeam = (locale: TypedLocale): Promise<Team[]> =>
  unstable_cache(() => fetchTeam(locale), [`team_list_${locale}`], { tags: ['team'] })()

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) return {}
  return generateMeta({
    fallbackTitle: 'Meet the Team',
    fallbackDescription: 'The senior engineers and operators behind Ternary.',
    pathname: '/team',
    locale: typedLocale,
  })
}

// Roster sections in display order, keyed by the collection's `category` select. A category with
// no members disappears entirely (heading included) — e.g. Advisors stays hidden until one exists.
const CATEGORY_SECTIONS = [
  { category: 'leader', title: 'Leadership' },
  { category: 'general', title: 'Team' },
  { category: 'advisor', title: 'Advisors' },
] as const

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }): Promise<JSX.Element> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()

  const members = await getTeam(typedLocale)
  const sections = CATEGORY_SECTIONS.map(({ category, title }) => ({
    category,
    title,
    // Docs predating the category field count as 'general' (mirrors the field's defaultValue).
    members: members.filter((m) => (m.category ?? 'general') === category),
  })).filter((s) => s.members.length > 0)

  return (
    <div className="mx-auto w-full max-w-7xl px-5 md:px-8 lg:px-12 pt-12 pb-24 text-cream lg:pt-16">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        {/* Left third — sticky under the floating nav, so the intro stays put while the roster scrolls. */}
        <Motion
          tag="header"
          className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--nav-h)+var(--nav-gap)+24px)] lg:w-1/3 lg:shrink-0"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-display font-display font-medium text-cream">Meet the Team</h1>
          <p className="text-body">
            The senior engineers and operators behind Ternary — the specialists already on your team.
          </p>
        </Motion>

        {/* Right two-thirds — the roster, grouped by category in manual (_order) order. */}
        <div className="flex flex-col gap-14 lg:w-2/3">
          {sections.length > 0 ? (
            sections.map(({ category, title, members: sectionMembers }) => (
              <section key={category}>
                <h2 className="text-section font-display font-medium text-cream">{title}</h2>
                <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
                  {sectionMembers.map((member, index) => (
                    <TeamMemberCard key={member.id ?? index} member={member} index={index} showLinkedInIcon />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className="text-subtle">No team members yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
