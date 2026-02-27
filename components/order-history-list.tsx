"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { OrderListItem } from "@/components/order-list-item"
import { EmployeeOrderItem } from "@/components/employee-order-item"
import { LabelOrder } from "@/lib/types"
import { Search, Clock, CheckCircle, XCircle, LayoutList } from "lucide-react"

type StatusFilter = "all" | "pending" | "completed" | "cancelled"

interface OrderHistoryListProps {
  orders: LabelOrder[]
  variant: "admin" | "employee"
  emptyMessage?: string
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
}: OrderHistoryListProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesSearch =
        !term ||
        order.product_name.toLowerCase().includes(term) ||
        (order.product_details?.toLowerCase().includes(term) ?? false) ||
        (variant === "admin" && order.employee_name.toLowerCase().includes(term))
      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter, variant])

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={variant === "admin" ? "Buscar produto ou funcionário…" : "Buscar produto…"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status filters */}
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

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) =>
            variant === "admin" ? (
              <OrderListItem key={order.id} order={order} />
            ) : (
              <EmployeeOrderItem key={order.id} order={order} />
            )
          )}
        </div>
      )}
    </div>
  )
}
