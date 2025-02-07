"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

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

export default function SupportPage() {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        try {
          await fetchTickets(user.uid)
        } catch (error) {
          console.error("Error fetching tickets:", error)
          setError("Impossible de charger les tickets. Veuillez réessayer plus tard.")
        }
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchTickets = async (userId: string) => {
    try {
      const q = query(collection(db, "tickets"), where("userId", "==", userId), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const fetchedTickets = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Ticket[]
      setTickets(fetchedTickets)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      setTickets([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const newTicket = {
        subject,
        status: "open",
        createdAt: Timestamp.now(),
        userId: user.uid,
        messages: [
          {
            content: message,
            createdAt: Timestamp.now(),
            isAdmin: false,
          },
        ],
      }
      await addDoc(collection(db, "tickets"), newTicket)
      setSubject("")
      setMessage("")
      await fetchTickets(user.uid)
    } catch (error) {
      console.error("Error adding ticket: ", error)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!user) {
    return <div>Veuillez vous connecter pour accéder à cette page.</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Support</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Ouvrir un nouveau ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Sujet
                </label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} />
              </div>
              <Button type="submit">Envoyer le ticket</Button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Vos tickets</h2>
            {tickets.length === 0 ? (
              <p>Vous n avez pas encore de tickets.</p>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardHeader>
                      <CardTitle>{ticket.subject}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Status: {ticket.status === "open" ? "Ouvert" : "Fermé"}
                      </p>
                      <p className="text-sm">Dernier message: {ticket.messages[ticket.messages.length - 1].content}</p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => router.push(`/support/${ticket.id}`)}>Voir le ticket</Button>
                    </CardFooter>
                  </Card>
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

