"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { collection, query, getDocs, orderBy, updateDoc, doc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Ticket {
  id: string
  subject: string
  message: string
  status: "open" | "closed"
  createdAt: Date
  userId: string
}

const isAdmin = (email: string) => email === "admin@admin.com"

export default function AdminPage() {
  const [, setUser] = useState<{ uid: string; email: string | null } | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && isAdmin(user.email || "")) {
        setUser(user)
        await fetchTickets()
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchTickets = async () => {
    const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const fetchedTickets = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Ticket[]
    setTickets(fetchedTickets)
  }

  const handleCloseTicket = async (ticketId: string) => {
    await updateDoc(doc(db, "tickets", ticketId), { status: "closed" })
    await fetchTickets()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="open" className="w-full">
          <TabsList>
            <TabsTrigger value="open">Tickets ouverts</TabsTrigger>
            <TabsTrigger value="closed">Tickets fermés</TabsTrigger>
          </TabsList>
          <TabsContent value="open">
            <TicketList tickets={tickets.filter((t) => t.status === "open")} onCloseTicket={handleCloseTicket} />
          </TabsContent>
          <TabsContent value="closed">
            <TicketList tickets={tickets.filter((t) => t.status === "closed")} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

interface TicketListProps {
  tickets: Ticket[]
  onCloseTicket?: (ticketId: string) => void
}

function TicketList({ tickets, onCloseTicket }: TicketListProps) {
  return (
    <ul className="space-y-4">
      {tickets.map((ticket) => (
        <li key={ticket.id} className="bg-secondary/30 rounded-lg p-4">
          <h3 className="font-semibold">{ticket.subject}</h3>
          <p className="text-sm text-muted-foreground mb-2">User ID: {ticket.userId}</p>
          <p className="text-sm mb-4">{ticket.message}</p>
          {ticket.status === "open" && onCloseTicket && (
            <Button onClick={() => onCloseTicket(ticket.id)}>Fermer le ticket</Button>
          )}
        </li>
      ))}
    </ul>
  )
}

