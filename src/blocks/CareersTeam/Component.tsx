import Corousel from '@/components/animation/corousel'
import Section from '@/components/layout/section'
import type { CareersTeamBlock, Team } from '@/payload-types'
import { sortByTeamOrder } from '@/utilities/teamOrder'
import type { JSX } from 'react'

export function CareersTeamComponent(props: CareersTeamBlock): JSX.Element {
  // Each row is { member, wide }. Keep only rows whose relationship resolved to a Team doc
  // (depth-populated); `wide` defaults to true so existing/unset rows render at full size.
  // Rows follow the global manual roster order (each row's `wide` flag travels with its member).
  const members = sortByTeamOrder(
    (props.members ?? []).flatMap((row) =>
      row?.member && typeof row.member === 'object'
        ? [{ team: row.member as Team, wide: row.wide !== false, _order: (row.member as Team)._order }]
        : [],
    ),
  )

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
