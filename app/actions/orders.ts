"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { orderSchema } from "@/lib/schemas/order"
import { format } from "date-fns" // date-fns tradicional

type OrderInput = z.infer<typeof orderSchema>

export async function completeOrderAction(orderId: string, newPrice: number | null) {
  const supabase = await createClient()

  // 1. Verificar se o usuário está logado e se é admin
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autorizado")

  const { data: employee } = await supabase
    .from('employees')
    .select('role')
    .eq('id', user.id)
    .single()

  if (employee?.role !== 'admin') {
    throw new Error("Apenas administradores podem concluir pedidos")
  }

  // 2. Atualizar o pedido
  const { error } = await supabase
    .from('label_orders')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      new_price: newPrice
    })
    .eq('id', orderId)

  if (error) {
    return { success: false, error: error.message }
  }

  // 3. Revalidar a página do dashboard para mostrar os dados atualizados
  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function createOrderAction(values: OrderInput) {
  const supabase = await createClient()

  const validatedFields = orderSchema.safeParse(values)
  if (!validatedFields.success) return { success: false, error: "Dados inválidos" }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Não autorizado" }

  const { data: employee } = await supabase
    .from('employees')
    .select('name')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('label_orders')
    .insert({
      ...validatedFields.data,
      employee_id: user.id,
      employee_name: employee?.name || "Funcionário",
      status: 'pending',
      created_at: new Date().toISOString()
    })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/dashboard')
  return { success: true }
}