import { Navigation } from "@/components/navigation"
import { ProductSlider } from "@/components/product-slider"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <section className="relative h-[70vh] flex items-center justify-center">
        <Image
      src="/preview.jpg" // Remplace par ton chemin
      alt="Hero Image"
      fill
      className="object-cover opacity-100"
      quality={100} // Augmente la qualité (par défaut, c'est 75)
    />


          <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold glow-text-white">THE ULTIMATE COLLECTION</h1>
            <p className="text-xl md:text-2xl text-primary glow-text">Discover exclusive deals on top brands</p>
            <Button size="lg" className="text-lg px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              Shop Now
            </Button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16">
          <ProductSlider />
        </section>

        <section className="bg-secondary/50 py-16">
          <div className="max-w-7xl mx-auto px-4 grid gap-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold glow-text-white">Premium Quality</h2>
                <p className="text-muted-foreground text-lg">
                  Experience luxury and style with our curated collection of premium products.
                </p>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Explore Collection
                </Button>
              </div>
              <div className="relative h-[400px]  glow-text-white ">
                <Image
                  src="/ami.png"
                  alt="Premium Collection"
                  fill
                  className="rounded-lg object-contain shadow-[0_0_10px_rgba(255,255,255,0.7),0_0_20px_rgba(255,255,255,0.6),0_0_30px_rgba(255,255,255,0.5)]"

                />
              </div>
            </div>
{/* Arrival */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative h-[400px] md:order-1">
                <Image
                  src="/airpodsmax.webp"
                  alt="New Arrivals"
                  fill
                  className="rounded-lg object-contain"
                />
              </div>
              <div className="space-y-4 md:order-2">
                <h2 className="text-3xl font-bold glow-text-white">New Arrivals</h2>
                <p className="text-muted-foreground text-lg">
                  Stay ahead of the curve with our latest arrivals. Updated weekly with fresh styles.
                </p>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Shop New Arrivals
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

