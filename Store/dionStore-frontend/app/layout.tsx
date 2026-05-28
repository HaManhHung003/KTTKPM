import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/contexts/CartContext'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import CustomerChatPopup from '@/components/CustomerChatPopup'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'dionStore - Đại Tiệc Công Nghệ & Đời Sống',
  description: 'Cửa hàng bán thiết bị điện tử, mỹ phẩm, thời trang và sách chất lượng cao',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className="bg-background" suppressHydrationWarning>
      <body className="font-sans antialiased text-foreground">
        <CartProvider>
          <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
            {children}
            <CustomerChatPopup />
            <Toaster />
          </ThemeProvider>
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
