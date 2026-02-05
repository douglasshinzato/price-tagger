"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { requestPasswordResetAction } from "@/app/actions/auth"
import { useState, useTransition } from "react"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleFormAction(formData: FormData) {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await requestPasswordResetAction(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.success)
      }
    })
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardContent className="p-6 md:p-8">
            <form action={handleFormAction}>
              <FieldGroup>
                <div className="flex flex-col gap-2 text-center">
                  <h1 className="text-2xl font-bold">Recuperar Senha</h1>
                  <p className="text-sm text-muted-foreground">
                    Digite seu email para receber um link de recuperação
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@exemplo.com"
                    required
                  />
                </Field>

                {error && (
                  <p className="text-sm font-medium text-destructive text-center">
                    {error}
                  </p>
                )}

                {success && (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                    {success}
                  </div>
                )}

                <Field>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Enviar Link de Recuperação"
                    )}
                  </Button>
                </Field>

                <div className="text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para o login
                  </Link>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
