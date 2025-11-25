// Utility para obtener filtros dinámicos basados en los productos

export interface FilterData {
  brands: string[]
  categories: string[]
  maxPrice: number
  minPrice: number
}

export function extractFilterData(products: any[]): FilterData {
  const brands = new Set<string>()
  let maxPrice = 0
  let minPrice = Infinity
  const categories = new Set<string>()

  products.forEach((product) => {
    if (product.brand) {
      brands.add(product.brand)
    }
    if (product.price) {
      maxPrice = Math.max(maxPrice, product.price)
      minPrice = Math.min(minPrice, product.price)
    }
    if (product.category) {
      categories.add(product.category)
    }
  })

  return {
    brands: Array.from(brands).sort(),
    categories: Array.from(categories).sort(),
    maxPrice: Math.ceil(maxPrice / 10) * 10,
    minPrice: Math.floor(minPrice / 10) * 10,
  }
}
