"use client"

import { DEFAULT_QUERY_CLIENT_OPTIONS } from "@/config/defaultQueryClient"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PropsWithChildren, useState } from "react"
import { Container as ModalProvider } from 'react-modal-promise'


export const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(new QueryClient(DEFAULT_QUERY_CLIENT_OPTIONS));

  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider />
      <ReactQueryDevtools position="left" initialIsOpen={false} client={queryClient} />
      {children}
    </QueryClientProvider>
  )
}
