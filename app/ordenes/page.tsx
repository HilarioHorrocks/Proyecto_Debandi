"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, ChevronDown, ChevronUp, Download, RotateCw, Check, AlertCircle } from "lucide-react"
import { exportToPDF } from "@/lib/export-utils"

interface OrderItem {
  productId: number
  productName: string
  quantity: number
  price: number
  image: string
}

interface Order {
  id: string
  orderNumber: string
  date: string
  total: number
  status: "completada" | "pendiente" | "cancelada"
  items: OrderItem[]
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    } else if (user) {
      loadOrders()
      
      // Escuchar cambios en las órdenes
      const handleOrdersUpdated = () => {
        console.log("Órdenes actualizadas, recargando...")
        loadOrders()
      }
      
      window.addEventListener("orders-updated", handleOrdersUpdated)
      window.addEventListener("storage", handleOrdersUpdated)
      
      return () => {
        window.removeEventListener("orders-updated", handleOrdersUpdated)
        window.removeEventListener("storage", handleOrdersUpdated)
      }
    }
  }, [user, loading, router])

  const loadOrders = () => {
    console.log("=== ORDENES: loadOrders ejecutándose ===")
    try {
      const storedOrders = localStorage.getItem("user-orders")
      console.log("Datos crudos de localStorage ('user-orders'):", storedOrders)
      
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders)
        console.log("Órdenes parseadas:", parsed)
        setOrders(parsed)
        console.log("setOrders ejecutado con:", parsed.length, "órdenes")
      } else {
        console.log("No hay órdenes en localStorage, limpiando estado")
        setOrders([])
      }
    } catch (error) {
      console.error("Error al cargar órdenes:", error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completada":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completada":
        return "Completada"
      case "pendiente":
        return "Pendiente"
      case "cancelada":
        return "Cancelada"
      default:
        return status
    }
  }

  const handleExportOrderToPDF = async (order: Order) => {
    try {
      // Convertir items del pedido a formato de producto para exportar
      const productsToExport = order.items.map((item) => ({
        id: item.productId,
        name: item.productName,
        price: item.price,
        originalPrice: undefined,
        category: "Pedido",
        image: "",
        stock: item.quantity,
        brand: "",
      }))
      await exportToPDF(productsToExport, `Pedido-${order.orderNumber}`)
      
      // Mostrar notificación de éxito
      setNotification({
        type: 'success',
        message: `✓ Pedido ${order.orderNumber} exportado a PDF correctamente`
      })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error("Error exportando pedido a PDF:", error)
      
      // Mostrar notificación de error
      setNotification({
        type: 'error',
        message: "✗ No se pudo exportar el pedido a PDF"
      })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleRepeatOrder = (order: Order) => {
    try {
      // Obtener carrito actual
      const currentCart = localStorage.getItem("cart")
      const cartItems = currentCart ? JSON.parse(currentCart) : []

      // Agregar los items del pedido anterior al carrito
      const updatedCart = [...cartItems]
      let totalUnitsAdded = 0
      
      for (const item of order.items) {
        const existingItem = updatedCart.find((cartItem: any) => cartItem.id === item.productId)
        
        if (existingItem) {
          existingItem.quantity += item.quantity
        } else {
          updatedCart.push({
            id: item.productId,
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            stock: 999, // Asumimos stock disponible
          })
        }
        totalUnitsAdded += item.quantity
      }

      // Guardar carrito actualizado
      localStorage.setItem("cart", JSON.stringify(updatedCart))
      window.dispatchEvent(new Event("storage"))
      
      console.log("Pedido repetido - Items agregados al carrito")
      
      // Mostrar notificación de éxito con el total de unidades
      setNotification({
        type: 'success',
        message: `✓ ${totalUnitsAdded} unidade${totalUnitsAdded !== 1 ? 's' : ''} agregada${totalUnitsAdded !== 1 ? 's' : ''} al carrito. Redirigiendo...`
      })
      
      // Redirigir al carrito después de 1.5 segundos
      setTimeout(() => {
        router.push("/cart")
      }, 1500)
    } catch (error) {
      console.error("Error al repetir el pedido:", error)
      
      // Mostrar notificación de error
      setNotification({
        type: 'error',
        message: "✗ No se pudo agregar los items al carrito"
      })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onSearch={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onSearch={() => {}} />

      {/* Notificación Flotante */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Historial de Pedidos</h1>
          </div>
          <p className="text-muted-foreground">
            {orders.length} pedido{orders.length !== 1 ? "s" : ""} realizado{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Package className="w-16 h-16 mx-auto text-gray-300" />
                <h2 className="text-xl font-semibold text-foreground">No tienes pedidos aún</h2>
                <p className="text-muted-foreground">
                  Comienza a comprar y tus pedidos aparecerán aquí
                </p>
                <Link href="/listado">
                  <Button>Ir al Listado de Productos</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const { date, time } = formatDate(order.date)
              const isExpanded = expandedOrder === order.id

              return (
                <Card key={order.id} className="overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : order.id)
                    }
                    className="w-full"
                  >
                    <CardHeader className="pb-3 hover:bg-muted/50 transition cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">
                              Pedido #{order.orderNumber}
                            </CardTitle>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {date} • {time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            ${order.total.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)} unidade{order.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0) !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="ml-4">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </button>

                  {isExpanded && (
                    <CardContent className="pt-0 border-t">
                      <div className="py-4 space-y-4">
                        <h4 className="font-semibold text-sm text-foreground mb-3">
                          Artículos del pedido
                        </h4>
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                          >
                            <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-foreground line-clamp-2">
                                {item.productName}
                              </h5>
                              <p className="text-sm text-muted-foreground mt-1">
                                Cantidad: {item.quantity}
                              </p>
                              <p className="text-sm font-semibold text-foreground mt-2">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}

                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>
                              $
                              {order.items
                                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                                .toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center font-bold">
                            <span>Total</span>
                            <span className="text-lg text-primary">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <p className="text-xs text-muted-foreground">
                            Pedido realizado el {date} a las {time}
                          </p>
                        </div>

                        <div className="pt-4 border-t flex gap-2">
                          <Button
                            onClick={() => handleExportOrderToPDF(order)}
                            variant="outline"
                            size="sm"
                            className="flex-1 flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Exportar PDF
                          </Button>
                          <Button
                            onClick={() => handleRepeatOrder(order)}
                            variant="outline"
                            size="sm"
                            className="flex-1 flex items-center justify-center gap-2"
                          >
                            <RotateCw className="w-4 h-4" />
                            Repetir Pedido
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
