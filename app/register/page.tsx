"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [address, setAddress] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Save additional user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        birthDate,
        address,
        favorites: [],
        role: "user", // Ensure all new registrations are regular users
      })

      router.push("/client")
    } catch (error) {
      setError("Failed to register. Please try again.")
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">Create your account</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-2"
                />
              </div>
              <div>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-2"
                />
              </div>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-2"
                />
              </div>
              <div>
                <Input
                  id="birth-date"
                  name="birthDate"
                  type="date"
                  required
                  placeholder="Birth Date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mb-2"
                />
              </div>
              <div>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  required
                  placeholder="Delivery Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <Button type="submit" className="w-full">
                Register
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

