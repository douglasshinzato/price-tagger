import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OrderHistoryList } from "@/components/order-history-list"
import { OrderListItem } from "@/components/order-list-item"
import { OrderForm } from "@/components/order-form"
import { Button } from "@/components/ui/button"
import { Clock, History, CirclePlus, ChevronLeft, ChevronRight } from "lucide-react"

type AdminDashboardSearchParams = Promise<{
  historyPage?: string
  tab?: string
}>

const HISTORY_PAGE_SIZE = 100

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: AdminDashboardSearchParams
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const currentUserId = user?.id

  const params = await searchParams
  const rawPage = Number(params.historyPage ?? "1")
  const historyPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
  const tabParam = params.tab
  const initialTab =
    tabParam === "novo" || tabParam === "historico" || tabParam === "pendentes"
      ? tabParam
      : historyPage > 1
        ? "historico"
        : "pendentes"

  // Busca apenas pendentes (mais recente primeiro)
  const { data: pendingOrders, error: pendingOrdersError } = await supabase
    .from("label_orders")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Conta total para paginação do histórico
  const { count: totalHistoryOrders, error: historyCountError } = await supabase
    .from("label_orders")
    .select("*", { count: "exact", head: true })

  const totalOrders = totalHistoryOrders ?? 0
  const totalHistoryPages = Math.max(1, Math.ceil(totalOrders / HISTORY_PAGE_SIZE))
  const safeHistoryPage = Math.min(historyPage, totalHistoryPages)
  const historyFrom = (safeHistoryPage - 1) * HISTORY_PAGE_SIZE
  const historyTo = historyFrom + HISTORY_PAGE_SIZE - 1

  const { data: historyOrders, error: historyOrdersError } = await supabase
    .from("label_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .range(historyFrom, historyTo)

  if (pendingOrdersError) {
    console.error("[AdminDashboard] erro ao buscar pedidos pendentes:", pendingOrdersError)
  }

  if (historyCountError) {
    console.error("[AdminDashboard] erro ao contar pedidos do histórico:", historyCountError)
  }

  if (historyOrdersError) {
    console.error("[AdminDashboard] erro ao buscar página do histórico:", historyOrdersError)
  }

  const pending = pendingOrders || []
  const paginatedHistoryOrders = historyOrders || []
  const hasPreviousHistoryPage = safeHistoryPage > 1
  const hasNextHistoryPage = safeHistoryPage < totalHistoryPages

  const previousHistoryHref = `?tab=historico&historyPage=${safeHistoryPage - 1}`
  const nextHistoryHref = `?tab=historico&historyPage=${safeHistoryPage + 1}`

  return (
    <div className="flex min-h-svh items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-2xl shadow-lg border-none md:border md:shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Painel Admin</CardTitle>
          <CardDescription>Gerencie os pedidos de etiquetas</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="mb-6 grid h-14 w-full grid-cols-3">
              <TabsTrigger value="novo" className="flex items-center gap-2">
                <CirclePlus className="h-4 w-4" />
                <span className="hidden md:inline">Novo Pedido</span>
              </TabsTrigger>
              <TabsTrigger value="pendentes" className="relative flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden md:inline">Pendentes</span>
                {pending.length > 0 && (
                  <Badge
                    className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] md:relative md:top-0 md:right-0 md:ml-1"
                    variant="default"
                  >
                    {pending.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden md:inline">Histórico</span>
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-125 pr-2 sm:pr-4">
              <TabsContent value="novo" className="m-0">
                <OrderForm />
              </TabsContent>

              <TabsContent value="pendentes" className="m-0 space-y-4">
                {pending.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">Nenhum pedido pendente.</p>
                ) : (
                  pending.map((order) => (
                    <OrderListItem key={order.id} order={order} currentUserId={currentUserId} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="historico" className="m-0 space-y-3">
                <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <p className="leading-relaxed sm:pr-2">
                    Pagina {safeHistoryPage} de {totalHistoryPages} - {totalOrders} pedidos
                  </p>
                  <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      asChild={hasPreviousHistoryPage}
                      disabled={!hasPreviousHistoryPage}
                    >
                      {hasPreviousHistoryPage ? (
                        <Link href={previousHistoryHref} aria-label="Pagina anterior">
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      asChild={hasNextHistoryPage}
                      disabled={!hasNextHistoryPage}
                    >
                      {hasNextHistoryPage ? (
                        <Link href={nextHistoryHref} aria-label="Proxima pagina">
                          Proxima
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          Proxima
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                <OrderHistoryList
                  orders={paginatedHistoryOrders}
                  variant="admin"
                  emptyMessage="Nenhum pedido no historico."
                  currentUserId={currentUserId}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
