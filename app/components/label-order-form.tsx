"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatInTimeZone } from "date-fns-tz"
import { Package, DollarSign, Hash, Loader2, Tag, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LabelQuantityCounter } from "./label-quantity-counter"
import { labelOrderSchema, type LabelOrderFormValues } from "@/lib/validations/label-order"
import { createClient } from "@/lib/supabase/client"

export function LabelOrderForm() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<LabelOrderFormValues>({
    resolver: zodResolver(labelOrderSchema),
    defaultValues: {
      productName: "",
      currentPrice: 0,
      needsPriceUpdate: false,
      newPrice: null,
      labelQuantity: 1,
    },
  })

  const needsPriceUpdate = form.watch("needsPriceUpdate")
  const currentPrice = form.watch("currentPrice")
  const newPrice = form.watch("newPrice")

  // Calculate price difference percentage
  const priceDifference = 
    needsPriceUpdate && currentPrice && newPrice
      ? ((newPrice - currentPrice) / currentPrice) * 100
      : 0

  // Auto-focus first field
  useEffect(() => {
    const firstInput = document.querySelector('input[name="productName"]') as HTMLInputElement
    if (firstInput) {
      firstInput.focus()
    }
  }, [])

  const onSubmit = async (values: LabelOrderFormValues) => {
    setIsLoading(true)
    try {
      // Get authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error("Erro de autenticação. Faça login novamente.")
        return
      }

      // Get employee name from employees table
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("name")
        .eq("id", user.id)
        .single()

      if (employeeError) {
        toast.error("Erro ao buscar dados do funcionário.")
        return
      }

      // Format timestamp with MS timezone
      const createdAt = formatInTimeZone(
        new Date(),
        "America/Campo_Grande",
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      )

      // Insert label order
      const { error: insertError } = await supabase.from("label_orders").insert({
        product_name: values.productName,
        current_price: values.currentPrice,
        needs_price_update: values.needsPriceUpdate,
        new_price: values.newPrice || null,
        label_quantity: values.labelQuantity,
        employee_id: user.id,
        employee_name: employee.name,
        status: "pending",
        created_at: createdAt,
      })

      if (insertError) {
        toast.error("Erro ao criar pedido. Tente novamente.")
        console.error("Insert error:", insertError)
        return
      }

      // Success!
      toast.success("Pedido criado com sucesso!", {
        description: `${values.labelQuantity} etiqueta${values.labelQuantity > 1 ? 's' : ''} de ${values.productName}`,
      })

      // Reset form
      form.reset()

      // Refocus first field
      setTimeout(() => {
        const firstInput = document.querySelector('input[name="productName"]') as HTMLInputElement
        if (firstInput) {
          firstInput.focus()
        }
      }, 100)
    } catch (error) {
      toast.error("Erro ao criar pedido. Tente novamente.")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Tag className="h-6 w-6" />
          Novo Pedido
        </CardTitle>
        <CardDescription>
          Preencha os dados para criar um pedido de etiquetas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Name */}
          <FormField
            control={form.control}
            name="productName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Nome do Produto
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Coca-Cola 2L"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Current Price */}
          <FormField
            control={form.control}
            name="currentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Preço Atual
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      disabled={isLoading}
                      className="pl-10"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Needs Price Update Checkbox */}
          <FormField
            control={form.control}
            name="needsPriceUpdate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Precisa atualizar preço?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* New Price (Conditional) */}
          {needsPriceUpdate && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              <FormField
                control={form.control}
                name="newPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Novo Preço
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R$
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          disabled={isLoading}
                          className="pl-10"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || null)
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price Difference Badge */}
              {priceDifference !== 0 && (
                <div className="flex justify-center">
                  <Badge
                    variant={priceDifference > 0 ? "destructive" : "success"}
                    className="text-sm py-1.5 px-3"
                  >
                    {priceDifference > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {priceDifference > 0 ? "+" : ""}
                    {priceDifference.toFixed(1)}%
                  </Badge>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Label Quantity */}
          <FormField
            control={form.control}
            name="labelQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 justify-center text-base">
                  <Hash className="h-5 w-5" />
                  Quantidade de Etiquetas
                </FormLabel>
                <FormControl>
                  <LabelQuantityCounter
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="flex justify-center mt-2">
                  <Badge variant="info" className="text-sm">
                    {field.value} etiqueta{field.value > 1 ? "s" : ""}
                  </Badge>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Criando pedido...
              </>
            ) : (
              <>
                Criar Pedido 🚀
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
