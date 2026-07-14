'use client'

import { NavIcon } from '@/components/nav/megaIcons'
import { localizedHref } from '@/lib/i18n/locales'
import { cn } from '@/utilities/ui'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// ---- Shared shapes (kept structural so they stay decoupled from the generated Payload types) ----
export type MegaResource = { icon?: string | null; label?: string | null; link?: string | null }
export type MegaItem = {
  icon?: string | null
  label?: string | null
  description?: string | null
  link?: string | null
}
export type MegaColumn = { heading?: string | null; items?: MegaItem[] | null }
export type MegaFeatured = {
  enabled?: boolean | null
  badge?: string | null
  title?: string | null
  description?: string | null
  ctaLabel?: string | null
  link?: string | null
}
export type MegaPanel = {
  eyebrow?: string | null
  heading?: string | null
  viewAllLabel?: string | null
  viewAllLink?: string | null
  featured?: MegaFeatured | null
  columns?: MegaColumn[] | null
  resources?: MegaResource[] | null
}
export type NavEntry = {
  label?: string | null
  type?: 'link' | 'mega' | null
  link?: string | null
  panel?: MegaPanel | null
}
export type SecondaryLink = { icon?: string | null; label?: string | null; link?: string | null }

interface Props {
  open: boolean
  menu: NavEntry[]
  secondaryLinks: SecondaryLink[]
  exploreLabel?: string | null
  locale: string
  activeIndex: number | null
  onActiveIndex: (i: number) => void
  onClose: () => void
  reduce: boolean
}

const hasPanel = (e: NavEntry) => e.type === 'mega' && !!e.panel

/** The single full-screen glassmorphic mega menu. Desktop = persistent sidebar + swappable panel;
 *  mobile = a scrollable accordion. Both are data-driven from the Payload header global. */
export default function MegaMenuOverlay({
  open,
  menu,
  secondaryLinks,
  exploreLabel,
  locale,
  activeIndex,
  onActiveIndex,
  onClose,
  reduce,
}: Props) {
  // Mobile accordion open-state, keyed by menu index.
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  // Reset the mobile accordion whenever the overlay closes so it re-opens clean.
  useEffect(() => {
    if (!open) setExpanded({})
  }, [open])

  const active = activeIndex != null ? menu[activeIndex] : undefined
  const panel = active && hasPanel(active) ? active.panel! : undefined

  const href = (link?: string | null) => localizedHref(locale, link)

  const ease = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 300, damping: 32, mass: 0.8 }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mega"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className="fixed inset-0 z-[100] flex flex-col bg-page/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-page/70"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          style={{ WebkitBackdropFilter: 'blur(28px) saturate(160%)', backdropFilter: 'blur(28px) saturate(160%)' }}
        >
          {/* Top bar. Deliberately empty: the logo badge and the burger-turned-close are the header's
              own fixed badges, floating above this overlay at their unchanged coordinates. The height
              is what centres them on this divider — 88 = 2 × (top-5 + half of size-12), and 104 =
              2 × (sm:top-6 + half of sm:size-14). Changing either badge's offset or size means
              changing these two numbers to match. */}
          <div className="h-[88px] shrink-0 border-b border-cream/10 sm:h-[104px]" />

          {/* ============================ DESKTOP (lg+) ============================ */}
          <div className="hidden min-h-0 flex-1 lg:flex">
            {/* Sidebar */}
            <aside className="flex w-[300px] shrink-0 flex-col justify-between border-r border-cream/10 py-9 pl-8 pr-6 xl:w-[340px] xl:pl-12">
              <div>
                {exploreLabel && (
                  <h3 className="mb-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                    {exploreLabel}
                  </h3>
                )}
                <nav className="flex flex-col gap-1">
                  {menu.map((entry, i) => {
                    const mega = hasPanel(entry)
                    const isActive = i === activeIndex
                    if (mega) {
                      return (
                        <button
                          key={i}
                          type="button"
                          onMouseEnter={() => onActiveIndex(i)}
                          onFocus={() => onActiveIndex(i)}
                          onClick={() => onActiveIndex(i)}
                          aria-current={isActive ? 'true' : undefined}
                          className="group relative flex items-center justify-between rounded-md py-2.5 pl-4 pr-2 text-left transition-colors"
                        >
                          {isActive && (
                            <motion.span
                              layoutId="mega-active"
                              className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-cream"
                              transition={ease}
                            />
                          )}
                          <span
                            className={cn(
                              'text-lg font-semibold transition-colors',
                              isActive ? 'text-cream' : 'text-subtle group-hover:text-cream/90',
                            )}
                          >
                            {entry.label}
                          </span>
                          <ChevronDown
                            className={cn(
                              '-rotate-90 size-4 transition-colors',
                              isActive ? 'text-cream/70' : 'text-subtle group-hover:text-cream/70',
                            )}
                            aria-hidden
                          />
                        </button>
                      )
                    }
                    return (
                      <Link
                        key={i}
                        href={href(entry.link)}
                        onClick={onClose}
                        className="group flex items-center justify-between rounded-md py-2.5 pl-4 pr-2 text-lg font-semibold text-subtle transition-colors hover:text-cream/90"
                      >
                        <span>{entry.label}</span>
                        <ArrowUpRight
                          className="size-4 text-subtle transition-colors group-hover:text-cream/70"
                          aria-hidden
                        />
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <div className="flex flex-col gap-4 pl-4">
                {secondaryLinks.map((s, i) => (
                  <Link
                    key={i}
                    href={href(s.link)}
                    onClick={onClose}
                    className="flex items-center gap-3 text-sm text-subtle transition-colors hover:text-cream"
                  >
                    <NavIcon name={s.icon} className="size-4" />
                    {s.label}
                  </Link>
                ))}
              </div>
            </aside>

            {/* Panel */}
            <div className="min-h-0 flex-1 overflow-y-auto px-10 py-9 xl:px-14">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex ?? 'none'}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduce ? 0 : 0.18 }}
                  className="mx-auto max-w-[1200px]"
                >
                  {panel ? <PanelBody panel={panel} href={href} onClose={onClose} /> : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ============================ MOBILE (<lg) ============================ */}
          {/* pb clears the close badge, which sits bottom-left over this scroll area below md. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-4 pb-28 lg:hidden sm:px-8">
            {exploreLabel && (
              <h3 className="mb-3 mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                {exploreLabel}
              </h3>
            )}
            <nav className="flex flex-col">
              {menu.map((entry, i) => {
                const mega = hasPanel(entry)
                if (mega) {
                  const isOpen = !!expanded[i]
                  return (
                    <div key={i} className="border-b border-cream/[0.08]">
                      <button
                        type="button"
                        onClick={() => setExpanded((p) => ({ ...p, [i]: !p[i] }))}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between py-4 text-left text-xl font-semibold text-cream"
                      >
                        <span>{entry.label}</span>
                        <ChevronDown
                          className={cn('size-5 text-subtle transition-transform', isOpen && 'rotate-180 text-cream')}
                          aria-hidden
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: reduce ? 0 : 0.22 }}
                            className="overflow-hidden"
                          >
                            <MobilePanel panel={entry.panel!} href={href} onClose={onClose} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }
                return (
                  <Link
                    key={i}
                    href={href(entry.link)}
                    onClick={onClose}
                    className="flex items-center justify-between border-b border-cream/[0.08] py-4 text-xl font-semibold text-cream"
                  >
                    <span>{entry.label}</span>
                    <ArrowUpRight className="size-5 text-subtle" aria-hidden />
                  </Link>
                )
              })}
            </nav>

            <div className="mt-6 flex flex-col gap-4">
              {secondaryLinks.map((s, i) => (
                <Link
                  key={i}
                  href={href(s.link)}
                  onClick={onClose}
                  className="flex items-center gap-3 text-base text-subtle transition-colors hover:text-cream"
                >
                  <NavIcon name={s.icon} className="size-5" />
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---- Desktop panel body -------------------------------------------------------------------------
function PanelBody({
  panel,
  href,
  onClose,
}: {
  panel: MegaPanel
  href: (l?: string | null) => string
  onClose: () => void
}) {
  const featured = panel.featured?.enabled ? panel.featured : undefined
  const columns = (panel.columns ?? []).filter((c) => (c.items?.length ?? 0) > 0 || c.heading)
  const resources = (panel.resources ?? []).filter((r) => r.label)

  return (
    <>
      {(panel.eyebrow || panel.viewAllLabel) && (
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">{panel.eyebrow}</h3>
          {panel.viewAllLabel && (
            <Link
              href={href(panel.viewAllLink)}
              onClick={onClose}
              className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle transition-colors hover:text-cream"
            >
              {panel.viewAllLabel}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          )}
        </div>
      )}

      {panel.heading && (
        <h2 className="mb-12 max-w-2xl text-3xl font-medium leading-tight tracking-tight text-cream xl:text-[2.6rem]">
          {panel.heading}
        </h2>
      )}

      <div className="flex flex-col gap-12 xl:flex-row">
        {featured && (
          <Link
            href={href(featured.link)}
            onClick={onClose}
            className="group relative flex shrink-0 flex-col overflow-hidden rounded-2xl border border-cream/10 bg-gradient-to-br from-[#241536] to-[#100a1a] p-8 transition-colors hover:border-cream/25 xl:w-[380px]"
          >
            <ArrowUpRight
              className="absolute right-6 top-6 size-5 text-cream/50 transition-colors group-hover:text-cream"
              aria-hidden
            />
            {featured.badge && (
              <span className="mb-14 inline-block w-fit rounded-full border border-cream/15 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cream">
                {featured.badge}
              </span>
            )}
            <h4 className="mb-3 mt-auto text-2xl font-semibold text-cream">{featured.title}</h4>
            {featured.description && (
              <p className="mb-7 max-w-sm text-sm leading-relaxed text-body/80">{featured.description}</p>
            )}
            {featured.ctaLabel && (
              <span className="flex items-center gap-2 text-sm font-semibold text-cream">
                {featured.ctaLabel}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            )}
          </Link>
        )}

        {columns.length > 0 && (
          <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {columns.map((col, i) => (
              <div key={i}>
                {col.heading && (
                  <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.18em] text-subtle">{col.heading}</h4>
                )}
                <div className="flex flex-col gap-7">
                  {(col.items ?? []).map((item, j) => (
                    <Link key={j} href={href(item.link)} onClick={onClose} className="group flex gap-4">
                      {item.icon && (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-cream/10 bg-white/[0.03] text-cream/80 transition-colors group-hover:border-cream/25 group-hover:bg-white/[0.07]">
                          <NavIcon name={item.icon} className="size-[18px]" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <h5 className="mb-1 text-sm font-semibold text-cream transition-colors group-hover:text-cream">
                          {item.label}
                        </h5>
                        {item.description && <p className="text-xs leading-relaxed text-subtle">{item.description}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {resources.length > 0 && (
        <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-cream/[0.08] pt-7">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-subtle">Resources</span>
          <div className="flex flex-wrap gap-3">
            {resources.map((r, i) => (
              <Link
                key={i}
                href={href(r.link)}
                onClick={onClose}
                className="flex items-center gap-2 rounded-full border border-cream/10 bg-white/[0.02] px-4 py-2 text-xs font-medium text-body transition-colors hover:bg-white/[0.07] hover:text-cream"
              >
                <NavIcon name={r.icon} className="size-3.5" />
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ---- Mobile expanded panel (flattened columns) --------------------------------------------------
function MobilePanel({
  panel,
  href,
  onClose,
}: {
  panel: MegaPanel
  href: (l?: string | null) => string
  onClose: () => void
}) {
  const featured = panel.featured?.enabled ? panel.featured : undefined
  const columns = (panel.columns ?? []).filter((c) => (c.items?.length ?? 0) > 0)
  const resources = (panel.resources ?? []).filter((r) => r.label)

  return (
    <div className="flex flex-col gap-6 pb-5">
      {panel.viewAllLabel && (
        <Link
          href={href(panel.viewAllLink)}
          onClick={onClose}
          className="flex w-fit items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-cream/70"
        >
          {panel.viewAllLabel}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      )}

      {featured && (
        <Link
          href={href(featured.link)}
          onClick={onClose}
          className="flex flex-col gap-2 rounded-xl border border-cream/10 bg-gradient-to-br from-[#241536] to-[#100a1a] p-5"
        >
          {featured.badge && (
            <span className="w-fit rounded-full border border-cream/15 bg-black/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cream">
              {featured.badge}
            </span>
          )}
          <span className="text-lg font-semibold text-cream">{featured.title}</span>
          {featured.description && <span className="text-sm text-body/80">{featured.description}</span>}
        </Link>
      )}

      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-4">
          {col.heading && (
            <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-subtle">{col.heading}</h4>
          )}
          {(col.items ?? []).map((item, j) => (
            <Link key={j} href={href(item.link)} onClick={onClose} className="flex gap-3">
              {item.icon && (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-cream/10 bg-white/[0.03] text-cream/80">
                  <NavIcon name={item.icon} className="size-4" />
                </span>
              )}
              <div>
                <div className="text-sm font-semibold text-cream">{item.label}</div>
                {item.description && <div className="text-xs text-subtle">{item.description}</div>}
              </div>
            </Link>
          ))}
        </div>
      ))}

      {resources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {resources.map((r, i) => (
            <Link
              key={i}
              href={href(r.link)}
              onClick={onClose}
              className="flex items-center gap-2 rounded-full border border-cream/10 bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-body"
            >
              <NavIcon name={r.icon} className="size-3.5" />
              {r.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
