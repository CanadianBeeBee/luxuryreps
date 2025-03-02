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

export default async function SupportTicketPage({ params }: PageProps) {
  const ticketDoc = await getDoc(doc(db, "tickets", params.id))

  if (!ticketDoc.exists()) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-xl">Ticket not found</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const ticket = { id: ticketDoc.id, ...ticketDoc.data() } as Ticket

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Support Ticket</h1>
          <div className="bg-secondary/30 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{ticket.subject}</h2>
                <p className="text-sm text-muted-foreground">Status: {ticket.status === "open" ? "Open" : "Closed"}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="whitespace-pre-wrap">{ticket.message}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Created on: {new Date(ticket.createdAt).toLocaleDateString()}
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

