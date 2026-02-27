"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { orderSchema, OrderFormValues } from "@/lib/schemas/order"
import { createOrderAction, updateOrderAction } from "@/app/actions/orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Minus, Plus, Loader2 } from "lucide-react"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LabelOrder } from "@/lib/types"

interface OrderFormProps {
  order?: LabelOrder
  onSuccess?: () => void
}

export function OrderForm({ order, onSuccess }: OrderFormProps = {}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!order

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    mode: "onChange",
    defaultValues: {
      product_name: order?.product_name ?? "",
      product_details: order?.product_details ?? "",
      current_price: order?.current_price ?? undefined,
      needs_price_update: order?.needs_price_update ?? (undefined as unknown as boolean),
      label_quantity: order?.label_quantity ?? 1,
    }
  })

  const quantity = useWatch({ control: form.control, name: "label_quantity" })
  const needsUpdate = useWatch({ control: form.control, name: "needs_price_update" })

  function onSubmit(data: OrderFormValues) {
    startTransition(async () => {
      if (isEditing && order) {
        const res = await updateOrderAction(order.id, data)
        if (res.success) {
          toast.success("Pedido atualizado com sucesso!")
          onSuccess?.()
          router.refresh()
        } else {
          toast.error("Erro ao atualizar pedido: " + res.error)
        }
      } else {
        const res = await createOrderAction(data)
        if (res.success) {
          toast.success("Pedido realizado com sucesso!")
          form.reset()
          onSuccess?.()
          router.refresh()
        } else {
          toast.error("Erro ao criar pedido: " + res.error)
        }
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="product_name">Nome do Produto</Label>
        <Input
          id="product_name"
          {...form.register("product_name")}
          placeholder="Ex: Rapala"
        />
        {form.formState.errors.product_name && (
          <p className="text-xs text-destructive">{form.formState.errors.product_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_details">Características do Produto (opcional)</Label>
        <Input
          id="product_details"
          {...form.register("product_details")}
          placeholder="Ex: 5'8, 6-12lb, Carretilha"
        />
        {form.formState.errors.product_details && (
          <p className="text-xs text-destructive">{form.formState.errors.product_details.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="current_price">Preço Atual</Label>
        <Input
          id="current_price"
          type="number"
          step="0.01"
          placeholder="0.00"
          inputMode="decimal"
          {...form.register("current_price", { valueAsNumber: true })}
        />
        {form.formState.errors.current_price && (
          <p className="text-xs text-destructive">{form.formState.errors.current_price.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Precisa atualizar preço?</Label>
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="needs_update_yes"
              checked={needsUpdate === true}
              onCheckedChange={(checked) => {
                if (checked) form.setValue("needs_price_update", true, { shouldValidate: true })
              }}
            />
            <Label htmlFor="needs_update_yes" className="text-sm font-medium leading-none cursor-pointer">
              Sim
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="needs_update_no"
              checked={needsUpdate === false}
              onCheckedChange={(checked) => {
                if (checked) form.setValue("needs_price_update", false, { shouldValidate: true })
              }}
            />
            <Label htmlFor="needs_update_no" className="text-sm font-medium leading-none cursor-pointer">
              Não
            </Label>
          </div>
        </div>
        {form.formState.errors.needs_price_update && (
          <p className="text-xs text-destructive">{form.formState.errors.needs_price_update.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="label_quantity">Quantidade de Etiquetas</Label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => form.setValue("label_quantity", Math.max(1, (quantity || 1) - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="label_quantity"
            type="number"
            min="1"
            className="text-center font-bold text-lg"
            {...form.register("label_quantity", { valueAsNumber: true })}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => form.setValue("label_quantity", (quantity || 1) + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
        {isPending
          ? <Loader2 className="animate-spin mr-2 h-4 w-4" />
          : isEditing ? "Salvar Alterações" : "Enviar Pedido"
        }
      </Button>

      {isEditing && onSuccess && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onSuccess}
          disabled={isPending}
        >
          Cancelar
        </Button>
      )}
    </form>
  )
}
