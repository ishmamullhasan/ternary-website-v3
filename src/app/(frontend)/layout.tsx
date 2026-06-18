import Footer from '@/components/sections/footer'
import Header from '@/components/sections/header'
import JsonLd from '@/components/seo/JsonLd'
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo/config'
import { organization, website } from '@/lib/seo/structuredData'
import { getFooter, getHeader } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getServerSideURL } from '@/utilities/getURL'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

export const revalidate = 0

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
}: Readonly<{
  children: React.ReactNode
}>) {
  const [headerData, footerData] = await Promise.all([getHeader(), getFooter()])

  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased py-0 bg-black w-full overflow-x-hidden text-[#F4F3EC]`}>
        {/* Sitewide structured data: who publishes this site + the site itself. */}
        <JsonLd data={organization()} />
        <JsonLd data={website()} />
        <Header headerData={headerData as React.ComponentProps<typeof Header>['headerData']} />
        <main className="flex flex-col lg:pt-10 pt-4">{children}</main>
        <Footer footerData={footerData as React.ComponentProps<typeof Footer>['footerData']} />
      </body>
    </html>
  )
}
