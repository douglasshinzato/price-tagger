"use client"

import { Button } from "@/components/ui/button"
import { signOutAction } from "@/app/actions/auth"
import { LogOut } from "lucide-react"
import { useTransition } from "react"

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction())}
      className="text-muted-foreground hover:text-destructive gap-2 h-8 px-2 lg:px-3"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Sair</span>
    </Button>
  )
}