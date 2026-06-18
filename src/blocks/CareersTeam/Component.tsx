import Corousel from '@/components/animation/corousel'
import Section from '@/components/layout/section'
import type { CareersTeamBlock, Team } from '@/payload-types'
import type { JSX } from 'react'

export function CareersTeamComponent(props: CareersTeamBlock): JSX.Element {
  return (
    <Section
      title={props.heading || 'Team voices. Production stories.'}
      desc={
        props.description ||
        "Our engineers share what it's like to maintain production systems, grow through operational accountability, and build careers around technical depth rather than corporate advancement."
      }
    >
      <Corousel items={(props.members as Team[]) || []} />
    </Section>
  )
}
