"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "./product-card"
import { useRef } from "react"

const products = [
  {
    id: "1",
    name: "Ralph Lauren Shiny Puffer Jacket Black",
    price: 78.0,
    imageUrl: "/RLshinypuffer.webp",
  },
  {
    id: "2",
    name: "AMI Paris Knit Sweatshirt Baby Blue",
    price: 38.0,
    imageUrl: "/AMIblue.webp",
  },
  {
    id: "3",
    name: "Burberry Sweater - Gray and Tartan" ,
    price: 87.0,
    imageUrl: "/Buerberrypull.webp",
  },
  {
    id: "4",
    name: "Stussy Hoodie - Black High quality",
    price: 38.0,
    imageUrl: "/Stussysweatshirt.webp",
  },
  {
    id: "5",
    name: "Stone Island Classic Sweat - Black",
    price: 44.0,
    imageUrl: "/SIbasic.webp",
  },
]

export function ProductSlider() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Current Top Sellers</h2>
        <Button variant="outline" className="text-primary hover:bg-primary hover:text-primary-foreground">
          View All
        </Button>
      </div>
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <div ref={scrollRef} className="flex overflow-x-auto gap-6 scroll-smooth hide-scrollbar pb-4">
          {products.map((product) => (
            <div key={product.id} className="flex-none w-[280px]">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  )
}

