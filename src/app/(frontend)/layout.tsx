import Footer from '@/components/sections/footer'
import Header from '@/components/sections/header'
import { getFooter, getHeader } from '@/utilities/getGlobals'
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

export const metadata: Metadata = {
  title: {
    template: '%s | Ternary Solutions',
    default: 'Ternary Solutions',
  },
  description: 'Building products that shape the lives of millions every single day',
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
        <Header headerData={headerData as React.ComponentProps<typeof Header>['headerData']} />
        <main className="flex flex-col lg:pt-10 pt-4">{children}</main>
        <Footer footerData={footerData as React.ComponentProps<typeof Footer>['footerData']} />
      </body>
    </html>
  )
}
