"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PayloadRequest, SanitizedPermissions } from "payload";
import React, { PropsWithChildren, useEffect } from "react";


export const HydrateAuth: React.FC<PropsWithChildren<{ permissions: SanitizedPermissions, user: PayloadRequest['user'] }>> = ({ children, user, permissions }) => {

  const qc = useQueryClient()

  const authMutation = useMutation({
    mutationKey: ['auth', 'setSession'],
    mutationFn: async (data: { user: PayloadRequest['user'], permissions: SanitizedPermissions }) => {
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(['auth', 'session'], data)
    }
  })


  useEffect(() => {
    authMutation.mutate({ user, permissions })
  }, [user, permissions, authMutation])

  return (
    <>
      {children}
    </>
  )
}