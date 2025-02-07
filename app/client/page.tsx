"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product-card"
import { Pencil, Save } from "lucide-react"

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
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAddress, setEditingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState("")
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
          const data = userDoc.data() as UserData
          setUserData(data)
          setNewAddress(data.address)
          fetchFavoriteProducts(data.favorites)
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

  const handleUpdateAddress = async () => {
    if (user && userData) {
      await updateDoc(doc(db, "users", user.uid), { address: newAddress })
      setUserData({ ...userData, address: newAddress })
      setEditingAddress(false)
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
      <main className="flex-grow flex">
        {/* Sidebar */}
        <div className="w-1/4 bg-secondary/50 p-6 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-muted mb-4 overflow-hidden">
            <Image src="/placeholder.svg" alt="Profile" width={128} height={128} className="object-cover" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{userData.name}</h2>
          <p className="text-muted-foreground mb-4">{user.email}</p>
          <p className="text-sm">
            <strong>Date de naissance:</strong> {userData.birthDate}
          </p>
        </div>

        {/* Main Content */}
        <div className="w-3/4 p-6">
          <h1 className="text-3xl font-bold mb-8">Votre Profil</h1>

          {/* Address Section */}
          <div className="bg-secondary/30 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Adresse de livraison</h3>
            {editingAddress ? (
              <div className="flex items-center">
                <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="flex-grow mr-2" />
                <Button onClick={handleUpdateAddress}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p>{userData.address}</p>
                <Button variant="ghost" onClick={() => setEditingAddress(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </div>
            )}
          </div>

          {/* Favorites Section */}
          <div className="bg-secondary/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Vos Favoris</h3>
            {favoriteProducts.length === 0 ? (
              <p>Vous n avez pas encore ajouté de favoris.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

