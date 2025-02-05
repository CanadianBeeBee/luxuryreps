"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Heart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Définir le type de produit
interface Product {
  id: string
  name: string
  category: string
}

const categories = [
  "electronic",
  "jackets",
  "vests",
  "pants",
  "hoodies",
  "shoes",
  "sweater",
  "trackies",
  "jerseys",
  "t-shirts",
  "shorts",
  "bags",
  "hats",
]

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFullResults, setShowFullResults] = useState(false)
  const [products, setProducts] = useState<Product[]>([]) // État pour stocker les produits récupérés depuis Firebase

  // Récupérer les produits depuis Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      const productsRef = collection(db, "products")
      const querySnapshot = await getDocs(productsRef)
      const fetchedProducts: Product[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]

      setProducts(fetchedProducts)
    }

    fetchProducts()
  }, [])

  // Mettre à jour les résultats de la recherche en fonction de la query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = products.filter(
        (product) =>
          (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setSearchResults(filtered)
      setShowSuggestions(true)
      setShowFullResults(false)
    } else {
      setSearchResults([])
      setShowSuggestions(false)
      setShowFullResults(false)
    }
  }, [searchQuery, products])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.length > 0) {
      setShowSuggestions(false)
      setShowFullResults(true)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById("search-container")
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="bg-background">
      <div className="bg-primary/10 text-primary py-2 px-4 text-center text-sm">
        <span className="glow-text">⚡ INSCRIVEZ-VOUS À X-REP ET OBTENEZ UN BONUS DE BIENVENUE DE 10% ! </span>
        <button className="underline ml-2">*cliquez*</button>
      </div>
      <nav className="border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              <Link href="/" className="text-2xl font-bold logo glow-text-white">
                X-Rep
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div id="search-container" className="relative hidden md:block">
                <form onSubmit={handleSearch}>
                  <Input
                    type="search"
                    placeholder="Rechercher dans la boutique"
                    className="w-[300px] bg-secondary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
                    <Search className="h-5 w-5" />
                  </Button>
                </form>

                {showSuggestions && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-secondary border border-border/40 rounded-md shadow-lg">
                    <div className="py-2">
                      {searchResults.slice(0, 5).map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          className="block px-4 py-2 hover:bg-primary/10 transition-colors"
                          onClick={() => setShowSuggestions(false)}
                        >
                          <div className="text-sm">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.category}</div>
                        </Link>
                      ))}
                      {searchResults.length > 5 && (
                        <button
                          className="w-full px-4 py-2 text-sm text-primary hover:bg-primary/10 transition-colors text-left"
                          onClick={(e) => {
                            e.preventDefault()
                            setShowSuggestions(false)
                            setShowFullResults(true)
                          }}
                        >
                          Voir tous les {searchResults.length} résultats
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link href="/favorites">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {isMenuOpen && (
            <div className="py-4 border-t border-border/40">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {showFullResults && (
        <div className="border-t border-border/40">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Résultats de recherche pour &quot; {searchQuery} &quot; ({searchResults.length})
              </h2>
              <Button variant="ghost" onClick={() => setShowFullResults(false)}>
                <X className="h-4 w-4 mr-2" />
                Fermer
              </Button>
            </div>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="block p-4 bg-secondary/50 rounded-lg border border-border/40 hover:border-primary/50 transition-colors"
                  >
                    <h3 className="font-medium mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun résultat trouvé pour &quot; {searchQuery} &quot;</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
