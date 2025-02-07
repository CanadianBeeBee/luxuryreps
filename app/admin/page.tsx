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
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  content: string
  createdAt: Timestamp
  isAdmin: boolean
  isRead: boolean
}

interface Ticket {
  id: string
  subject: string
  status: "open" | "closed"
  createdAt: Timestamp
  userId: string
  messages: Message[]
  lastAdminResponse?: Timestamp
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
    await updateDoc(doc(db, "tickets", ticketId), {
      status: "closed",
      lastAdminResponse: Timestamp.now(),
    })
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
      const newMessageObj = {
        content: newMessage,
        createdAt: Timestamp.now(),
        isAdmin: true,
        isRead: false,
      }

      await updateDoc(ticketRef, {
        messages: arrayUnion(newMessageObj),
        lastAdminResponse: Timestamp.now(),
      })

      // Mettre à jour l'interface utilisateur
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

  const getUnreadMessagesCount = (ticket: Ticket) => {
    return ticket.messages.filter((m) => !m.isAdmin && !m.isRead).length
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
                <TabsTrigger value="open" className="relative">
                  Tickets ouverts
                  {tickets.filter((t) => t.status === "open" && getUnreadMessagesCount(t) > 0).length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {tickets.filter((t) => t.status === "open" && getUnreadMessagesCount(t) > 0).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="closed">Tickets fermés</TabsTrigger>
              </TabsList>
              <TabsContent value="open">
                <TicketList
                  tickets={tickets.filter((t) => t.status === "open")}
                  onSelectTicket={setSelectedTicket}
                  selectedTicketId={selectedTicket?.id}
                  getUnreadMessagesCount={getUnreadMessagesCount}
                />
              </TabsContent>
              <TabsContent value="closed">
                <TicketList
                  tickets={tickets.filter((t) => t.status === "closed")}
                  onSelectTicket={setSelectedTicket}
                  selectedTicketId={selectedTicket?.id}
                  getUnreadMessagesCount={getUnreadMessagesCount}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div>
            {selectedTicket ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <p className="text-sm text-muted-foreground">User ID: {selectedTicket.userId}</p>
                  </div>
                  {selectedTicket.status === "open" && (
                    <Button onClick={() => handleCloseTicket(selectedTicket.id)} variant="outline">
                      Fermer le ticket
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {selectedTicket.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${message.isAdmin ? "bg-primary/10 ml-4" : "bg-secondary mr-4"}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{message.isAdmin ? "Admin" : "User"}</span>
                          <span className="text-xs text-muted-foreground">
                            {message.createdAt.toDate().toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
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
                    <Button type="submit" className="w-full">
                      Envoyer la réponse
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Sélectionnez un ticket pour voir les détails</p>
              </div>
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
  selectedTicketId?: string
  getUnreadMessagesCount: (ticket: Ticket) => number
}

function TicketList({ tickets, onSelectTicket, selectedTicketId, getUnreadMessagesCount }: TicketListProps) {
  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card
          key={ticket.id}
          className={`cursor-pointer transition-colors ${selectedTicketId === ticket.id ? "border-primary" : ""}`}
          onClick={() => onSelectTicket(ticket)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {ticket.subject}
                {getUnreadMessagesCount(ticket) > 0 && (
                  <Badge variant="destructive">{getUnreadMessagesCount(ticket)}</Badge>
                )}
              </CardTitle>
              <span className="text-xs text-muted-foreground">{ticket.createdAt.toDate().toLocaleString()}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Dernier message: {ticket.messages[ticket.messages.length - 1]?.content}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

