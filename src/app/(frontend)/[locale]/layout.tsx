import AnalyticsBeacon from '@/components/analytics/AnalyticsBeacon'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import Footer from '@/components/sections/footer'
import Header from '@/components/sections/header'
import JsonLd from '@/components/seo/JsonLd'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo/config'
import { organization, website } from '@/lib/seo/structuredData'
import { getFooter, getHeader } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getServerSideURL } from '@/utilities/getURL'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { notFound } from 'next/navigation'
import '../globals.css'

export const revalidate = 0

// Always-prefixed routing: pre-render the html shell for every locale (/en, /bn).
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
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

  return (
    <html lang={typedLocale}>
      <body className={`${poppins.variable} antialiased py-0 bg-black w-full overflow-x-hidden text-[#F4F3EC]`}>
        {/* Sitewide structured data: who publishes this site + the site itself. */}
        <JsonLd data={organization()} />
        <JsonLd data={website()} />
        <Header headerData={headerData as React.ComponentProps<typeof Header>['headerData']} />
        {/* Per-locale URL switcher rendered next to the CMS-driven header global (kept light, no
            rewrite of the header global itself). */}
        <LocaleSwitcher currentLocale={typedLocale} />
        <main className="flex flex-col lg:pt-10 pt-4">{children}</main>
        <Footer footerData={footerData as React.ComponentProps<typeof Footer>['footerData']} />
        {/* First-party pageview beacon (WEB-447). Leaf client component; posts to /api/track. */}
        <AnalyticsBeacon />
      </body>
    </html>
  )
}
