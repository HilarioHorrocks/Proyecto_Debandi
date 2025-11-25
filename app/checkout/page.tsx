"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  stock: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [showConfirmation, setShowConfirmation] = useState(true)
  const [orderNumber, setOrderNumber] = useState("")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [total, setTotal] = useState(0)
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null)

  useEffect(() => {
    // Redirigir si no está logueado
    if (!user) {
      router.push("/")
      return
    }

    // Crear fecha fija al montar el componente
    const now = new Date()
    setPurchaseDate(now)

    // Obtener carrito antes de limpiar
    const cart = localStorage.getItem("cart")
    if (cart) {
      const items = JSON.parse(cart)
      if (Array.isArray(items)) {
        setCartItems(items)
        const totalAmount = items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0)
        setTotal(totalAmount)
      }
    }
    
    // Generar número de orden
    setOrderNumber(`ORD-${Date.now()}`)
  }, [user, router])

  const handleContinue = () => {
    // Limpiar carrito
    localStorage.removeItem("cart")
    window.dispatchEvent(new Event("storage"))
    // Redirigir a inicio
    router.push("/")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onSearch={() => {}} />

      <main className="flex-1 flex items-center justify-center max-w-7xl mx-auto w-full px-4 py-8">
        {showConfirmation && (
          <div className="w-full max-w-md">
            {/* Animación de éxito */}
            <div className="text-center space-y-6">
              {/* Icono con animación */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary opacity-20 rounded-full animate-ping" />
                  <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 rounded-full">
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>

              {/* Texto de confirmación */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground">¡Pedido Realizado!</h1>
                <p className="text-lg text-muted-foreground">
                  Tu pedido ha sido procesado con éxito
                </p>
              </div>

              {/* Número de orden */}
              <div className="bg-card border-2 border-primary/30 rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-2">Número de Orden</p>
                <p className="text-2xl font-bold text-primary font-mono">{orderNumber}</p>
              </div>

              {/* Detalles */}
              <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-semibold text-green-600">Confirmado</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-semibold">{purchaseDate?.toLocaleDateString("es-ES")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="font-semibold">{purchaseDate?.toLocaleTimeString("es-ES")}</span>
                </div>

                {/* Sección de Productos */}
                <div className="border-t border-border pt-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex justify-between items-center hover:opacity-80 transition"
                  >
                    <span className="text-muted-foreground">Detalle de Productos:</span>
                    {showDetails ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  {showDetails && (
                    <div className="mt-4 space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-card p-3 rounded border border-border">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} x ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-semibold text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      <div className="border-t border-border pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">Total:</span>
                          <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mensaje adicional */}
              <p className="text-sm text-muted-foreground">
                Recibirás un email de confirmación pronto con los detalles de tu pedido.
              </p>

              {/* Botón para continuar */}
              <Button
                onClick={handleContinue}
                className="w-full py-6 text-lg"
                size="lg"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
