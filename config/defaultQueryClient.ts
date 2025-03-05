import { QueryClientConfig } from "@tanstack/react-query"

export const DEFAULT_AUTO_REFETCH_INTERVAL = 1000 * 60 * 2

export const DEFAULT_QUERY_CLIENT_OPTIONS: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnMount: true,
      refetchOnReconnect: true,
      retryOnMount: true,
      refetchInterval: DEFAULT_AUTO_REFETCH_INTERVAL,
      retry: true,
      refetchIntervalInBackground: true,
      staleTime: 10 * 1000,
      refetchOnWindowFocus: true,
    },
    mutations: {
      networkMode: 'always',
    }
  },
}