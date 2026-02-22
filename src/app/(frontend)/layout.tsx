import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Header from '@/components/sections/header'
import Footer from '@/components/sections/footer'
import { getHeader, getFooter } from '@/utilities/getGlobals'

export const revalidate = 0

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 200 300 400 500 600 700 800 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 200 300 400 500 600 700 800 900',
})

export const metadata: Metadata = {
  title: 'Ternary Solutions ',
  description:
    'Building products that shape the lives of millions every single day',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [headerData, footerData] = await Promise.all([getHeader(), getFooter()])

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased py-0 bg-black w-full overflow-x-hidden text-[#F4F3EC]`}
      >
        <Header headerData={headerData as React.ComponentProps<typeof Header>['headerData']} />
        <main className="flex flex-col pt-10">{children}</main>
        <Footer footerData={footerData as React.ComponentProps<typeof Footer>['footerData']} />
      </body>
    </html>
  )
}
