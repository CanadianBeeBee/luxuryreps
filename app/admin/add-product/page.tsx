"use client"

import { useState, useEffect } from "react"
import { collection, doc, setDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import Image from "next/image"

const categories = [
  "electronic", "jackets", "vests", "pants", "hoodies", "shoes", "sweater", "trackies", "jerseys", "t-Shirts", "shorts", "bags", "hats",
]

export default function AddProductPage() {
  const [documentId, setDocumentId] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      setImageUrl("")
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
        <div className="col-span-2">
          <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="documentId" value={documentId} onChange={(e) => setDocumentId(e.target.value)} placeholder="Enter a custom document ID" required />
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Enter image URL from UploadThing" required />
            {imageUrl && <Image src={imageUrl} alt="Preview" width={200} height={200} className="mt-2 max-w-full h-auto max-h-48 object-contain" />}
            <Button type="submit" className="w-full">Add Product</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
