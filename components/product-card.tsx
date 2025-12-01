"use client"

import { useState } from "react"
import { Star, ShoppingCart, Heart } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useFavorites } from "@/contexts/favorites-context"
import AuthModal from "./auth-modal"

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: number
    originalPrice?: number
    image: string
    rating: number
    stock: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const favorite = isFavorite(product.id)

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const addToCart = () => {
    // Verificar si el usuario está logueado
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setIsAdding(true)

    const cart = localStorage.getItem("cart")
    let items = cart ? JSON.parse(cart) : []
    if (!Array.isArray(items)) {
      items = []
    }

    const existingItem = items.find((item: any) => item.id === product.id)

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity += 1
      }
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        stock: product.stock,
      })
    }

    localStorage.setItem("cart", JSON.stringify(items))
    window.dispatchEvent(new Event("storage"))

    setTimeout(() => setIsAdding(false), 300)
  }

  const toggleFavorite = () => {
    // Verificar si el usuario está logueado
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // Si está logueado, agregar o quitar de favoritos
    if (favorite) {
      removeFavorite(product.id)
    } else {
      addFavorite(product.id)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
      <div className="relative h-48 bg-muted overflow-hidden">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
            -{discount}%
          </div>
        )}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 left-3 bg-white rounded-full p-2 hover:bg-red-50 transition"
          title={!user ? "Inicia sesión para agregar a favoritos" : favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart className={`w-5 h-5 ${favorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold">Agotado</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{product.name}</h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({product.rating})</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-foreground">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        <button
          onClick={addToCart}
          disabled={product.stock === 0 || isAdding}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
        >
          <ShoppingCart className="w-5 h-5" />
          {isAdding ? "Agregando..." : "Agregar al Carrito"}
        </button>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
