"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  category: string
  image: string
  stock: number
  brand: string
}

interface SelectedProduct {
  id: number
  name: string
  price: number
  quantity: number
  brand: string
}

export default function ListadoProductos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<Map<number, SelectedProduct>>(new Map())

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        setProducts(data.products)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectProduct = (product: Product) => {
    const newSelected = new Map(selectedProducts)
    if (newSelected.has(product.id)) {
      newSelected.delete(product.id)
    } else {
      newSelected.set(product.id, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        brand: product.brand,
      })
    }
    setSelectedProducts(newSelected)
  }

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity < 1) return
    const newSelected = new Map(selectedProducts)
    const product = newSelected.get(productId)
    if (product) {
      product.quantity = quantity
      newSelected.set(productId, product)
      setSelectedProducts(newSelected)
    }
  }

  const handleAddToCart = () => {
    // Obtener carrito existente
    const existingCart = localStorage.getItem("cart")
    let cartItems = existingCart ? JSON.parse(existingCart) : []

    // Asegurar que es un array
    if (!Array.isArray(cartItems)) {
      cartItems = []
    }

    // Nuevos items a agregar
    const newItems = Array.from(selectedProducts.values()).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: products.find((p) => p.id === item.id)?.image || "",
      stock: products.find((p) => p.id === item.id)?.stock || 0,
    }))

    // Combinar con carrito existente
    newItems.forEach((newItem) => {
      const existingItem = cartItems.find((item: any) => item.id === newItem.id)
      if (existingItem) {
        // Si el producto ya existe, aumentar cantidad
        existingItem.quantity += newItem.quantity
      } else {
        // Si es nuevo, agregarlo
        cartItems.push(newItem)
      }
    })

    // Guardar en localStorage
    localStorage.setItem("cart", JSON.stringify(cartItems))
    window.dispatchEvent(new Event("storage"))

    // Limpiar selección
    setSelectedProducts(new Map())
    alert("Productos agregados al carrito")
  }

  const totalItems = Array.from(selectedProducts.values()).reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = Array.from(selectedProducts.values()).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header onSearch={setSearchQuery} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Listado De Productos</h1>
          <p className="text-muted-foreground">
            Selecciona los productos que deseas y agrega al carrito
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tabla de productos */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Buscar por nombre, marca o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {loading ? (
              <div className="text-center py-8">Cargando productos...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron productos
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left py-3 px-4">
                        <span className="text-xs">Seleccionar</span>
                      </th>
                      <th className="text-left py-3 px-4">Producto</th>
                      <th className="text-left py-3 px-4">Marca</th>
                      <th className="text-right py-3 px-4">Precio</th>
                      <th className="text-center py-3 px-4">Cantidad</th>
                      <th className="text-right py-3 px-4">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const isSelected = selectedProducts.has(product.id)
                      const selectedItem = selectedProducts.get(product.id)
                      return (
                        <tr key={product.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectProduct(product)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{product.brand}</td>
                          <td className="text-right py-3 px-4 font-semibold">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            {isSelected ? (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      product.id,
                                      (selectedItem?.quantity || 1) - 1
                                    )
                                  }
                                  className="px-2 py-1 border rounded hover:bg-muted"
                                  disabled={!selectedItem || selectedItem.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-medium">
                                  {selectedItem?.quantity || 1}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      product.id,
                                      (selectedItem?.quantity || 1) + 1
                                    )
                                  }
                                  className="px-2 py-1 border rounded hover:bg-muted"
                                  disabled={!selectedItem || selectedItem.quantity >= product.stock}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="text-right py-3 px-4">
                            <span
                              className={
                                product.stock === 0 ? "text-red-500 font-semibold" : "text-green-600"
                              }
                            >
                              {product.stock}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
                <CardDescription>Productos seleccionados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedProducts.size === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay productos seleccionados
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {Array.from(selectedProducts.values()).map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm p-2 bg-muted rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} x ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-semibold ml-2">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Productos:</span>
                        <span className="font-semibold">{totalItems}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-primary">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button onClick={handleAddToCart} className="w-full" size="lg">
                      Agregar al Carrito
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
