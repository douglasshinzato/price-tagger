"use client"

import Image from "next/image"
import { LogoutButton } from "./logout-button"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react"

interface HeaderProps {
  userName?: string
}

export function Header({ userName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      {/* Adicionado mx-auto para garantir a centralização no ecrã */}
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Image
            src="/saiko-logo-yellow.svg"
            alt="Saiko Logo"
            width={64}
            height={64}
            className="rounded-sm p-1"
          />
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm font-bold tracking-tight uppercase hidden xs:inline">
            Label Counter
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {userName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-r pr-4">
              <User className="h-4 w-4" />
              <span className="font-medium">{userName}</span>
            </div>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}