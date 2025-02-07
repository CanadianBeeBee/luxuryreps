"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Ticket {
  id: string
  subject: string
  message: string
  status: "open" | "closed"
  createdAt: Date
  userId: string
}

export default function SupportPage() {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        await fetchTickets(user.uid)
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchTickets = async (userId: string) => {
    const q = query(collection(db, "tickets"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const fetchedTickets = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Ticket[]
    setTickets(fetchedTickets)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      await addDoc(collection(db, "tickets"), {
        subject,
        message,
        status: "open",
        createdAt: new Date(),
        userId: user.uid,
      })
      setSubject("")
      setMessage("")
      await fetchTickets(user.uid)
    } catch (error) {
      console.error("Error adding ticket: ", error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
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
              <ul className="space-y-4">
                {tickets.map((ticket) => (
                  <li key={ticket.id} className="bg-secondary/30 rounded-lg p-4">
                    <h3 className="font-semibold">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Status: {ticket.status === "open" ? "Ouvert" : "Fermé"}
                    </p>
                    <p className="text-sm">{ticket.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

