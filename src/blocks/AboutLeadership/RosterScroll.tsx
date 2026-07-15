'use client'
import { TeamMemberCard } from '@/components/sections/teamMemberCard'
import type { Team } from '@/payload-types'
import type { JSX } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

export type RosterSection = { category: string; title: string; members: Team[] }

/**
 * The scrollable right column of the leadership panel. On lg+ the parent panel is a fixed height and
 * this list scrolls inside it; top/bottom fade masks signal more content and vanish once the
 * respective edge is reached. Below lg it is a plain stacked list (no fixed height, no fades).
 */
export function RosterScroll({ sections }: { sections: RosterSection[] }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(true)

  const sync = useCallback(() => {
    const el = ref.current
    if (!el) return
    setAtTop(el.scrollTop <= 1)
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1)
  }, [])

  useEffect(() => {
    sync()
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [sync, sections])

  return (
    <div className="relative lg:h-full lg:w-2/3">
      {/* Top fade — hidden while at the very top. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-16 bg-gradient-to-b from-main to-transparent transition-opacity duration-300 lg:block ${
          atTop ? 'opacity-0' : 'opacity-100'
        }`}
      />

      <div ref={ref} onScroll={sync} className="flex flex-col gap-14 lg:h-full lg:overflow-y-auto lg:pr-2">
        {sections.map(({ category, title, members }) => (
          <section key={category}>
            <h3 className="text-section font-display font-medium text-cream">{title}</h3>
            <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
              {members.map((member, index) => (
                <TeamMemberCard key={member.id ?? index} member={member} index={index} showLinkedInIcon />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom fade — hidden once the end is reached. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-16 bg-gradient-to-t from-main to-transparent transition-opacity duration-300 lg:block ${
          atBottom ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  )
}
