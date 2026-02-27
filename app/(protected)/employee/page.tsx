import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OrderForm } from "@/components/order-form"
import { OrderHistoryList } from "@/components/order-history-list"
import { CirclePlus, History } from "lucide-react"

export default async function EmployeePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from("label_orders")
    .select("*")
    .eq("employee_id", user?.id)
    .order("created_at", { ascending: false })

  const pendingOrders = orders?.filter((o) => o.status === "pending") || []

  return (
    <div className="flex min-h-svh items-center justify-center p-4 bg-muted/20">
      <Card className="w-full min-w-90 max-w-2xl shadow-lg border-none md:border md:shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Meus Pedidos</CardTitle>
          <CardDescription>Crie e gerencie seus pedidos de etiquetas</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="novo" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
              <TabsTrigger value="novo" className="flex items-center gap-2">
                <CirclePlus className="h-4 w-4" />
                <span>Novo Pedido</span>
              </TabsTrigger>
              <TabsTrigger value="historico" className="relative flex items-center justify-center gap-2">
                <History className="h-4 w-4" />
                <span>Histórico</span>
                {pendingOrders.length > 0 && (
                  <Badge className="md:ml-1 px-1.5 py-0.5 text-[10px] absolute top-1 right-1 md:relative md:top-0 md:right-0" variant="default">
                    {pendingOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-125 pr-4">
              <TabsContent value="novo" className="m-0">
                <OrderForm />
              </TabsContent>

              <TabsContent value="historico" className="m-0">
                <OrderHistoryList
                  orders={orders || []}
                  variant="employee"
                  emptyMessage="Você ainda não fez nenhum pedido."
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

