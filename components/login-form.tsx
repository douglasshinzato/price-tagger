"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signInAction } from "@/app/actions/auth"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Função para gerenciar a transição de login e capturar erros
  async function handleFormAction(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await signInAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Adicionada a prop action para integração com a Server Action */}
          <form action={handleFormAction} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login</h1>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email" // Necessário para a Server Action
                  type="email"
                  placeholder="m@exemplo.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password" // Necessário para a Server Action
                  type="password"
                  required
                />
              </Field>

              {/* Exibição de erro caso as credenciais falhem */}
              {error && (
                <p className="text-sm font-medium text-destructive text-center">
                  {error}
                </p>
              )}

              <Field>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
              </FieldSeparator>
            </FieldGroup>
          </form>
          <div className="bg-black relative hidden md:flex md:items-center md:justify-center">
            <Image
              src="/saiko-logo-yellow.svg"
              alt="Saiko Logo"
              width={400}
              height={500}
              className="object-cover"
              priority
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}