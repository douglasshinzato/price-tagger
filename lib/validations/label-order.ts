import { z } from "zod"

export const labelOrderSchema = z
  .object({
    productName: z.string().min(1, "Nome do produto é obrigatório"),
    currentPrice: z
      .number({ message: "Preço atual deve ser um número" })
      .positive("Preço deve ser maior que zero"),
    needsPriceUpdate: z.boolean(),
    newPrice: z
      .number({ message: "Novo preço deve ser um número" })
      .positive("Novo preço deve ser maior que zero")
      .optional()
      .nullable(),
    labelQuantity: z
      .number({ message: "Quantidade deve ser um número" })
      .int("Quantidade deve ser um número inteiro")
      .positive("Quantidade deve ser maior que zero"),
  })
  .refine(
    (data) => {
      // Se precisa atualizar preço, newPrice é obrigatório
      if (data.needsPriceUpdate && (!data.newPrice || data.newPrice <= 0)) {
        return false
      }
      return true
    },
    {
      message: "Novo preço é obrigatório quando marcado para atualizar",
      path: ["newPrice"],
    }
  )

export type LabelOrderFormValues = z.infer<typeof labelOrderSchema>
