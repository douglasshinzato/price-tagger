'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { X, RotateCcw, Copy, Check } from 'lucide-react'

interface PriceResult {
  label: string
  value: string
  isCopyable: boolean
}

interface PriceCalculatorProps {
  initialPrice?: number
  initialQuantity?: number
  initialProductName?: string
}

export function PriceCalculator({ initialPrice, initialQuantity, initialProductName }: PriceCalculatorProps) {
  const [productName, setProductName] = useState(initialProductName || '')
  const [basePrice, setBasePrice] = useState(initialPrice?.toString() || '')
  const [itemsQuantity, setItemsQuantity] = useState(initialQuantity?.toString() || '')
  const [results, setResults] = useState<PriceResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCalculate = () => {
    const price = parseFloat(basePrice)
    const items = parseFloat(itemsQuantity)

    if (isNaN(price)) return

    const firstPrice = (price * 1.25).toFixed(2).replace('.', ',')
    const secondPrice = (parseFloat(firstPrice.replace(',', '.')) * 0.85)
      .toFixed(2)
      .replace('.', ',')
    const thirdPrice = (price * 1).toFixed(2).replace('.', ',')
    const tagsNumber = Math.ceil(items / 3)

    const calculatedResults: PriceResult[] = []

    // Adiciona o nome do produto se existir (em maiúsculo)
    if (productName.trim()) {
      const upperCaseName = productName.trim().toUpperCase()
      calculatedResults.push({
        label: upperCaseName,
        value: upperCaseName,
        isCopyable: true,
      })
    }

    calculatedResults.push(
      { label: `R$ ${firstPrice} Crédito em 6x`, value: firstPrice, isCopyable: true },
      { label: `R$ ${secondPrice} Crédito à vista`, value: secondPrice, isCopyable: true },
      { label: `R$ ${thirdPrice} Débito`, value: thirdPrice, isCopyable: true }
    )

    if (!isNaN(tagsNumber)) {
      calculatedResults.push({
        label: `${tagsNumber} Etiqueta(s)`,
        value: tagsNumber.toString(),
        isCopyable: false,
      })
    }

    setResults(calculatedResults)
    setShowResults(true)
  }

  const handleClear = () => {
    setProductName(initialProductName || '')
    setBasePrice(initialPrice?.toString() || '')
    setItemsQuantity(initialQuantity?.toString() || '')
    setResults([])
    setShowResults(false)
    setCopiedIndex(null)
  }

  const handleCopy = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedIndex(index)
      setTimeout(() => {
        setCopiedIndex(null)
      }, 1500)
    } catch (err) {
      console.error('Erro ao copiar: ', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate()
    }
  }

  return (
    <div className="space-y-6">
      {!showResults ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Nome do Produto</Label>
            <div className="relative">
              <Input
                id="product-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Digite o nome do produto"
                className="pr-10"
              />
              {productName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setProductName('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base-price">Preço Base (R$)</Label>
            <Input
              id="base-price"
              type="number"
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0.00"
              disabled={!!initialPrice}
              className={initialPrice ? 'bg-muted' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="items-quantity">Quantidade de Itens</Label>
            <Input
              id="items-quantity"
              type="number"
              value={itemsQuantity}
              onChange={(e) => setItemsQuantity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              disabled={!!initialQuantity}
              className={initialQuantity ? 'bg-muted' : ''}
            />
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!basePrice}
            className="w-full"
            size="lg"
          >
            Calcular
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {results.map((result, index) => (
              <Card
                key={index}
                className={`p-4 transition-all ${result.isCopyable
                  ? 'cursor-pointer hover:bg-accent hover:shadow-md'
                  : 'bg-muted/50'
                  }`}
                onClick={() => result.isCopyable && handleCopy(result.value, index)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.label}</span>
                  {result.isCopyable && (
                    <div className="flex items-center gap-2">
                      {copiedIndex === index ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Copiado!</span>
                        </>
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleClear}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
        </div>
      )}
    </div>
  )
}
