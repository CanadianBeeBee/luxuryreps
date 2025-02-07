"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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

export default function TicketPage({
  params,
  
}: { params: { id: string } } & { searchParams: { [key: string]: string | string[] | undefined } }) {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        try {
          await fetchTicket(params.id)
        } catch (error) {
          console.error("Error fetching ticket:", error)
          setError("Impossible de charger le ticket. Veuillez réessayer plus tard.")
        }
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, params.id])

  const fetchTicket = async (ticketId: string) => {
    const ticketDoc = await getDoc(doc(db, "tickets", ticketId))
    if (ticketDoc.exists()) {
      setTicket({ id: ticketDoc.id, ...ticketDoc.data() } as Ticket)
    } else {
      setError("Ticket non trouvé.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !ticket) return

    try {
      const ticketRef = doc(db, "tickets", ticket.id)
      await updateDoc(ticketRef, {
        messages: arrayUnion({
          content: newMessage,
          createdAt: Timestamp.now(),
          isAdmin: false,
        }),
      })
      setNewMessage("")
      await fetchTicket(ticket.id)
    } catch (error) {
      console.error("Error adding message: ", error)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!user || !ticket) {
    return <div>Ticket non trouvé ou vous n êtes pas autorisé à le voir.</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Ticket: {ticket.subject}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticket.messages.map((message, index) => (
                <div key={index} className={`p-4 rounded-lg ${message.isAdmin ? "bg-blue-100" : "bg-gray-100"}`}>
                  <p className="text-sm text-gray-600 mb-1">
                    {message.isAdmin ? "Admin" : "Vous"} - {message.createdAt.toDate().toLocaleString()}
                  </p>
                  <p>{message.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Votre message..."
            required
            rows={5}
          />
          <Button type="submit">Envoyer</Button>
        </form>
      </main>
      <Footer />
    </div>
  )
}

