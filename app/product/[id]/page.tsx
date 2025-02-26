"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
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


export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      if (typeof params.id !== "string") return
      const docRef = doc(db, "products", params.id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product)
      } else {
        console.log("No such product!")
      }
      setLoading(false)
    }

    fetchProduct()
  }, [params.id])

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-xl">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-xl">Product not found</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
         {/* Product Image */}
<div className="relative">
  <div className="aspect-square overflow-hidden rounded-lg">
    <Image 
      src="/airpodsmax.webp" 
      alt="prod by x" 
      fill 
      className="object-cover" />
  </div>
</div>


          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-bold text-primary">€{product.price.toFixed(2)} EUR</p>
            <p className="text-muted-foreground">{product.description}</p>

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
        </div>
      </main>
      <Footer />
    </div>
  )
}

