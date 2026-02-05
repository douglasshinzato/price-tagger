"use client"

import { LoginForm } from "@/components/login-form"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginContent() {
  const searchParams = useSearchParams()
  const passwordUpdated = searchParams.get("password-updated")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        {passwordUpdated && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
            Senha atualizada com sucesso! Faça login com sua nova senha.
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-4xl">
          <LoginForm />
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
