"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product-card"

interface UserData {
  name: string
  birthDate: string
  address: string
  favorites: string[]
  role: string
}

interface Product {
  id: string
  name: string
  price: number
  imageUrl: string
  category: string
}

const isAdmin = (email: string) => email === "admin@admin.com"

export default function ClientPage() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isAdmin(user.email || "")) {
          router.push("/admin/add-product")
          return
        }
        setUser(user)
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData)
          fetchFavoriteProducts(userDoc.data().favorites)
        }
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchFavoriteProducts = async (favoriteIds: string[]) => {
    const products = await Promise.all(
      favoriteIds.map(async (id) => {
        const productDoc = await getDoc(doc(db, "products", id))
        return { id, ...productDoc.data() } as Product
      }),
    )
    setFavoriteProducts(products)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user && userData) {
      const updateData = {
        name: userData.name,
        birthDate: userData.birthDate,
        address: userData.address,
      }
      await updateDoc(doc(db, "users", user.uid), updateData)
      setEditing(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || !userData) {
    return <div>Please log in to view this page.</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome, {userData.name}</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium mb-1">
                    Birth Date
                  </label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={userData.birthDate}
                    onChange={(e) => setUserData({ ...userData, birthDate: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Delivery Address
                  </label>
                  <Input
                    id="address"
                    value={userData.address}
                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                  />
                </div>
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)} className="ml-2">
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <p>
                  <strong>Name:</strong> {userData.name}
                </p>
                <p>
                  <strong>Birth Date:</strong> {userData.birthDate}
                </p>
                <p>
                  <strong>Delivery Address:</strong> {userData.address}
                </p>
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Favorites</h2>
            {favoriteProducts.length === 0 ? (
              <p>You haven&quot;t added any favorites yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

