"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"

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
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        fetchOrders(user.uid)
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchOrders = async (userId: string) => {
    const q = query(collection(db, "orders"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)
    const fetchedOrders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order))
    setOrders(fetchedOrders)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please log in to view this page.</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-grow flex">
        {/* Sidebar */}
        <div className="w-1/4 bg-secondary/50 p-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6">Votre Compte</h2>
          <nav className="w-full">
            <Button variant="ghost" className="w-full flex items-center justify-start mb-3">
              <Package className="w-5 h-5 mr-2" />
              Commandes
            </Button>
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
