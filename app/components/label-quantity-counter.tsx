"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LabelQuantityCounterProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function LabelQuantityCounter({
  value,
  onChange,
  disabled = false,
}: LabelQuantityCounterProps) {
  const handleDecrement = () => {
    if (value > 1) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    onChange(value + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10)
    if (!isNaN(newValue) && newValue > 0) {
      onChange(newValue)
    }
    // Allow empty input for user to clear and type new value
    // Form validation will handle enforcement of minimum value
  }

  return (
    <div className="flex items-center gap-3 justify-center">
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        onClick={handleDecrement}
        disabled={disabled || value <= 1}
        aria-label="Diminuir quantidade"
        className="h-12 w-12"
      >
        <Minus className="h-5 w-5" />
      </Button>
      
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className="h-12 w-20 text-center text-lg font-semibold"
        min="1"
        aria-label="Quantidade de etiquetas"
      />
      
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        onClick={handleIncrement}
        disabled={disabled}
        aria-label="Aumentar quantidade"
        className="h-12 w-12"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  )
}
