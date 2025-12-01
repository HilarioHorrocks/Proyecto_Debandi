"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Si no hay sesión, limpiar carrito y favoritos
        localStorage.removeItem("cart")
        localStorage.removeItem("auth-token")
        localStorage.removeItem("favorites")
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith("favorites_user_")) {
            localStorage.removeItem(key)
          }
        })
        setUser(null)
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      // Si hay error, limpiar también
      localStorage.removeItem("cart")
      localStorage.removeItem("auth-token")
      localStorage.removeItem("favorites")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al iniciar sesión")
    }

    const data = await response.json()
    setUser(data.user)
    // Guardar token en localStorage
    if (data.token) {
      localStorage.setItem("auth-token", data.token)
    }
    
    // Disparar evento de bienvenida
    window.dispatchEvent(new CustomEvent("user-logged-in", {
      detail: { firstName: data.user.firstName }
    }))
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al registrarse")
    }

    // Auto-login después del registro
    await login(email, password)
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    localStorage.removeItem("auth-token")
    // Limpiar carrito al cerrar sesión
    localStorage.removeItem("cart")
    // Limpiar favoritos al cerrar sesión
    localStorage.removeItem("favorites")
    // Limpiar favoritos por usuario
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith("favorites_user_")) {
        localStorage.removeItem(key)
      }
    })
    window.dispatchEvent(new CustomEvent("favorites-cleared"))
    window.dispatchEvent(new Event("storage"))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
