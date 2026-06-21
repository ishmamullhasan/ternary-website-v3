'use client'

import { useEffect, useState } from 'react'

interface Heading {
  label: string
  id: string
}

/**
 * "On this page" table of contents with scroll-spy. A continuous left rail (border-line)
 * runs the height of the list; the in-view heading is marked with a 2px eggshell left
 * border + Inter Medium #f4f3ec, inactive items Inter #757571 16px (matches Figma 1879:4995).
 *
 * Uses IntersectionObserver to track the heading currently in view and smooth-scrolls on
 * click. Honors prefers-reduced-motion by skipping smooth-scroll. Client component because
 * it observes the DOM; the heading list is passed in from the server.
 */
export default function InsightToc({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '')

  useEffect(() => {
    if (headings.length === 0) return

    const elements = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost heading currently intersecting the upper portion of the viewport.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-96px 0px -65% 0px', threshold: 0 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    setActiveId(id)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }

  if (headings.length === 0) return null

  return (
    <nav aria-label="On this page">
      <p className="text-[12px] leading-[1.15] text-subtle">On this page</p>
      <ul className="mt-2 flex flex-col gap-2 border-l border-line">
        {headings.map((heading) => {
          const active = heading.id === activeId
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(event) => handleClick(event, heading.id)}
                aria-current={active ? 'true' : undefined}
                className={`-ml-px block border-l-2 pl-4 text-[16px] leading-[1.15] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 ${
                  active ? 'border-cream font-medium text-cream' : 'border-transparent text-subtle hover:text-body'
                }`}
              >
                {heading.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
