import payloadConfig from '@/payload.config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

export const metadata = {
  description: 'TEMPLATE | Auth',
  title: 'TEMPLATE | Auth',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const headers = await getHeaders()
  const payload = await getPayload({ config: await payloadConfig })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect('/')
  }

  return (
    <>
      {children}
    </>
  )
}
