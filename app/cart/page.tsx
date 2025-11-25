"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CartItems from "@/components/cart-items"
import CartSummary from "@/components/cart-summary"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function CartPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirigir si no está logueado
    if (!user) {
      router.push("/")
      return
    }

    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const parsed = JSON.parse(savedCart)
      if (Array.isArray(parsed)) {
        setItems(parsed)
      }
    }
    setLoading(false)
  }, [user, router])

  const updateCart = (newItems: any) => {
    setItems(newItems)
    localStorage.setItem("cart", JSON.stringify(newItems))
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onSearch={() => {}} />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <div className="animate-pulse">Cargando carrito...</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onSearch={() => {}} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-75 transition mb-6">
          <ArrowLeft className="w-5 h-5" />
          Volver al Catálogo
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Tu Carrito</h1>

        {items.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-xl text-muted-foreground mb-4">Tu carrito está vacío</p>
            <Link
              href="/"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition"
            >
              Seguir Comprando
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartItems items={items} onUpdate={updateCart} />
            </div>
            <div>
              <CartSummary items={items} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
