import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevSync - Developer Portfolio & Collaboration Platform',
  description: 'Build your developer portfolio, discover projects, collaborate with other developers, and get endorsed for your skills.',
  keywords: 'developer, portfolio, collaboration, open source, projects, endorsements',
  authors: [{ name: 'DevSync Team' }],
  openGraph: {
    title: 'DevSync - Developer Portfolio & Collaboration Platform',
    description: 'Build your developer portfolio, discover projects, collaborate with other developers, and get endorsed for your skills.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}
