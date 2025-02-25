"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  description: string
  stock: number
  imageUrl: string
}

interface ProductActionsProps {
  product: Product
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      <div className="flex items-center space-x-4">
        <span className="text-lg font-medium">Quantity:</span>
        <div className="flex items-center border border-border rounded-md">
          <Button variant="ghost" size="icon" onClick={decrementQuantity} disabled={quantity === 1}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center">{quantity}</span>
          <Button variant="ghost" size="icon" onClick={incrementQuantity} disabled={quantity === product.stock}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stock Information */}
      <p className="text-sm text-muted-foreground">
        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
      </p>

      {/* Add to Cart Button */}
      <Button className="w-full" size="lg" disabled={product.stock === 0}>
        Add to Cart
      </Button>
    </div>
  )
}

