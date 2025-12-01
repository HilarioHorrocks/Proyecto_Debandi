"use client"

import { Heart } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import { Button } from "./ui/button"

interface FavoriteButtonProps {
  productId: number
  className?: string
}

export default function FavoriteButton({ productId, className = "" }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const favorite = isFavorite(productId)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (favorite) {
      removeFavorite(productId)
    } else {
      addFavorite(productId)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleFavorite}
      className={`${favorite ? "text-red-500" : "text-gray-400 hover:text-red-500"} transition ${className}`}
      title={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <Heart className={`w-5 h-5 ${favorite ? "fill-current" : ""}`} />
    </Button>
  )
}
