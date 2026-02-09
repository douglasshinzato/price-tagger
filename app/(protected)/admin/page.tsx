import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OrderListItem } from "@/components/order-list-item"
import { OrderForm } from "@/components/order-form"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Busca os pedidos do banco de dados conforme o schema (mais antigo primeiro)
  const { data: orders } = await supabase
    .from('label_orders')
    .select('*')
    .order('created_at', { ascending: true })

  const pendingOrders = orders?.filter(o => o.status === 'pending') || []
  const completedOrders = (orders?.filter(o => o.status === 'completed') || []).reverse()
  const historyOrders = [...(orders || [])].reverse()

  return (
    <div className="flex min-h-svh items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-2xl shadow-lg border-none md:border md:shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Painel Admin</CardTitle>
          <CardDescription>Gerencie os pedidos de etiquetas</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="novo" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="novo">Novo Pedido</TabsTrigger>
              <TabsTrigger value="pendentes" className="relative">
                Pendentes
                {pendingOrders.length > 0 && (
                  <Badge className="ml-2 px-1.5 py-0.5 text-[10px]" variant="default">
                    {pendingOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-125 pr-4">
              <TabsContent value="novo" className="m-0">
                <OrderForm />
              </TabsContent>

              <TabsContent value="pendentes" className="space-y-4 m-0">
                {pendingOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum pedido pendente.</p>
                ) : (
                  pendingOrders.map((order) => (
                    <OrderListItem key={order.id} order={order} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="concluidos" className="space-y-4 m-0">
                {completedOrders.map((order) => (
                  <OrderListItem key={order.id} order={order} />
                ))}
              </TabsContent>

              <TabsContent value="historico" className="space-y-4 m-0">
                {historyOrders.map((order) => (
                  <OrderListItem key={order.id} order={order} />
                ))}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}