"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setFavorites(userDoc.data().favorites || [])
        }
      } else {
        setFavorites([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const toggleFavorite = async (id: string) => {
    const user = auth.currentUser
    if (!user) {
      console.error("User not logged in")
      return
    }

    const userRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      const updatedFavorites = userData.favorites.includes(id)
        ? userData.favorites.filter((favId: string) => favId !== id)
        : [...userData.favorites, id]

      await updateDoc(userRef, { favorites: updatedFavorites })
      setFavorites(updatedFavorites)
    }
  }

  return { favorites, toggleFavorite, loading }
}

