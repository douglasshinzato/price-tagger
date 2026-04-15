"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { orderSchema } from "@/lib/schemas/order"
import { isAdminRole } from "@/lib/auth-role"

type OrderInput = z.infer<typeof orderSchema>

export async function completeOrderAction(orderId: string, newPrice: number | null, observations?: string) {
  const supabase = await createClient()

  // 1. Verificar se o usuário está logado e se é admin
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autorizado")

  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('role')
    .eq('id', user.id)
    .single()

  if (employeeError) {
    console.error("[completeOrderAction] erro ao buscar role em employees:", employeeError)
  }

  if (!isAdminRole(employee?.role)) {
    throw new Error("Apenas administradores podem concluir pedidos")
  }

  // 2. Atualizar o pedido
  const updateData: {
    status: string
    completed_at: string
    new_price: number | null
    observations?: string
  } = {
    status: 'completed',
    completed_at: new Date().toISOString(),
    new_price: newPrice
  }

  if (observations !== undefined) {
    updateData.observations = observations
  }

  const { error, count } = await supabase
    .from('label_orders')
    .update(updateData, { count: 'exact' })
    .eq('id', orderId)

  if (error) {
    return { success: false, error: error.message }
  }

  if (count === 0) {
    return { success: false, error: "Permissão negada. Verifique as policies RLS do Supabase para UPDATE em label_orders (admin)." }
  }

  // 3. Revalidar a página do dashboard para mostrar os dados atualizados
  revalidatePath('/admin')
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

  revalidatePath('/employee')
  revalidatePath('/admin')
  return { success: true }
}

export async function updateOrderAction(orderId: string, values: OrderInput) {
  const supabase = await createClient()

  const validatedFields = orderSchema.safeParse(values)
  if (!validatedFields.success) return { success: false, error: "Dados inválidos" }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Não autorizado" }

  // Verificar se o pedido pertence ao funcionário e ainda está pendente
  const { data: existing } = await supabase
    .from('label_orders')
    .select('employee_id, status')
    .eq('id', orderId)
    .single()

  if (!existing) return { success: false, error: "Pedido não encontrado" }
  if (existing.employee_id !== user.id) return { success: false, error: "Não autorizado" }
  if (existing.status !== 'pending') return { success: false, error: "Apenas pedidos pendentes podem ser editados" }

  const { error: updateError, count: updateCount } = await supabase
    .from('label_orders')
    .update(validatedFields.data, { count: 'exact' })
    .eq('id', orderId)

  if (updateError) return { success: false, error: updateError.message }
  if (updateCount === 0) return { success: false, error: "Permissão negada. Verifique as policies RLS do Supabase para UPDATE em label_orders (employee)." }

  revalidatePath('/employee')
  revalidatePath('/admin')
  return { success: true }
}

export async function cancelOrderAction(orderId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Não autorizado" }

  // Verificar role do usuário
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('role')
    .eq('id', user.id)
    .single()

  if (employeeError) {
    console.error("[cancelOrderAction] erro ao buscar role em employees:", employeeError)
  }

  const isAdmin = isAdminRole(employee?.role)

  // Buscar o pedido
  const { data: existing } = await supabase
    .from('label_orders')
    .select('employee_id, status')
    .eq('id', orderId)
    .single()

  if (!existing) return { success: false, error: "Pedido não encontrado" }
  if (!isAdmin && existing.employee_id !== user.id) return { success: false, error: "Não autorizado" }
  if (existing.status !== 'pending') return { success: false, error: "Apenas pedidos pendentes podem ser cancelados" }

  const { error, count } = await supabase
    .from('label_orders')
    .update({ status: 'cancelled' }, { count: 'exact' })
    .eq('id', orderId)

  if (error) {
    console.error('[cancelOrderAction] Supabase error:', error)
    return { success: false, error: error.message }
  }

  if (count === 0) {
    console.error('[cancelOrderAction] Nenhuma linha atualizada. Verifique as policies RLS do Supabase para UPDATE em label_orders.')
    return { success: false, error: "Permissão negada. Verifique as policies RLS do Supabase para UPDATE em label_orders." }
  }

  revalidatePath('/employee')
  revalidatePath('/admin')
  return { success: true }
}

export async function searchOrdersAction(query: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Não autorizado", results: [] }

  const { data: employee } = await supabase
    .from('employees')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = isAdminRole(employee?.role)

  if (!isAdmin) {
    return { success: false, error: "Apenas admins podem buscar", results: [] }
  }

  const searchTerm = query.trim().toLowerCase()
  if (!searchTerm || searchTerm.length < 2) {
    return { success: true, error: null, results: [] }
  }

  // Buscar todos os pedidos e filtrar em memória (para não depender de página)
  const { data: results, error } = await supabase
    .from('label_orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[searchOrdersAction] erro ao buscar pedidos:', error)
    return { success: false, error: error.message, results: [] }
  }

  const filtered = (results || []).filter((order) => {
    const matching =
      order.product_name.toLowerCase().includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm) ||
      (order.product_details?.toLowerCase().includes(searchTerm) ?? false) ||
      (order.employee_name?.toLowerCase().includes(searchTerm) ?? false)
    return matching
  })

  return { success: true, error: null, results: filtered }
}