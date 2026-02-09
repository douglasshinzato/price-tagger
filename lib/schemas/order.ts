import { z } from "zod"

export const orderSchema = z.object({
  product_name: z.string().min(1, "Nome do produto é obrigatório"),
  product_details: z.string().optional(),
  current_price: z.number().positive("Preço deve ser maior que zero"),
  needs_price_update: z.boolean(),
  label_quantity: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
})

export type OrderFormValues = z.infer<typeof orderSchema>