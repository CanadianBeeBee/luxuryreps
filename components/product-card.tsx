"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"

interface ProductCardProps {
  id: string
  name: string
  price: number
  imageUrl: string
  category: string
}

export function ProductCard({ id, name, price, imageUrl }: ProductCardProps) {
  const { favorites, toggleFavorite } = useFavorites()
  const isFavorite = favorites.includes(id)

  return (
    <div className="group flex flex-col gap-4 p-4 bg-secondary/50 rounded-lg border border-border/40 transition-all hover:border-primary/50">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/10 backdrop-blur-sm text-primary hover:bg-background/20"
          onClick={() => toggleFavorite(id)}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium text-lg line-clamp-2 group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-xl font-bold text-primary glow-text">€{price.toFixed(2)} EUR</p>
        <Link href={`/product/${id}`} passHref>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Acheter</Button>
        </Link>
      </div>
    </div>
  )
}

