"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Package, Truck, HeadphonesIcon } from "lucide-react"

interface UserData {
  name: string
  birthDate: string
  address: {
    street: string
    number: string
    postalCode: string
    city: string
  }
  role: string
}

interface Order {
  id: string
  orderDate: string
  status: string
  items: {
    productName: string
    quantity: number
  }[]
}

export default function OrdersPage() {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData)
          fetchOrders(user.uid)
        }
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchOrders = async (userId: string) => {
    const ordersSnapshot = await getDoc(doc(db, "orders", userId))
    if (ordersSnapshot.exists()) {
      setOrders(ordersSnapshot.data().orders)
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
          <h1 className="text-3xl font-bold mb-8">Vos Commandes</h1>
          {orders.length === 0 ? (
            <p>Vous n'avez pas encore de commandes.</p>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-secondary/30 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Commande #{order.id}</h3>
                  <p>
                    <strong>Date de commande:</strong> {order.orderDate}
                  </p>
                  <p>
                    <strong>Statut:</strong> {order.status}
                  </p>
                  <h4 className="mt-4 mb-2 font-semibold">Articles:</h4>
                  <ul className="list-disc ml-6">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.productName} (x{item.quantity})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
