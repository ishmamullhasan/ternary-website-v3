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

// SSG + ISR: prebuild one static page per locale (generateStaticParams) and revalidate every 5
// minutes. The Team collection's afterChange hook busts the `team` tag, so edits surface on demand.
export const revalidate = 300

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
    sort: 'name',
  })
  return result.docs as Team[]
}

// Tag-based ISR: cache the published read under the `team` tag the collection's afterChange hook
// revalidates, keyed per-locale so /team and /bn/team don't share an entry.
const getTeam = (locale: TypedLocale): Promise<Team[]> =>
  unstable_cache(() => fetchTeam(locale), [`team_list_${locale}`], { tags: ['team'], revalidate: 300 })()

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

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }): Promise<JSX.Element> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()

  const members = await getTeam(typedLocale)

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pt-12 pb-24 text-cream lg:pt-16">
      <Motion
        tag="header"
        className="flex max-w-2xl flex-col gap-4"
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

      {members.length > 0 ? (
        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:mt-16 lg:grid-cols-5">
          {members.map((member, index) => (
            <TeamMemberCard key={member.id ?? index} member={member} index={index} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-subtle">No team members yet.</p>
      )}
    </div>
  )
}
