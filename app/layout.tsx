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
  title: 'A2Z Business Directory - South Africa\'s Premium Directory',
  description: 'Discover quality businesses nationwide with A2Z Business Directory. Mobile-first, award-winning design for South African businesses.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
