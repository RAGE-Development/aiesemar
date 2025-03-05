"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useMutation } from "@tanstack/react-query"
import ky, { HTTPError } from 'ky'
import z from 'zod'
import { useForm, SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from "react"
import { CircleArrowOutDownLeft } from "lucide-react"
import { Form } from "@/components/ui/form"
import { InputFormField } from "@/components/formfields/InputFormField"
import { PasswordFormField } from "@/components/formfields/PasswordFormField"
import { ShineBorder } from "@/components/magicui/shine-border"
import { Users } from "@/collections/Users"

const AuthParams = z.object({
  email: z.string().email('Debes de introducir un correo electronico valido!'),
  password: z.string().min(1, 'Ingresa una contraseña')
})

type AuthParams = z.infer<typeof AuthParams>

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()

  const [flags, setflags] = useState({
    isSigninIn: false,
  })

  const form = useForm<AuthParams>({
    resolver: zodResolver(AuthParams),
    mode: 'onChange',
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const { control, handleSubmit } = form

  const updateFlags = (newF: Partial<typeof flags>) => {
    setflags((prev) => ({ ...prev, newF }))
  }

  const authMutation = useMutation<void, void, AuthParams>({
    mutationKey: ['auth', 'sign-in'],
    mutationFn: async (data) => {
      toast.info('Iniciando sesión...')
      updateFlags({ isSigninIn: true })

      await ky.post(`/api/${Users.slug}/login`, {
        json: {
          email: data.email,
          password: data.password
        },
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      }).json()

      return
    },
    onSuccess: () => {
      toast.success('Inicio de sesión correcto...')

      router.replace('/')
    },
    onError: async (err) => {
      const rsp = await (err as unknown as HTTPError).response.json()
      const errMsg = (rsp as { errors: [{ message: string }] }).errors?.[0].message || 'An error occurred. Please try again later.'
      let msg = errMsg
      switch (msg) {
        case "The email or password provided is incorrect.":
          msg = 'El email o la contraseña es incorrecta.'
          break
        default:
          msg = errMsg
      }
      toast.error('Ha ocurrido un error al inciar sesión')
    },
    onSettled: () => {
      updateFlags({ isSigninIn: false })
    }
  })

  const onSubmit: SubmitHandler<AuthParams> = (info) => {
    authMutation.mutate(info)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="relative overflow-hidden">
        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
        <CardHeader>
          <CardTitle className="text-2xl">
            {'Inicia Sesión'}
          </CardTitle>
          <CardDescription>
            {'Ingresa tu email para iniciar sesión en tu cuenta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <InputFormField
                    label="Email"
                    controllerProps={{
                      control,
                      name: 'email'
                    }}
                    disabled={flags.isSigninIn}
                    required
                    placeholder="email@empresa.com"
                  />
                  <PasswordFormField
                    label="Contraseña"
                    controllerProps={{
                      control,
                      name: 'password'
                    }}
                    disabled={flags.isSigninIn}
                    required
                    placeholder="*************"
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={flags.isSigninIn}
                  >
                    {flags.isSigninIn && <CircleArrowOutDownLeft className="mr-2 h-5 animate-spin" />}
                    {'Ingresar'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
