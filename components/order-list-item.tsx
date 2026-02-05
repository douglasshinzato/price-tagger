"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { OrderModal } from "./order-modal"
import { LabelOrder } from "@/lib/types"

export function OrderListItem({ order }: { order: LabelOrder }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer group"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <p className="font-semibold leading-none">{order.product_name}</p>
            <Badge
              variant={order.status === 'completed' ? 'secondary' : 'outline'}
              className="text-[10px] h-5"
            >
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
          <p className="font-bold text-primary">
            R$ {Number(order.current_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>

          {order.needs_price_update && (
            <Badge
              variant="destructive"
              className="text-[10px] uppercase font-bold bg-orange-500 hover:bg-orange-600 border-none"
            >
              Reajuste
            </Badge>
          )}
        </div>
      </div>

      {/* O Modal é chamado aqui, passando o estado para controlá-lo */}
      <OrderModal
        order={order}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}