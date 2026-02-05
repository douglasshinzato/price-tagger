"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = await createClient()

  // 1. Autenticação no Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Credenciais inválidas" }
  }

  // 2. Busca a role do usuário na tabela employees
  const { data: employee } = await supabase
    .from('employees')
    .select('role')
    .eq('id', data.user.id)
    .single()

  // 3. Redirecionamento baseado na role
  if (employee?.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/employee')
  }
}

export async function signOutAction() {
  const supabase = await createClient()

  // Encerra a sessão no Supabase
  await supabase.auth.signOut()

  // Limpa o cache e redireciona
  redirect("/")
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get("email") as string
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) {
    return { error: "Erro ao enviar email de recuperação" }
  }

  return { success: "Email de recuperação enviado! Verifique sua caixa de entrada." }
}

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get("password") as string
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: "Erro ao atualizar senha" }
  }

  return { success: true }
}