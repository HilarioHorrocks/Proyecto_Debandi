"use client"

interface FilterSidebarProps {
  categories: { id: string; name: string }[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function FilterSidebar({ categories, selectedCategory, onCategoryChange }: FilterSidebarProps) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
        <h2 className="text-xl font-bold text-foreground mb-6">Filtros</h2>

        <div>
          <h3 className="font-semibold text-foreground mb-4">Categorías</h3>
          <div className="space-y-3">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={selectedCategory === category.id}
                  onChange={() => onCategoryChange(category.id)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-foreground group-hover:text-primary transition">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="font-semibold text-foreground mb-4">Rango de Precio</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-foreground text-sm">$0 - $50</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-foreground text-sm">$50 - $150</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-foreground text-sm">$150+</span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  )
}
