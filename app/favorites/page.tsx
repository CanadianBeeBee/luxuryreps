"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ProductCard } from "@/components/product-card"
import { useFavorites } from "@/hooks/use-favorites"

const allProducts = [
  {
    id: "1",
    name: "Ralph Lauren Shiny Puffer Jacket Black",
    price: 78.0,
    imageUrl: "/placeholder.svg?height=400&width=400",
  },    
  {
    id: "2",
    name: "Polo Ralph Lauren Zip Hoodie Black Red",
    price: 28.0,
    imageUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "3",
    name: "Burberry Pufferjacket X Vest 2 In 1 Black",
    price: 87.0,
    imageUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "4",
    name: "Louis Vuitton Bunny Varsity College Jacket Cream",
    price: 38.0,
    imageUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "5",
    name: "Stussy Down Jacket Pink Black",
    price: 44.0,
    imageUrl: "/placeholder.svg?height=400&width=400",
  },
]

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const [favoriteProducts, setFavoriteProducts] = useState<typeof allProducts>([])

  useEffect(() => {
    const filteredProducts = allProducts.filter((product) => favorites.includes(product.id))
    setFavoriteProducts(filteredProducts)
  }, [favorites])

  return (
    <div className="min-h-screen bg-background text-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Favorites</h1>
        {favoriteProducts.length === 0 ? (
          <p>You haven&apos;t added any favorites yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

