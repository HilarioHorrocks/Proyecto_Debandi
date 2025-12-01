"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductGrid from "@/components/product-grid"
import FilterSidebar from "@/components/filter-sidebar"
import FeaturedCarousel from "@/components/featured-carousel"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const categories = [
    { id: "all", name: "Todos los productos" },
    { id: "taladros", name: "Taladros" },
    { id: "sierras", name: "Sierras" },
    { id: "lijadoras", name: "Lijadoras" },
    { id: "destornilladores", name: "Destornilladores" },
    { id: "herramientas-manuales", name: "Herramientas Manuales" },
    { id: "seguridad", name: "Equipos de Seguridad" },
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products`)
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

  // Aplicar filtros a los productos
  let filteredProducts = [...products]

  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter((p) => p.category === selectedCategory)
  }

  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase()
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower)
    )
  }

  if (filters) {
    if (filters.brands.length > 0) {
      filteredProducts = filteredProducts.filter((p) => filters.brands.includes(p.brand))
    }

    if (filters.categories.length > 0) {
      filteredProducts = filteredProducts.filter((p) => filters.categories.includes(p.category))
    }

    if (filters.priceRange) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      )
    }

    if (filters.onlyStock) {
      filteredProducts = filteredProducts.filter((p) => p.stock > 0)
    }
  }

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery, filters])

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="flex flex-col min-h-screen">
      <Header onSearch={setSearchQuery} />

      <FeaturedCarousel products={products} loading={loading} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onFiltersChange={setFilters}
          />

          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                {selectedCategory === "all"
                  ? "Todos los Productos"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h1>
              <p className="text-muted-foreground mt-2">Mostrando {filteredProducts.length} productos</p>
            </div>

            <ProductGrid products={paginatedProducts} loading={loading} />

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 mb-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1
                    const isActive = pageNum === currentPage
                    const isVisible =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)

                    if (!isVisible) {
                      if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return (
                          <span key={`dots-${pageNum}`} className="px-2 py-2">
                            ...
                          </span>
                        )
                      }
                      return null
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={isActive ? "bg-primary text-primary-foreground" : ""}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
