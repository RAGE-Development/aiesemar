import React from 'react'
import '../globals.css'
import { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google'
import { ThemeProvider } from './_components/providers/ThemeProviders';
import { Providers } from './_components/providers/Providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "TEMPLATE",
  description: "TEMPLATE",
  // manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  other: {
    'msapplication-TileColor': '#da532c',
    'theme-color': '#ffffff',
  },
};

export const viewport: Viewport = {
  themeColor: 'black',
  maximumScale: 1,
  initialScale: 1,
  width: 'device-width',
}

const outfit = Outfit({ subsets: ["latin"] })


export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={outfit.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          forcedTheme='dark'
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
