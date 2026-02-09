export interface LabelOrder {
  id: string
  product_name: string
  product_details?: string
  status: 'pending' | 'completed'
  label_quantity: number
  employee_name: string
  current_price: number
  needs_price_update?: boolean
  created_at?: string
  observations?: string
}