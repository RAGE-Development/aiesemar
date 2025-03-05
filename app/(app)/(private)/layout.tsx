import payloadConfig from '@/payload.config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'
import { HydrateAuth } from './_components/layout/HydrateAuth'

export const metadata = {
  description: 'TEMPLATE DESCRIPTION',
  title: 'TEMPLATE',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const headers = await getHeaders()
  const payload = await getPayload({ config: await payloadConfig })
  const { user, permissions } = await payload.auth({ headers })

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <HydrateAuth permissions={permissions} user={user}>
      {children}
    </HydrateAuth>
  )
}
