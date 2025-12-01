"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  category: string
  image: string
  stock: number
  brand: string
  featured?: boolean
}

interface FeaturedCarouselProps {
  products: Product[]
  loading: boolean
}

export default function FeaturedCarousel({ products, loading }: FeaturedCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [lastInteraction, setLastInteraction] = useState(0)

  useEffect(() => {
    // Obtener productos destacados o los primeros 3
    const featured = products.filter((p) => p.featured).slice(0, 3)
    if (featured.length < 3) {
      // Si no hay suficientes destacados, agregar más productos
      const remaining = products.filter((p) => !p.featured).slice(0, 3 - featured.length)
      setFeaturedProducts([...featured, ...remaining])
    } else {
      setFeaturedProducts(featured)
    }
  }, [products])

  useEffect(() => {
    if (featuredProducts.length === 0) return

    const interval = setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteraction
      // Si pasaron más de 1 segundo desde la última interacción, avanzar
      if (timeSinceInteraction >= 1000) {
        setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [featuredProducts.length, lastInteraction])

  if (loading || featuredProducts.length === 0) {
    return null
  }

  const nextSlide = () => {
    setLastInteraction(Date.now())
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)
  }

  const prevSlide = () => {
    setLastInteraction(Date.now())
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)
  }

  const currentProduct = featuredProducts[currentSlide]
  const discount = currentProduct.originalPrice
    ? Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
    : 0

  return (
    <div className="w-full bg-gradient-to-b from-background to-muted/30 py-6 md:py-12 mb-6 md:mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 bg-white rounded-lg shadow-lg p-4 md:p-8">
          {/* Flecha izquierda */}
          <button
            onClick={prevSlide}
            className="hidden md:flex flex-shrink-0 p-3 hover:bg-gray-100 rounded-full transition-all duration-300 ease-in-out hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 transition-all duration-300" />
          </button>

          {/* Contenido del carrusel */}
          <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4 md:gap-12 overflow-hidden">
            {/* Imagen con efecto deslizante */}
            <div className="w-full md:w-1/3 relative">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {discount > 0 && (
                  <Badge className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 z-10">
                    OFERTA
                  </Badge>
                )}
                <div className="relative w-full h-full">
                  {featuredProducts.map((product, index) => (
                    <img
                      key={product.id}
                      src={product.image}
                      alt={product.name}
                      className={`absolute w-full h-full object-cover transition-all duration-700 ease-in-out ${
                        index === currentSlide 
                          ? 'opacity-100 scale-100' 
                          : index < currentSlide 
                          ? 'opacity-0 -translate-x-full scale-95' 
                          : 'opacity-0 translate-x-full scale-95'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Información */}
            <div className="flex-1 w-full space-y-3 md:space-y-4 overflow-hidden">
              <div className={`transition-all duration-700 ease-in-out`}>
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">Producto Destacado</p>
                <h2 className="text-xl md:text-3xl font-bold text-foreground line-clamp-2">{currentProduct.name}</h2>
              </div>

              <p className={`text-sm md:text-base text-muted-foreground transition-all duration-700 ease-in-out line-clamp-2`}>{currentProduct.description}</p>

              <div className={`flex items-baseline gap-3 transition-all duration-700 ease-in-out`}>
                <span className="text-2xl md:text-4xl font-bold text-primary">
                  ${currentProduct.price.toFixed(2)}
                </span>
                {currentProduct.originalPrice && (
                  <span className="text-sm md:text-lg text-muted-foreground line-through">
                    ${currentProduct.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <p className={`text-xs md:text-sm text-muted-foreground transition-all duration-700 ease-in-out`}>{currentProduct.brand}</p>

              <Link href={`/listado#${currentProduct.slug}`}>
                <Button className="w-full md:w-auto bg-primary hover:bg-primary/90 transition-all duration-300 text-sm md:text-base">Ver Más</Button>
              </Link>
            </div>
          </div>

          {/* Flecha derecha */}
          <button
            onClick={nextSlide}
            className="hidden md:flex flex-shrink-0 p-3 hover:bg-gray-100 rounded-full transition-all duration-300 ease-in-out hover:scale-110"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 transition-all duration-300" />
          </button>
        </div>

        {/* Flechas móviles */}
        <div className="md:hidden flex justify-between items-center mt-4 gap-2">
          <button
            onClick={prevSlide}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-all duration-300 ease-in-out hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 transition-all duration-300" />
          </button>
          
          <div className="flex justify-center gap-2 flex-1">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setLastInteraction(Date.now())
                  setCurrentSlide(index)
                }}
                className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                  index === currentSlide ? "bg-primary w-6 shadow-lg" : "bg-gray-300 w-2 hover:bg-gray-400"
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-all duration-300 ease-in-out hover:scale-110"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 transition-all duration-300" />
          </button>
        </div>

        {/* Indicadores desktop */}
        <div className="hidden md:flex justify-center gap-3 mt-6">
          {featuredProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setLastInteraction(Date.now())
                setCurrentSlide(index)
              }}
              className={`h-3 rounded-full transition-all duration-500 ease-in-out ${
                index === currentSlide ? "bg-primary w-8 shadow-lg" : "bg-gray-300 w-3 hover:bg-gray-400"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
