"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

interface Ticket {
  id: string
  subject: string
  message: string
  status: "open" | "closed"
  createdAt: Date
  userId: string
}

interface PageProps {
  params: {
    id: string
  }
}

export default function SupportTicketPage({ params }: PageProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const ticketDoc = await getDoc(doc(db, "tickets", params.id))
        if (ticketDoc.exists()) {
          setTicket({
            id: ticketDoc.id,
            ...ticketDoc.data(),
          } as Ticket)
        } else {
          router.push("/support")
        }
      } catch (error) {
        console.error("Error fetching ticket:", error)
        router.push("/support")
      } finally {
        setLoading(false)
      }
    }

    fetchTicket()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-xl">Chargement...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-xl">Ticket non trouvé</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Ticket de Support</h1>
          <div className="bg-secondary/30 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{ticket.subject}</h2>
                <p className="text-sm text-muted-foreground">Status: {ticket.status === "open" ? "Ouvert" : "Fermé"}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="whitespace-pre-wrap">{ticket.message}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Créé le: {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

