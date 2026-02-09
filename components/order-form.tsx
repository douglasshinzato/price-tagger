"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { orderSchema, OrderFormValues } from "@/lib/schemas/order"
import { createOrderAction } from "@/app/actions/orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Minus, Plus, Loader2 } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

export function OrderForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    mode: "onChange",
    defaultValues: {
      product_name: "",
      product_details: "",
      needs_price_update: false,
      label_quantity: 1,
    }
  })

  const quantity = useWatch({ control: form.control, name: "label_quantity" })
  const needsUpdate = useWatch({ control: form.control, name: "needs_price_update" })

  function onSubmit(data: OrderFormValues) {
    startTransition(async () => {
      const res = await createOrderAction(data)
      if (res.success) {
        toast.success("Pedido realizado com sucesso!")
        form.reset()
      } else {
        toast.error("Erro ao criar pedido: " + res.error)
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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="needs_update"
          checked={needsUpdate}
          onCheckedChange={(checked: boolean) => form.setValue("needs_price_update", checked)}
        />
        <Label htmlFor="needs_update" className="text-sm font-medium leading-none cursor-pointer">
          Precisa atualizar preço?
        </Label>
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
        {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Enviar Pedido"}
      </Button>
    </form>
  )
}
