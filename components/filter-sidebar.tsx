"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Slider } from "./ui/slider"
import { Label } from "./ui/label"
import { extractFilterData } from "@/lib/filters"

interface FilterSidebarProps {
  products: any[]
  categories: { id: string; name: string }[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onFiltersChange?: (filters: {
    brands: string[]
    categories: string[]
    priceRange: number[]
    onlyStock: boolean
  }) => void
}

export default function FilterSidebar({
  products,
  categories,
  selectedCategory,
  onCategoryChange,
  onFiltersChange,
}: FilterSidebarProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedRubros, setSelectedRubros] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [onlyStock, setOnlyStock] = useState(false)
  const [filterData, setFilterData] = useState<any>(null)

  useEffect(() => {
    if (products && products.length > 0) {
      const data = extractFilterData(products)
      setFilterData(data)
      setPriceRange([data.minPrice, data.maxPrice])
    }
  }, [products])

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) => {
      const updated = prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
      return updated
    })
  }

  const handleRubroToggle = (rubro: string) => {
    setSelectedRubros((prev) => {
      const updated = prev.includes(rubro) ? prev.filter((r) => r !== rubro) : [...prev, rubro]
      return updated
    })
  }

  const handlePriceChange = (newRange: number[]) => {
    setPriceRange(newRange)
  }

  const handleStockChange = (checked: boolean) => {
    setOnlyStock(checked)
  }

  // Efecto para notificar cambios de filtros
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        brands: selectedBrands,
        categories: selectedRubros,
        priceRange,
        onlyStock,
      })
    }
  }, [selectedBrands, selectedRubros, priceRange, onlyStock, onFiltersChange])

  const handleClearFilters = () => {
    onCategoryChange("all")
    setSelectedBrands([])
    setSelectedRubros([])
    if (filterData) {
      setPriceRange([filterData.minPrice, filterData.maxPrice])
    }
    setOnlyStock(false)
  }

  if (!filterData) {
    return <div>Cargando filtros...</div>
  }

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="space-y-4">
        {/* Botón Limpiar Filtros */}
        <Button variant="outline" className="w-full" onClick={handleClearFilters}>
          Limpiar Filtros
        </Button>

        {/* Sección Rubros (Categorías) */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 text-lg">Rubros</h3>
          <div className="space-y-3">
            {filterData.categories.map((category: string) => {
              const categoryLabel = categories.find((c) => c.id === category)?.name || category
              return (
                <label key={category} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    checked={selectedRubros.includes(category)}
                    onCheckedChange={() => handleRubroToggle(category)}
                  />
                  <span className="text-foreground group-hover:text-primary transition text-sm">
                    {categoryLabel}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Sección Marcas */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 text-lg">Marcas</h3>
          <div className="space-y-3">
            {filterData.brands.map((brand: string) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <span className="text-foreground group-hover:text-primary transition text-sm">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sección Rango de Precio */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 text-lg">Rango de Precio</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Mínimo: ${priceRange[0]}
              </Label>
              <Slider
                value={[priceRange[0]]}
                onValueChange={(value) => handlePriceChange([value[0], priceRange[1]])}
                min={filterData.minPrice}
                max={filterData.maxPrice}
                step={5}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Máximo: ${priceRange[1]}
              </Label>
              <Slider
                value={[priceRange[1]]}
                onValueChange={(value) => handlePriceChange([priceRange[0], value[0]])}
                min={filterData.minPrice}
                max={filterData.maxPrice}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Sección Solo con Stock */}
        <div className="bg-card border border-border rounded-lg p-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox checked={onlyStock} onCheckedChange={handleStockChange} />
            <span className="text-foreground group-hover:text-primary transition text-sm">
              Solo con stock
            </span>
          </label>
        </div>
      </div>
    </aside>
  )
}
