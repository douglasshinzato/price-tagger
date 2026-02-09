import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { OrderForm } from "@/components/order-form"

export default function EmployeePage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-lg shadow-lg border-none md:border md:shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Novo Pedido</CardTitle>
          <CardDescription>
            Solicite a impressão de novas etiquetas de preço
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderForm />
        </CardContent>
      </Card>
    </div>
  )
}
