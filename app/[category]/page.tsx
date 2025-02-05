"use client"

import { useState, useEffect, use } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { ProductCard } from "@/components/product-card"
import { Footer } from "@/components/footer"

interface Product {
  id: string
  name: string
  price: number
  description: string
  imageUrl: string
  category: string
  stock: number
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params)  // Unwrapping the `params` to get category

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // useEffect now only depends on `category` which should remain constant after the promise resolves
  useEffect(() => {
    if (!category) return; // If category is not available yet, don't proceed

    const fetchProducts = async () => {
      console.log("Fetching products for category:", category)  // Log the category value

      const productsRef = collection(db, "products")

      // Filter by category (case insensitive)
      const q = query(productsRef, where("category", "==", category.toLowerCase()))  // Utiliser category.toLowerCase() pour correspondre à la casse

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        console.log("Aucun produit trouvé pour cette catégorie.")
      } else {
        console.log("Produits récupérés pour la catégorie:", category, querySnapshot.docs.map((doc) => doc.data()))
      }

      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]

      setProducts(productsData)
      setLoading(false)
    }

    fetchProducts()

  }, [category])  // The useEffect hook depends on the `category`

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl">Chargement...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 capitalize">{category}</h1>
        {products.length === 0 ? (
          <p>Aucun produit trouvé dans cette catégorie.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
