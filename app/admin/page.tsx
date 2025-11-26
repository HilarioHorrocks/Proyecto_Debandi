"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getSales } from "@/lib/sales"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pencil, Trash2, Plus, Shield } from "lucide-react"

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
}

interface Sale {
  id: string
  productName: string
  quantity: number
  price: number
  total: number
  date: string
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const productsPerPage = 10

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push("/")
    } else if (user?.isAdmin) {
      loadProducts()
      loadSales()
      
      // Actualizar ventas en tiempo real
      const handleSalesUpdate = () => {
        loadSales()
      }
      
      window.addEventListener("sales-updated", handleSalesUpdate)
      return () => window.removeEventListener("sales-updated", handleSalesUpdate)
    }
  }, [user, loading, router])

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data.products)
      setCurrentPage(1) // Resetear a primera página
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  const loadSales = () => {
    try {
      const sales = getSales()
      setSales(sales)
    } catch (error) {
      console.error("Error loading sales:", error)
    }
  }

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const productData = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      originalPrice: parseFloat(formData.get("originalPrice") as string) || undefined,
      category: formData.get("category") as string,
      image: formData.get("image") as string,
      stock: parseInt(formData.get("stock") as string),
      brand: formData.get("brand") as string,
    }

    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products"
      
      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        setMessage(editingProduct ? "Producto actualizado" : "Producto creado")
        setEditingProduct(null)
        setIsCreating(false)
        loadProducts()
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error saving product:", error)
      setMessage("Error al guardar producto")
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessage("Producto eliminado")
        loadProducts()
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calcular paginación con productos filtrados
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  if (!user?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
        </div>

        {message && (
          <Alert className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="stats">Historial de Ventas</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-2xl font-semibold">Gestión de Productos</h2>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>

            {/* Buscador de productos */}
            <div className="w-full">
              <Input
                type="text"
                placeholder="Buscar por nombre, marca o categoría..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Resetear a primera página cuando se busca
                }}
                className="w-full"
              />
            </div>

            {(isCreating || editingProduct) && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingProduct ? "Editar Producto" : "Crear Nuevo Producto"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={editingProduct?.name}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          name="slug"
                          defaultValue={editingProduct?.slug}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Input
                          id="brand"
                          name="brand"
                          defaultValue={editingProduct?.brand}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Input
                          id="category"
                          name="category"
                          defaultValue={editingProduct?.category}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Precio</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={editingProduct?.price}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Precio Original</Label>
                        <Input
                          id="originalPrice"
                          name="originalPrice"
                          type="number"
                          step="0.01"
                          defaultValue={editingProduct?.originalPrice}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          defaultValue={editingProduct?.stock}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image">URL Imagen</Label>
                        <div className="flex gap-2">
                          <Input
                            id="image"
                            name="image"
                            defaultValue={editingProduct?.image}
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("imageFile")?.click()}
                          >
                            Elegir archivo
                          </Button>
                          <input
                            id="imageFile"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = (event) => {
                                  const imageInput = document.getElementById("image") as HTMLInputElement
                                  if (imageInput) {
                                    imageInput.value = event.target?.result as string
                                  }
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingProduct?.description}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Guardar</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingProduct(null)
                          setIsCreating(false)
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {paginatedProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.brand} - ${product.price}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginación */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {paginatedProducts.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-2 px-3">
                  <span className="text-sm font-medium">
                    Página {currentPage} de {totalPages || 1}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Ventas</CardTitle>
                <CardDescription>Registro de todas las transacciones</CardDescription>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay ventas registradas aún
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-4">Fecha</th>
                          <th className="text-left py-3 px-4">Producto</th>
                          <th className="text-right py-3 px-4">Cantidad</th>
                          <th className="text-right py-3 px-4">Precio Unitario</th>
                          <th className="text-right py-3 px-4">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((sale) => (
                          <tr key={sale.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{new Date(sale.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4">{sale.productName}</td>
                            <td className="text-right py-3 px-4">{sale.quantity}</td>
                            <td className="text-right py-3 px-4">${sale.price.toFixed(2)}</td>
                            <td className="text-right py-3 px-4 font-semibold">${sale.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {sales.length > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg flex justify-between">
                    <span className="font-semibold">Total de Ventas:</span>
                    <span className="text-lg font-bold">
                      ${sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
