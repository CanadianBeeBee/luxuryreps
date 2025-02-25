"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product-card"
import { Pencil, Save, Package, Truck, HeadphonesIcon, Camera } from "lucide-react"

interface UserData {
  name: string
  birthDate: string
  address: {
    street: string
    number: string
    postalCode: string
    city: string
  }
  favorites: string[]
  role: string
  profilePicture: string
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
  const [newAddress, setNewAddress] = useState({
    street: "",
    number: "",
    postalCode: "",
    city: "",
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
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
            setNewAddress(data.address || { street: "", number: "", postalCode: "", city: "" })
            fetchFavoriteProducts(data.favorites || [])
          } else {
            console.error("User document does not exist")
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchFavoriteProducts = async (favoriteIds: string[]) => {
    try {
      const products = await Promise.all(
        favoriteIds.map(async (id) => {
          const productDoc = await getDoc(doc(db, "products", id))
          if (productDoc.exists()) {
            return { id, ...productDoc.data() } as Product
          } else {
            console.warn(`Product with id ${id} not found`)
            return null
          }
        }),
      )
      setFavoriteProducts(products.filter((product): product is Product => product !== null))
    } catch (error) {
      console.error("Error fetching favorite products:", error)
      setFavoriteProducts([])
    }
  }

  const handleUpdateAddress = async () => {
    if (user && userData) {
      await updateDoc(doc(db, "users", user.uid), { address: newAddress })
      setUserData({ ...userData, address: newAddress })
      setEditingAddress(false)
    }
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
      setUploadingImage(true)
      const file = e.target.files[0]
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        )

        const data = await response.json()
        const downloadURL = data.secure_url

        await updateDoc(doc(db, "users", user.uid), { profilePicture: downloadURL })
        setUserData((prevData) => (prevData ? { ...prevData, profilePicture: downloadURL } : null))
      } catch (error) {
        console.error("Error uploading profile picture:", error)
      }
      setUploadingImage(false)
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
          <div className="w-32 h-32 rounded-full bg-muted mb-4 overflow-hidden relative group">
            <Image
              src={userData.profilePicture || "/placeholder.svg"}
              alt="Profile"
              width={128}
              height={128}
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-8 h-8 text-white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              disabled={uploadingImage}
            />
          </div>
          {uploadingImage && <p className="text-sm text-muted-foreground mb-2">Uploading...</p>}
          <h2 className="text-2xl font-bold mb-2">{userData.name}</h2>
          <p className="text-muted-foreground mb-4">{user.email}</p>
          <p className="text-sm mb-6">
            <strong>Date de naissance:</strong> {userData.birthDate}
          </p>
          <nav className="w-full">
            <Link href="/orders" className="flex items-center text-primary hover:text-primary/80 mb-3">
              <Package className="w-5 h-5 mr-2" />
              Commandes
            </Link>
            <Link href="/delivery-tracking" className="flex items-center text-primary hover:text-primary/80 mb-3">
              <Truck className="w-5 h-5 mr-2" />
              Suivis de Livraison
            </Link>
            <Link href="/support" className="flex items-center text-primary hover:text-primary/80">
              <HeadphonesIcon className="w-5 h-5 mr-2" />
              Support
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="w-3/4 p-6">
          <h1 className="text-3xl font-bold mb-8">Votre Profil</h1>

          {/* Address Section */}
          <div className="bg-secondary/30 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Adresse de livraison</h3>
            {editingAddress ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    value={newAddress.number}
                    onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                    placeholder="N°"
                    className="w-1/4"
                  />
                  <Input
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    placeholder="Nom de la rue"
                    className="flex-grow"
                  />
                </div>
                <div className="flex gap-4">
                  <Input
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    placeholder="Code postal"
                    className="w-1/3"
                  />
                  <Input
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    placeholder="Ville"
                    className="flex-grow"
                  />
                </div>
                <Button onClick={handleUpdateAddress}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            ) : (
              <div>
                {userData.address && (
                  <div className="space-y-2">
                    <p>
                      {userData.address.number} {userData.address.street}
                    </p>
                    <p>
                      {userData.address.postalCode} {userData.address.city}
                    </p>
                    <Button variant="ghost" onClick={() => setEditingAddress(true)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Favorites Section */}
          <div className="bg-secondary/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Vos Favoris</h3>
            {favoriteProducts.length === 0 ? (
              <p>Vous n'avez pas encore ajouté de favoris.</p>
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

