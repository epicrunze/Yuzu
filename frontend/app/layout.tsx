import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Yuzu - Fresh Research Discovery',
  description: 'Squeeze knowledge from every paper. Discover research papers through an intuitive swipe interface with AI-powered summaries.',
  keywords: 'research, papers, arxiv, academic, citations, bibliography, AI summaries',
  authors: [{ name: 'Yuzu Team' }],
  openGraph: {
    title: 'Yuzu - Fresh Research Discovery',
    description: 'Squeeze knowledge from every paper 🍋',
    type: 'website',
  },
  manifest: '/manifest.json',
  themeColor: '#FFB800',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

