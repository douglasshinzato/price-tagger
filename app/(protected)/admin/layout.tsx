import { Header } from "@/components/header"
import { createClient } from "@/lib/supabase/server"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Obtém o utilizador logado
  const { data: { user } } = await supabase.auth.getUser()

  // Busca o nome na tabela employees
  const { data: employee } = await supabase
    .from('employees')
    .select('name')
    .eq('id', user?.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col">
      <Header userName={employee?.name} />
      <main className="flex-1">{children}</main>
    </div>
  )
}