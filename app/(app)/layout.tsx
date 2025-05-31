import type { Metadata } from 'next'

import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import './globals.css'
import { cn } from '@/lib/utils'
import { getServerSideURL } from '@/lib/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  twitter: {
    card: 'summary_large_image',
    creator: '@n3m',
  },
}
