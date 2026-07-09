import type { Locale } from '@/lib/i18n/locales'

// Bypass Blocks (WCAG 2.2 SC 2.4.1). Keyboard and switch users otherwise tab through the whole
// header — including the mega-menu triggers — before reaching page content, on every navigation.
//
// Labels follow the LOCALE_NAME convention in components/LocaleFab.tsx: the site has no i18n
// dictionary, so the handful of localized UI strings live in per-component Record<Locale, string>.
const SKIP_LABEL: Record<Locale, string> = {
  en: 'Skip to main content',
  bn: 'মূল বিষয়বস্তুতে যান',
}

/**
 * Visually hidden until focused, then pinned to the top-left. Must be the first focusable element
 * in the document, so it is mounted as the first child of <body>, before <Header>.
 *
 * The target (`#main-content`) needs `tabIndex={-1}` or activating this link moves the viewport
 * without moving focus — the link would appear to do nothing for a screen-reader user.
 */
export function SkipLink({ locale }: { locale: Locale }) {
  return (
    <a
      href="#main-content"
      className="sr-only rounded-md bg-cream px-4 py-2 font-medium text-page focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[200]"
    >
      {SKIP_LABEL[locale]}
    </a>
  )
}

export default SkipLink
