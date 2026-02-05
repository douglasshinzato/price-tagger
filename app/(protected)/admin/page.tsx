import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LabelOrder {
  id: string | number
  product_name: string
  status: 'pending' | 'completed'
  label_quantity: number
  employee_name: string
  current_price: number
  needs_price_update?: boolean
  created_at?: string
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Busca os pedidos do banco de dados conforme o schema
  const { data: orders } = await supabase
    .from('label_orders')
    .select('*')
    .order('created_at', { ascending: false })

  const pendingOrders = orders?.filter(o => o.status === 'pending') || []
  const completedOrders = orders?.filter(o => o.status === 'completed') || []

  return (
    <div className="flex min-h-svh items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-2xl shadow-lg border-none md:border md:shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Painel Admin</CardTitle>
          <CardDescription>Gerencie os pedidos de etiquetas</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="pendentes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
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
                {orders?.map((order) => (
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

function OrderListItem({ order }: { order: LabelOrder }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer group">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <p className="font-semibold leading-none">{order.product_name}</p>
          {/* Badge de Status para o Histórico */}
          <Badge variant={order.status === 'completed' ? 'secondary' : 'outline'} className="text-[10px] h-5">
            {order.status === 'completed' ? 'Concluído' : 'Pendente'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{order.label_quantity} un.</span>
          <span>•</span>
          <span>{order.employee_name}</span>
        </div>
      </div>

      <div className="text-right flex flex-col items-end gap-1.5">
        <p className="font-bold text-primary">R$ {order.current_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>

        {/* Uso do Badge para Reajuste conforme solicitado */}
        {order.needs_price_update && (
          <Badge variant="destructive" className="text-[10px] uppercase font-bold bg-orange-500 hover:bg-orange-600 border-none">
            Reajuste
          </Badge>
        )}
      </div>
    </div>
  )
}