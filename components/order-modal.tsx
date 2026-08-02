"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { completeOrderAction, cancelOrderAction } from "@/app/actions/orders"
import { OrderModalProps } from "@/lib/types"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,    // Adicionado
  DialogDescription // Adicionado
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { PriceCalculator } from "@/components/price-calculator"
import { Separator } from "@/components/ui/separator"

export function OrderModal({ order, isOpen, onClose }: OrderModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isCancelPending, startCancelTransition] = useTransition()
  const [observations, setObservations] = useState(order?.observations || "")

  const calculateNewPrice = (price: number) => {
    const step1 = price * 1.2
    const decimal = step1 - Math.floor(step1)
    const finalPrice = decimal >= 0.5 ? Math.ceil(step1) : Math.floor(step1)
    const discountValue = finalPrice * 0.16
    const cashValue = finalPrice * 0.84
    return { step1, finalPrice, discountValue, cashValue }
  }

  const calculation = order?.needs_price_update ? calculateNewPrice(order.current_price) : null

  function handleCompleteOrder() {
    startTransition(async () => {
      const result = await completeOrderAction(order.id, calculation?.finalPrice || null, observations)
      if (result.success) {
        toast.success("Pedido concluído com sucesso!")
        onClose()
        router.refresh()
      } else {
        toast.error("Erro ao concluir pedido: " + result.error)
      }
    })
  }

  function handleCancelOrder() {
    startCancelTransition(async () => {
      const result = await cancelOrderAction(order.id)
      if (result.success) {
        toast.success("Pedido cancelado com sucesso!")
        onClose()
        router.refresh()
      } else {
        toast.error("Erro ao cancelar pedido: " + result.error)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-106.25 w-[95vw] rounded-xl border-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Cabeçalho obrigatório para o Dialog funcionar corretamente */}
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido</DialogTitle>
          <DialogDescription>
            Confirme as informações antes de concluir.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Informações do Produto */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Produto</h3>
              <p className="text-lg font-bold">{order?.product_name}</p>
              {order?.product_details && (
                <p className="text-sm text-muted-foreground italic">{order.product_details}</p>
              )}
            </div>

            {/* Preço Atual */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Preço Atual</h3>
              <p className="text-2xl font-bold text-primary">
                R$ {Number(order?.current_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Cálculo de Reajuste */}
            {order?.needs_price_update && calculation && (
              <div className="space-y-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                <h3 className="text-sm font-medium text-orange-900 dark:text-orange-100 flex items-center gap-2">
                  📊 Cálculo do Novo Preço
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1. Valor no dinheiro (desconto de 16%):</span>
                    <span className="font-medium">R$ {calculation.cashValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2. Valor do desconto concedido:</span>
                    <span className="font-medium">R$ {calculation.discountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-orange-200 dark:border-orange-900">
                    <span className="font-semibold text-orange-900 dark:text-orange-100">Novo Preço:</span>
                    <span className="font-bold text-lg text-orange-600 dark:text-orange-400">
                      R$ {calculation.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quantidade */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Quantidade de Etiquetas</h3>
              <p className="text-lg font-semibold">{order?.label_quantity} unidades</p>
            </div>

            {/* Data e Hora */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Data e Hora do Pedido</h3>
              <p className="text-lg font-medium">
                {order?.created_at
                  ? new Date(order.created_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Campo_Grande'
                  })
                  : 'Não disponível'}
              </p>
            </div>

            {/* Solicitante */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Solicitado por</h3>
              <p className="text-lg font-medium">{order?.employee_name}</p>
            </div>

            <Separator className="my-4" />

            {/* Calculadora de Preços */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Calculadora de Preços
              </h3>
              <PriceCalculator
                initialPrice={order?.needs_price_update && calculation ? calculation.finalPrice : order?.current_price}
                initialQuantity={order?.label_quantity}
                initialProductName={order?.product_name}
              />
            </div>

            <Separator className="my-4" />

            {/* Observações */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
              {order?.status === 'pending' ? (
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Adicione observações aqui..."
                  className="min-h-20 resize-y focus-visible:ring-1"
                  disabled={isPending}
                />
              ) : (
                <p className="text-base font-medium whitespace-pre-wrap">{order?.observations || "Sem observações"}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="flex items-center gap-2">
                {order?.status === 'completed' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">Concluído</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="font-medium text-yellow-600">Pendente</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending || isCancelPending}>
            Fechar
          </Button>
          {order?.status === 'pending' && (
            <>
              <Button
                variant="outline"
                onClick={handleCancelOrder}
                disabled={isPending || isCancelPending}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                {isCancelPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Cancelar
              </Button>
              <Button
                onClick={handleCompleteOrder}
                disabled={isPending || isCancelPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Confirmar Conclusão
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}