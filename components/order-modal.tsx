"use client"

import { useTransition } from "react"
import { completeOrderAction } from "@/app/actions/orders" // Importa a Server Action
import {
  Dialog,
  DialogContent,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"

interface Order {
  id: string
  status: string
  needs_price_update: boolean
  current_price: number
}

interface OrderModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
}

export function OrderModal({ order, isOpen, onClose }: OrderModalProps) {
  const [isPending, startTransition] = useTransition()

  const calculateNewPrice = (price: number) => {
    const step1 = price * 0.965
    const step2 = step1 * 1.2
    const decimal = step2 - Math.floor(step2)
    const finalPrice = decimal >= 0.5 ? Math.ceil(step2) : Math.floor(step2)
    return { step1, step2, finalPrice }
  }

  const calculation = order.needs_price_update ? calculateNewPrice(order.current_price) : null

  function handleCompleteOrder() {
    startTransition(async () => {
      const result = await completeOrderAction(order.id, calculation?.finalPrice || null)
      if (result.success) {
        onClose()
      } else {
        alert("Erro ao concluir pedido: " + result.error)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25 w-[95vw] rounded-xl border-none">
        {/* ... cabeçalho e informações anteriores ... */}

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Fechar
          </Button>
          {order.status === 'pending' && (
            <Button
              onClick={handleCompleteOrder}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Confirmar Conclusão
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}