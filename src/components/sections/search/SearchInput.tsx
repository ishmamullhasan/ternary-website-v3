'use client'

import { cn } from '@/utilities/ui'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState, type FormEvent, type JSX } from 'react'

interface SearchInputProps {
  /** Routing locale; the form navigates to `/[locale]/search?q=…`. */
  locale: string
  /** Pre-fill the field (e.g. the current `?q=` on the search page). */
  defaultValue?: string
  placeholder?: string
  /** Visible-or-screen-reader label for the input. */
  label?: string
  className?: string
}

/**
 * Locale-aware site-search box (WEB-456). On submit it pushes to `/[locale]/search?q=<query>`,
 * where the server component runs the actual query against the `search` collection. Kept as a
 * dumb client component so it can live in the header, on listing pages, or on the results page.
 */
export default function SearchInput({
  locale,
  defaultValue = '',
  placeholder = 'Search insights, stories, press…',
  label = 'Search the site',
  className,
}: SearchInputProps): JSX.Element {
  const router = useRouter()
  const inputId = useId()
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = value.trim()
    const target = query ? `/${locale}/search?q=${encodeURIComponent(query)}` : `/${locale}/search`
    router.push(target)
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
      />
      <input
        id={inputId}
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-12 w-full rounded-md border border-line bg-ink pl-11 pr-28 text-sm text-cream transition-colors placeholder:text-subtle hover:border-line-strong focus:outline-none focus-visible:border-cream/60 focus-visible:ring-2 focus-visible:ring-cream/40"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 inline-flex min-h-[40px] -translate-y-1/2 items-center rounded-md bg-cream px-4 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-cream-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Search
      </button>
    </form>
  )
}
