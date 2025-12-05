import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { CartProvider } from '@/contexts/CartContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { PopupProvider } from '@/components/providers/PopupProvider'
import { Header } from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'A2Z Sellr - South Africa\'s Leading Seller Platform',
  description: 'Discover quality businesses nationwide with A2Z Sellr. Mobile-first, award-winning design for South African sellers.',
  metadataBase: new URL('https://a2zsellr.life'),
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'A2Z Sellr - South Africa\'s Leading Seller Platform',
    description: 'Discover quality businesses nationwide with A2Z Sellr. Mobile-first, award-winning design for South African sellers.',
    url: 'https://a2zsellr.life',
    siteName: 'A2Z Sellr',
    images: [
      {
        url: 'https://a2zsellr.life/thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'A2Z Business Directory',
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A2Z Sellr - South Africa\'s Leading Seller Platform',
    description: 'Discover quality businesses nationwide with A2Z Sellr. Mobile-first, award-winning design for South African sellers.',
    images: ['https://a2zsellr.life/thumbnail.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <PopupProvider>
                <Header />
                <main className="relative">
                  {children}
                </main>
              </PopupProvider>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
