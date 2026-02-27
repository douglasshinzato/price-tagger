"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { OrderForm } from "@/components/order-form"
import { LabelOrder } from "@/lib/types"
import { Pencil, X } from "lucide-react"
import { cancelOrderAction } from "@/app/actions/orders"
import { toast } from "sonner"

export function EmployeeOrderItem({ order }: { order: LabelOrder }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isCancelPending, setIsCancelPending] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="space-y-1.5 flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold leading-none wrap-break-word">{order.product_name}</p>
            <Badge
              variant={order.status === "completed" ? "secondary" : order.status === "cancelled" ? "destructive" : "outline"}
              className="text-[10px] h-5"
            >
              {order.status === "completed" ? "Concluído" : order.status === "cancelled" ? "Cancelado" : "Pendente"}
            </Badge>
          </div>
          {order.product_details && (
            <p className="text-xs text-muted-foreground italic">{order.product_details}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{order.label_quantity} un.</span>
            {order.created_at && (
              <>
                <span>•</span>
                <span>
                  {new Date(order.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "America/Campo_Grande",
                  })}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="font-bold text-primary whitespace-nowrap">
            R${" "}
            {Number(order.current_price).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>

          {order.needs_price_update && (
            <Badge
              variant="destructive"
              className="text-[10px] uppercase font-bold bg-orange-500 hover:bg-orange-600 border-none"
            >
              Reajuste
            </Badge>
          )}

          {order.status === "pending" && (
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-7"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3 w-3" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                onClick={() => setIsCancelling(true)}
              >
                <X className="h-3 w-3" />
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCancelling} onOpenChange={setIsCancelling}>
        <DialogContent
          className="max-w-[320px] w-[90vw] rounded-xl border-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Cancelar Pedido</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar o pedido de <strong>{order.product_name}</strong>? Ele ficará registrado no histórico como cancelado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCancelling(false)}
              disabled={isCancelPending}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              disabled={isCancelPending}
              onClick={async () => {
                setIsCancelPending(true)
                const result = await cancelOrderAction(order.id)
                setIsCancelPending(false)
                if (result.success) {
                  toast.success("Pedido cancelado com sucesso")
                  setIsCancelling(false)
                  router.refresh()
                } else {
                  toast.error(result.error || "Erro ao cancelar pedido")
                }
              }}
            >
              {isCancelPending ? "Cancelando..." : "Cancelar Pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent
          className="sm:max-w-lg w-[95vw] rounded-xl border-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Editar Pedido</DialogTitle>
            <DialogDescription>
              Altere as informações do pedido abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <OrderForm order={order} onSuccess={() => setIsEditing(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
