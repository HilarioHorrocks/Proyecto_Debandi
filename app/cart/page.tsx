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
import { Button } from "@/components/ui/button"
import { exportToPDF, exportToExcel } from "@/lib/export-utils"

export default function CartPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      // Convertir items del carrito a formato de producto
      const productsToExport = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: undefined,
        category: "Carrito",
        image: "",
        stock: item.quantity,
        brand: "",
      }))
      await exportToPDF(productsToExport)
    } catch (error) {
      console.error("Error exporting to PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportExcel = () => {
    setIsExporting(true)
    try {
      // Convertir items del carrito a formato de producto
      const productsToExport = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: undefined,
        category: "Carrito",
        image: "",
        stock: item.quantity,
        brand: "",
      }))
      exportToExcel(productsToExport)
    } finally {
      setIsExporting(false)
    }
  }

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
    // Disparar evento para actualizar el navbar
    window.dispatchEvent(new Event("storage"))
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

        {/* Sección de Exportación del Carrito */}
        {items.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Exportar Carrito</h2>
            <p className="text-muted-foreground mb-4">
              Descarga los productos de tu carrito en tu formato preferido
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                variant="outline"
              >
                 Exportar PDF
              </Button>
              <Button
                onClick={handleExportExcel}
                disabled={isExporting}
                variant="outline"
              >
                 Exportar Excel
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
