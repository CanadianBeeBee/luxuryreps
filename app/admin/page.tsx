"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { collection, query, getDocs, orderBy, updateDoc, doc, arrayUnion, Timestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  id: string
  content: string
  createdAt: Timestamp
  isAdmin: boolean
}

interface Ticket {
  id: string
  subject: string
  status: "open" | "closed"
  createdAt: Timestamp
  userId: string
  messages: Message[]
}

const isAdmin = (email: string) => email === "admin@admin.com"

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && isAdmin(user.email || "")) {
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
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: "closed" })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return

    try {
      const ticketRef = doc(db, "tickets", selectedTicket.id)
      await updateDoc(ticketRef, {
        messages: arrayUnion({
          content: newMessage,
          createdAt: Timestamp.now(),
          isAdmin: true,
        }),
      })
      setNewMessage("")
      await fetchTickets()
      const updatedTicket = tickets.find((t) => t.id === selectedTicket.id)
      if (updatedTicket) {
        setSelectedTicket(updatedTicket)
      }
    } catch (error) {
      console.error("Error sending message: ", error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Tabs defaultValue="open" className="w-full">
              <TabsList>
                <TabsTrigger value="open">Tickets ouverts</TabsTrigger>
                <TabsTrigger value="closed">Tickets fermés</TabsTrigger>
              </TabsList>
              <TabsContent value="open">
                <TicketList
                  tickets={tickets.filter((t) => t.status === "open")}
                  onSelectTicket={setSelectedTicket}
                  onCloseTicket={handleCloseTicket}
                />
              </TabsContent>
              <TabsContent value="closed">
                <TicketList tickets={tickets.filter((t) => t.status === "closed")} onSelectTicket={setSelectedTicket} />
              </TabsContent>
            </Tabs>
          </div>

          <div>
            {selectedTicket ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedTicket.subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedTicket.messages.map((message, index) => (
                      <div key={index} className={`p-4 rounded-lg ${message.isAdmin ? "bg-blue-100" : "bg-gray-100"}`}>
                        <p className="text-sm text-gray-600 mb-1">
                          {message.isAdmin ? "Admin" : "User"} - {message.createdAt.toDate().toLocaleString()}
                        </p>
                        <p>{message.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <form onSubmit={handleSendMessage} className="w-full space-y-4">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Votre réponse..."
                      required
                    />
                    <Button type="submit">Envoyer</Button>
                  </form>
                </CardFooter>
              </Card>
            ) : (
              <p>Sélectionnez un ticket pour voir les détails</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

interface TicketListProps {
  tickets: Ticket[]
  onSelectTicket: (ticket: Ticket) => void
  onCloseTicket?: (ticketId: string) => void
}

function TicketList({ tickets, onSelectTicket, onCloseTicket }: TicketListProps) {
  return (
    <ul className="space-y-4">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <Card>
            <CardHeader>
              <CardTitle>{ticket.subject}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">User ID: {ticket.userId}</p>
              <p className="text-sm mb-4">Dernier message: {ticket.messages[ticket.messages.length - 1].content}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => onSelectTicket(ticket)} className="mr-2">
                Voir le ticket
              </Button>
              {onCloseTicket && ticket.status === "open" && (
                <Button onClick={() => onCloseTicket(ticket.id)} variant="outline">
                  Fermer le ticket
                </Button>
              )}
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  )
}

