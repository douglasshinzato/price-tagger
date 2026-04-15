"use client"

import { useState, useMemo, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { OrderListItem } from "@/components/order-list-item"
import { EmployeeOrderItem } from "@/components/employee-order-item"
import { LabelOrder } from "@/lib/types"
import { Search, Clock, CheckCircle, XCircle, LayoutList, X } from "lucide-react"
import { searchOrdersAction } from "@/app/actions/orders"

type StatusFilter = "all" | "pending" | "completed" | "cancelled"

interface OrderHistoryListProps {
  orders: LabelOrder[]
  variant: "admin" | "employee"
  emptyMessage?: string
  currentUserId?: string
}

const STATUS_FILTERS: { value: StatusFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "Todos", icon: <LayoutList className="h-3.5 w-3.5" /> },
  { value: "pending", label: "Pendentes", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "completed", label: "Concluídos", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  { value: "cancelled", label: "Cancelados", icon: <XCircle className="h-3.5 w-3.5" /> },
]

export function OrderHistoryList({
  orders,
  variant,
  emptyMessage = "Nenhum pedido encontrado.",
  currentUserId,
}: OrderHistoryListProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [searchResults, setSearchResults] = useState<LabelOrder[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, startTransition] = useTransition()

  const hasSearchQuery = search.trim().length > 0
  const displayOrders = hasSearchQuery ? searchResults : orders

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return displayOrders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesSearch =
        !term ||
        order.product_name.toLowerCase().includes(term) ||
        (order.product_details?.toLowerCase().includes(term) ?? false) ||
        (variant === "admin" && order.employee_name.toLowerCase().includes(term))
      return matchesStatus && matchesSearch
    })
  }, [displayOrders, search, statusFilter, variant])

  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const searchTerm = search.trim()
    if (searchTerm.length >= 2 && variant === "admin") {
      setSearchError(null)
      startTransition(async () => {
        const result = await searchOrdersAction(searchTerm)
        if (result.success) {
          setSearchResults(result.results)
          setSearchError(result.error)
        } else {
          setSearchError(result.error || "Erro ao buscar")
          setSearchResults([])
        }
      })
    }
  }

  const handleClearSearch = () => {
    setSearch("")
    setSearchResults([])
    setSearchError(null)
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      {variant === "admin" ? (
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar por ID, produto, funcionário ou detalhes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-10"
              disabled={isSearching}
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {hasSearchQuery && (
            <p className="text-xs text-muted-foreground">
              {isSearching
                ? "Buscando..."
                : searchError
                  ? `Erro: ${searchError}`
                  : `${filtered.length} resultado(s) encontrado(s)`}
            </p>
          )}
        </form>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar produto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Status filters */}
      {!hasSearchQuery && (
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => {
            const count = f.value === "all"
              ? orders.length
              : orders.filter((o) => o.status === f.value).length
            const isActive = statusFilter === f.value
            return (
              <Button
                key={f.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs gap-1.5 px-2.5"
                onClick={() => setStatusFilter(f.value)}
              >
                {f.icon}
                {f.label}
                <span
                  className={`text-[10px] font-semibold px-1 py-0.5 rounded-full ${isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {count}
                </span>
              </Button>
            )
          })}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) =>
            variant === "admin" ? (
              <OrderListItem key={order.id} order={order} currentUserId={currentUserId} />
            ) : (
              <EmployeeOrderItem key={order.id} order={order} />
            )
          )}
        </div>
      )}
    </div>
  )
}
