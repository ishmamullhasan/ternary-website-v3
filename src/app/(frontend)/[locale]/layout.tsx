import SkipLink from '@/components/a11y/SkipLink'
import AnalyticsBeacon from '@/components/analytics/AnalyticsBeacon'
import LivePreviewListener from '@/components/LivePreviewListener'
import LocaleFab from '@/components/LocaleFab'
import Footer from '@/components/sections/footer'
import Header from '@/components/sections/header'
import JsonLd from '@/components/seo/JsonLd'
import { asTypedLocale, LOCALES, type Locale } from '@/lib/i18n/locales'
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo/config'
import { organization, website } from '@/lib/seo/jsonLd'
import { getFooter, getHeader } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getServerSideURL } from '@/utilities/getURL'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import '../globals.css'

// Tag-based ISR (WEB-457): the blanket `revalidate = 0` was removed so published reads can be
// cached. Freshness is now driven on-demand by the `revalidateTag('<slug>')` calls each
// collection/global emits in its afterChange hook, and the header/footer fetchers (getGlobals.ts)
// are wrapped in unstable_cache with the matching `header`/`footer` tags. Live preview stays
// real-time because those fetchers bypass the cache when draftMode is enabled.

// Pre-render the html shell for every locale. en is served unprefixed at the root via a middleware
// rewrite onto this /en segment; bn is served under /bn.
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

// Poppins = display headlines only (design uses Medium 500). Inter = body/UI (variable font,
// all weights). Both exposed as CSS variables and wired to --font-display / --font-sans.
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const defaultOgImage = DEFAULT_OG_IMAGE ? getMediaUrl(DEFAULT_OG_IMAGE) : undefined

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    ...(defaultOgImage ? { images: [{ url: defaultOgImage }] } : {}),
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    ...(defaultOgImage ? { images: [defaultOgImage] } : {}),
  },
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  // Unknown locale segment → 404 (only /en and /bn are valid).
  if (!typedLocale) notFound()

  const [headerData, footerData] = await Promise.all([getHeader(typedLocale), getFooter(typedLocale)])

  // Only mount the live-preview listener when the admin has opened a draft preview (draftMode on),
  // so production visitors never ship the client refresh listener (WEB-449).
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    // scroll-padding-top keeps in-page anchor targets clear of the fixed floating pill.
    <html lang={typedLocale} style={{ scrollPaddingTop: 'calc(var(--nav-h) + var(--nav-gap) + 12px)' }}>
      <body
        className={`${poppins.variable} ${inter.variable} antialiased py-0 bg-page text-cream w-full overflow-x-hidden`}
      >
        {/* Must be the first focusable element in the document (WCAG 2.4.1). */}
        <SkipLink locale={typedLocale as Locale} />
        {/* Sitewide structured data: who publishes this site + the site itself. */}
        <JsonLd data={organization()} />
        <JsonLd data={website()} />
        <Header headerData={headerData as React.ComponentProps<typeof Header>['headerData']} />
        {/* Top offset clears the fixed floating-pill header (the old hero lg:pt-10/pt-4 is folded
            into this so spacing isn't doubled). The locale switcher now lives inside the header. */}
        {/* tabIndex={-1} makes <main> a programmatic focus target for the skip link — without it,
            activating the link scrolls the viewport but leaves focus stranded in the header.
            outline-none is safe here (unlike on a control): SC 2.4.7 governs user interface
            components, and a landmark focused transiently by the skip link is not one. Otherwise
            the global :focus-visible rule would draw a cream outline around the entire page. */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex flex-col focus:outline-none"
          style={{ paddingTop: 'calc(var(--nav-h) + var(--nav-gap) + 12px)' }}
        >
          {children}
        </main>
        <Footer footerData={footerData as React.ComponentProps<typeof Footer>['footerData']} />
        {/* Floating glass language switcher (bottom-right), global across every page. */}
        <LocaleFab />
        {/* First-party pageview beacon (WEB-447). Leaf client component; posts to /api/track. */}
        <AnalyticsBeacon />
        {/* Live-preview refresh listener (WEB-449) — only in draft mode. */}
        {isDraftMode && <LivePreviewListener />}
      </body>
    </html>
  )
}
