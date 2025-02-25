"use client"

import { useState, useEffect } from "react"
import { collection, doc, setDoc, getDocs } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import Image from "next/image"

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
  "t-Shirts",
  "shorts",
  "bags",
  "hats",
]

export default function AddProductPage() {
  const [documentId, setDocumentId] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [productList, setProductList] = useState<{ id: string; name: string }[]>([])
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"))
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "No Name",
        }))
        setProductList(products)
      } catch (error) {
        console.error("Error fetching products: ", error)
      }
    }

    fetchProducts()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("You must be logged in to add a product")
      return
    }

    if (!documentId.trim()) {
      alert("Please provide a valid document ID")
      return
    }

    if (!category) {
      alert("Please select a category")
      return
    }

    try {
      let imageUrl = ""
      if (image) {
        const imageRef = ref(storage, `products/${image.name}`)
        await uploadBytes(imageRef, image)
        imageUrl = await getDownloadURL(imageRef)
      }

      await setDoc(doc(db, "products", documentId), {
        name,
        price: Number.parseFloat(price),
        description,
        stock: Number.parseInt(stock),
        category,
        imageUrl,
      })
      alert("Product added successfully!")
      setDocumentId("")
      setName("")
      setPrice("")
      setDescription("")
      setStock("")
      setCategory("")
      setImage(null)
      setImagePreview(null)

      const querySnapshot = await getDocs(collection(db, "products"))
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "No Name",
      }))
      setProductList(products)
    } catch (error) {
      console.error("Error adding product: ", error)
      alert("Error adding product")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-grow p-8 grid grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="col-span-2">
          <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="documentId" className="block text-sm font-medium mb-1">
                Document ID
              </label>
              <Input
                id="documentId"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Enter a custom document ID"
                required
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Price
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium mb-1">
                Stock
              </label>
              <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">

            </label>
            </div>
            <Button type="submit" className="w-full">
              Add Product
            </Button>
          </form>
        </div>

        {/* Checker Section */}
        <div className="p-4 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Products List</h2>
          <div>
            <label htmlFor="productList" className="block text-sm font-medium mb-1">
              Existing Products
            </label>
            <select id="productList" className="w-full border rounded p-2">
              {productList.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

