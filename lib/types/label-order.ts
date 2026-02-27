export interface LabelOrder {
  id: string
  employee_id: string
  product_name: string
  product_details?: string
  status: 'pending' | 'completed' | 'cancelled'
  label_quantity: number
  employee_name: string
  current_price: number
  new_price?: number | null
  needs_price_update?: boolean
  created_at?: string
  completed_at?: string
  observations?: string
}