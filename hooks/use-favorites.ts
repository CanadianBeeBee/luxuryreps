"use client"

import { useState, useEffect } from "react"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
  }, [])

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id) ? favorites.filter((favId) => favId !== id) : [...favorites, id]
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  return { favorites, toggleFavorite }
}

