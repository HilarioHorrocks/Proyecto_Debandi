"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

interface FavoritesContextType {
  favorites: number[]
  addFavorite: (productId: number) => void
  removeFavorite: (productId: number) => void
  isFavorite: (productId: number) => boolean
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { user } = useAuth()

  // Cargar favoritos del usuario actual
  useEffect(() => {
    const loadFavorites = () => {
      if (!user) {
        // Sin usuario: no cargar favoritos
        setFavorites([])
      } else {
        // Con usuario: cargar favoritos específicos del usuario
        const userFavKey = `favorites_user_${user.id}`
        const storedFavorites = localStorage.getItem(userFavKey)
        if (storedFavorites) {
          try {
            setFavorites(JSON.parse(storedFavorites))
          } catch (error) {
            console.error("Error loading favorites:", error)
            setFavorites([])
          }
        } else {
          setFavorites([])
        }
      }
      setIsLoaded(true)
    }
    loadFavorites()
  }, [user])

  // Escuchar evento de limpieza de favoritos
  useEffect(() => {
    const handleFavoritesClear = () => {
      setFavorites([])
    }
    window.addEventListener("favorites-cleared", handleFavoritesClear)
    return () => window.removeEventListener("favorites-cleared", handleFavoritesClear)
  }, [])

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    if (isLoaded && user) {
      const userFavKey = `favorites_user_${user.id}`
      localStorage.setItem(userFavKey, JSON.stringify(favorites))
      window.dispatchEvent(new CustomEvent("favorites-updated", { detail: favorites }))
    }
  }, [favorites, isLoaded, user])

  const addFavorite = (productId: number) => {
    setFavorites((prev) => {
      if (!prev.includes(productId)) {
        return [...prev, productId]
      }
      return prev
    })
  }

  const removeFavorite = (productId: number) => {
    setFavorites((prev) => prev.filter((id) => id !== productId))
  }

  const isFavorite = (productId: number) => {
    return favorites.includes(productId)
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
