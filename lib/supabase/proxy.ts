// lib/supabase/proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresca o token e obtém o utilizador
  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  // 1. Bloqueio de rotas protegidas para utilizadores não logados
  if (!user && (url.pathname.startsWith('/admin') || url.pathname.startsWith('/employee'))) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Busca a role na tabela employees (evita a recursão de RLS com a função que criaste)
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('id', user.id)
      .single()

    // 2. Proteção da rota /admin
    if (url.pathname.startsWith('/admin') && employee?.role !== 'admin') {
      url.pathname = '/employee'
      return NextResponse.redirect(url)
    }

    // 3. Proteção da rota /employee
    if (url.pathname.startsWith('/employee') && employee?.role !== 'employee') {
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // 4. Redireciona se tentar aceder ao login estando já logado
    if (url.pathname === '/') {
      url.pathname = employee?.role === 'admin' ? '/admin' : '/employee'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}