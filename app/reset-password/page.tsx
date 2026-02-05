"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { updatePasswordAction } from "@/app/actions/auth"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  async function handleFormAction(formData: FormData) {
    setError(null)

    // Validação de senha
    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres")
      return
    }

    startTransition(async () => {
      const result = await updatePasswordAction(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        // Redireciona para o login após sucesso
        router.push("/?password-updated=true")
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
                  <h1 className="text-2xl font-bold">Redefinir Senha</h1>
                  <p className="text-sm text-muted-foreground">
                    Digite sua nova senha
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="password">Nova Senha</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirmar Senha
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                  />
                </Field>

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
                      "Redefinir Senha"
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
