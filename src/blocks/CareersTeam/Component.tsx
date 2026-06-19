import Corousel from '@/components/animation/corousel'
import Section from '@/components/layout/section'
import type { CareersTeamBlock, Team } from '@/payload-types'
import type { JSX } from 'react'

export function CareersTeamComponent(props: CareersTeamBlock): JSX.Element {
  const members = (props.members as Team[] | undefined)?.filter(Boolean) ?? []

  return (
    <Section
      title={props.heading || 'Team voices. Production stories.'}
      desc={
        props.description ||
        "Our engineers share what it's like to maintain production systems, grow through operational accountability, and build careers around technical depth rather than corporate advancement."
      }
    >
      {members.length > 0 ? (
        <Corousel items={members} />
      ) : (
        <div className="rounded-md border border-dashed border-line bg-ink/40 py-12 text-center">
          <p className="text-sm text-subtle">Team stories are on the way — check back soon.</p>
        </div>
      )}
    </Section>
  )
}
