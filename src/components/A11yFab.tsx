'use client'

import { cn } from '@/utilities/ui'
import { Accessibility, RotateCcw, Type, Underline, Zap } from 'lucide-react'
import { MotionGlobalConfig } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'ternary:a11y'

interface Prefs {
  reduceMotion: boolean
  largeText: boolean
  underlineLinks: boolean
}

const DEFAULTS: Prefs = { reduceMotion: false, largeText: false, underlineLinks: false }

function readPrefs(): Prefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<Prefs>
    return {
      reduceMotion: !!parsed.reduceMotion,
      largeText: !!parsed.largeText,
      underlineLinks: !!parsed.underlineLinks,
    }
  } catch {
    return DEFAULTS
  }
}

/**
 * Applies the preferences to <html>. The CSS half of each toggle lives in globals.css, keyed off
 * these data-attributes.
 *
 * `reduceMotion` needs a JS half as well: the CSS rule only reaches CSS animations/transitions, and
 * `useReducedMotion()` (which gates our Motion reveals) reads the OS media query, not this pref.
 * `MotionGlobalConfig.skipAnimations` is the supported escape hatch — Motion resolves every
 * animation to its final value instantly, so reveals still show their content, just without travel.
 */
function applyPrefs(p: Prefs) {
  const root = document.documentElement
  if (p.reduceMotion) root.setAttribute('data-a11y-motion', 'reduce')
  else root.removeAttribute('data-a11y-motion')

  if (p.largeText) root.setAttribute('data-a11y-text', 'large')
  else root.removeAttribute('data-a11y-text')

  if (p.underlineLinks) root.setAttribute('data-a11y-links', 'underline')
  else root.removeAttribute('data-a11y-links')

  MotionGlobalConfig.skipAnimations = p.reduceMotion
}

const TOGGLES: { key: keyof Prefs; label: string; icon: typeof Zap }[] = [
  { key: 'reduceMotion', label: 'Reduce motion', icon: Zap },
  { key: 'largeText', label: 'Larger text', icon: Type },
  { key: 'underlineLinks', label: 'Underline links', icon: Underline },
]

/**
 * Floating accessibility preferences panel — the mirror image of LocaleFab: same `.glass` circle,
 * same popover material, pinned to the opposite (bottom-left) corner.
 *
 * Desktop only (`md:flex`). Below md the bottom-left corner already belongs to the mega-menu burger,
 * and these preferences are all reachable another way on a phone: OS-level reduce-motion and text
 * size both feed the same CSS, so a mobile FAB would only add clutter to a crowded viewport.
 *
 * Preferences persist to localStorage and are re-applied on mount. They layer *on top of* the OS
 * settings rather than replacing them — a visitor whose OS already asks for reduced motion gets it
 * from the media query regardless of this toggle.
 */
export default function A11yFab() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const ref = useRef<HTMLDivElement>(null)

  // Hydrate from storage on mount. Server-rendered HTML carries no attributes, so this is the only
  // place they get set — a brief unstyled beat on first paint is the trade for not blocking render.
  useEffect(() => {
    const stored = readPrefs()
    setPrefs(stored)
    applyPrefs(stored)
  }, [])

  const update = (next: Prefs) => {
    setPrefs(next)
    applyPrefs(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Private mode / storage disabled — the pref still applies for this page view.
    }
  }

  const toggle = (key: keyof Prefs) => update({ ...prefs, [key]: !prefs[key] })
  const reset = () => update(DEFAULTS)

  // Outside-click + Escape close the popover (only wired while open), matching LocaleFab.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const activeCount = Object.values(prefs).filter(Boolean).length

  return (
    <div
      ref={ref}
      className="fixed bottom-5 left-5 z-50 hidden flex-col items-start gap-2 sm:bottom-6 sm:left-6 md:flex"
    >
      {open && (
        <div
          role="menu"
          aria-label="Accessibility preferences"
          className="glass min-w-[224px] origin-bottom-left rounded-2xl p-1.5 motion-safe:animate-[accordion-down_160ms_ease-out]"
        >
          <p className="px-3 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-wide text-cream/70">
            Accessibility
          </p>

          {TOGGLES.map(({ key, label, icon: Icon }) => {
            const active = prefs[key]
            return (
              <button
                key={key}
                type="button"
                role="menuitemcheckbox"
                aria-checked={active}
                onClick={() => toggle(key)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] font-medium tracking-normal transition-colors duration-150',
                  active ? 'bg-white/[0.08] text-cream' : 'text-cream/75 hover:bg-white/[0.06] hover:text-cream',
                )}
              >
                <Icon aria-hidden className="size-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {/* Decorative switch — the real state is on aria-checked. */}
                <span
                  aria-hidden
                  className={cn(
                    'flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors duration-150',
                    active ? 'bg-secondary' : 'bg-white/20',
                  )}
                >
                  <span
                    className={cn(
                      'size-3 rounded-full bg-page transition-transform duration-150',
                      active && 'translate-x-3',
                    )}
                  />
                </span>
              </button>
            )
          })}

          <div className="my-1 h-px bg-white/10" />

          <button
            type="button"
            role="menuitem"
            onClick={reset}
            disabled={activeCount === 0}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] font-medium tracking-normal transition-colors duration-150',
              'text-cream/75 hover:bg-white/[0.06] hover:text-cream disabled:pointer-events-none disabled:opacity-40',
            )}
          >
            <RotateCcw aria-hidden className="size-4 shrink-0" />
            <span>Reset to defaults</span>
          </button>
        </div>
      )}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          activeCount > 0 ? `Accessibility preferences — ${activeCount} enabled` : 'Accessibility preferences'
        }
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'glass pointer-events-auto relative flex size-12 items-center justify-center rounded-full text-cream',
          'transition-transform duration-200 motion-safe:hover:scale-105 active:scale-95 sm:size-14',
          open && 'scale-105',
        )}
      >
        <Accessibility aria-hidden className="size-5 sm:size-6" />
        {activeCount > 0 && (
          <span
            aria-hidden
            className="absolute right-1 top-1 size-2 rounded-full bg-secondary ring-2 ring-page/60 sm:right-1.5 sm:top-1.5"
          />
        )}
      </button>
    </div>
  )
}
