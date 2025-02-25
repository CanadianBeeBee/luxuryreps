"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, doc, setDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { Navigation } from "@/components/navigation"
import Image from "next/image"

const categories = [
  "Electronic",
  "Jackets",
  "Vests",
  "Pants",
  "Hoodies",
  "Shoes",
  "Sweater",
  "Trackies",
  "Jerseys",
  "T-Shirts",
  "Shorts",
  "Bags",
  "Hats",
]

export default function AddProductPage() {
  const [documentId, setDocumentId] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState("")
  const [productList, setProductList] = useState<{ id: string; name: string }[]>([])
  const { user, loading } = useAuth()
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
        const formData = new FormData()
        formData.append("file", image)
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        )

        const data = await response.json()
        imageUrl = data.secure_url
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="block text-sm font-medium mb-1">Product Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
              {imagePreview && (
                <div>
                  <Image src={imagePreview || "/placeholder.svg"} alt="Product Preview" width={100} height={100} />
                </div>
              )}
            </div>
            <Button type="submit" className="w-full">
              Add Product
            </Button>
          </form>
        </div>

        {/* Checker Section */}
        <div className="p-4 rounded-xl bg-secondary/50">
          <h2 className="text-2xl font-semibold mb-4">Products List</h2>
          <div>
            <label htmlFor="productList" className="block text-sm font-medium mb-1">
              Existing Products
            </label>
            <select id="productList" className="w-full border rounded p-2 bg-background">
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

