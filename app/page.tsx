"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductGrid from "@/components/product-grid"
import FilterSidebar from "@/components/filter-sidebar"

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

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
        const params = new URLSearchParams()
        if (selectedCategory !== "all") {
          params.append("category", selectedCategory)
        }
        if (searchQuery) {
          params.append("search", searchQuery)
        }

        const res = await fetch(`/api/products?${params}`)
        const data = await res.json()
        setProducts(data.products)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, searchQuery])

  return (
    <div className="flex flex-col min-h-screen">
      <Header onSearch={setSearchQuery} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                {selectedCategory === "all"
                  ? "Todos los Productos"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h1>
              <p className="text-muted-foreground mt-2">Mostrando {products.length} productos</p>
            </div>

            <ProductGrid products={products} loading={loading} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
