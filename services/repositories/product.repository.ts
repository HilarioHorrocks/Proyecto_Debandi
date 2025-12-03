export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  category: string
  image: string
  thumbnail: string
  rating: number
  stock: number
  brand?: string
  specs?: Record<string, unknown>
}

export interface CreateProductData {
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  image: string
  stock: number
  brand?: string
}

/**
 * Repositorio para gestionar el acceso a datos de productos
 */
export class ProductRepository {
  // Simulación de base de datos en memoria
  // TODO: Reemplazar con una base de datos real
  private static products: Product[] = [
    {
      id: 1,
      name: "Taladro Profesional DeWalt 20V",
      slug: "taladro-dewalt-20v",
      description: "Taladro inalámbrico profesional de alto rendimiento",
      price: 149.99,
      originalPrice: 199.99,
      category: "taladros",
      image: "/professional-drill.jpg",
      thumbnail: "/professional-drill.jpg",
      rating: 4.8,
      stock: 50,
      brand: "DeWalt",
      specs: {
        voltaje: "20V",
        velocidad: "0-500 RPM",
        capacidad: "13mm",
        peso: "1.5kg",
      },
    },
    {
      id: 2,
      name: 'Sierra Circular Makita 7 1/4"',
      slug: "sierra-circular-makita",
      description: "Sierra circular de 7 1/4 pulgadas con potencia máxima",
      price: 89.99,
      originalPrice: 129.99,
      category: "sierras",
      image: "/circular-saw-makita.jpg",
      thumbnail: "/circular-saw.png",
      rating: 4.6,
      stock: 35,
      brand: "Makita",
      specs: {
        potencia: "5800W",
        velocidad: "5800 RPM",
        profundidad: "57mm",
        peso: "2.3kg",
      },
    },
    {
      id: 3,
      name: 'Lijadora Orbital Bosch 5"',
      slug: "lijadora-orbital-bosch",
      description: "Lijadora orbital profesional de precisión",
      price: 79.99,
      originalPrice: 119.99,
      category: "lijadoras",
      image: "/orbital-sander-bosch.jpg",
      thumbnail: "/orbital-sander.png",
      rating: 4.7,
      stock: 42,
      brand: "Bosch",
      specs: {
        potencia: "350W",
        velocidad: "12000 opm",
        tamaño: "5 pulgadas",
        peso: "1.1kg",
      },
    },
    {
      id: 4,
      name: "Juego 40 Destornilladores",
      slug: "juego-destornilladores",
      description: "Set completo de 40 destornilladores profesionales",
      price: 34.99,
      originalPrice: 49.99,
      category: "destornilladores",
      image: "/screwdriver-set-professional.jpg",
      thumbnail: "/screwdriver-set.jpg",
      rating: 4.9,
      stock: 100,
      brand: "Stanley",
      specs: {
        cantidad: "40 piezas",
        tipos: "Phillips, Slotted, Square",
        estuche: "Incluido",
      },
    },
    {
      id: 5,
      name: "Mazo de Goma 32oz",
      slug: "mazo-goma-32oz",
      description: "Mazo profesional de goma de alta calidad",
      price: 15.99,
      originalPrice: 24.99,
      category: "herramientas-manuales",
      image: "/rubber-mallet-hammer.jpg",
      thumbnail: "/rubber-mallet.jpg",
      rating: 4.8,
      stock: 80,
      brand: "Estwing",
      specs: {
        peso: "32oz (907g)",
        material: "Goma de nylon",
        mango: "Acero templado",
      },
    },
    {
      id: 6,
      name: "Casco de Seguridad Amarillo",
      slug: "casco-amarillo",
      description: "Casco profesional ANSI certificado",
      price: 12.99,
      originalPrice: 19.99,
      category: "seguridad",
      image: "/yellow-safety-helmet.jpg",
      thumbnail: "/yellow-safety-helmet.png",
      rating: 4.7,
      stock: 200,
      brand: "3M",
      specs: {
        certificacion: "ANSI Z89.1",
        material: "ABS",
        peso: "400g",
      },
    },
  ]

  /**
   * Genera un slug único a partir del nombre del producto
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  /**
   * Obtiene todos los productos
   */
  async findAll(): Promise<Product[]> {
    return [...ProductRepository.products]
  }

  /**
   * Busca un producto por ID
   */
  async findById(id: number): Promise<Product | null> {
    const product = ProductRepository.products.find((p) => p.id === id)
    return product || null
  }

  /**
   * Busca un producto por slug
   */
  async findBySlug(slug: string): Promise<Product | null> {
    const product = ProductRepository.products.find((p) => p.slug === slug)
    return product || null
  }

  /**
   * Crea un nuevo producto
   */
  async create(data: CreateProductData): Promise<Product> {
    const slug = this.generateSlug(data.name)

    const newProduct: Product = {
      id: Math.max(0, ...ProductRepository.products.map((p) => p.id)) + 1,
      name: data.name.trim(),
      slug,
      description: data.description.trim(),
      price: data.price,
      originalPrice: data.originalPrice,
      category: data.category.trim(),
      image: data.image,
      thumbnail: data.image, // Usar la misma imagen como thumbnail por defecto
      rating: 0, // Nuevo producto sin calificaciones
      stock: data.stock,
      brand: data.brand?.trim(),
      specs: {},
    }

    ProductRepository.products.push(newProduct)
    return newProduct
  }

  /**
   * Actualiza un producto existente
   */
  async update(id: number, data: Partial<CreateProductData>): Promise<Product | null> {
    const index = ProductRepository.products.findIndex((p) => p.id === id)
    if (index === -1) {
      return null
    }

    const currentProduct = ProductRepository.products[index]
    const updatedProduct: Product = {
      ...currentProduct,
      ...data,
      name: data.name ? data.name.trim() : currentProduct.name,
      slug: data.name ? this.generateSlug(data.name) : currentProduct.slug,
      description: data.description ? data.description.trim() : currentProduct.description,
      category: data.category ? data.category.trim() : currentProduct.category,
      brand: data.brand ? data.brand.trim() : currentProduct.brand,
    }

    ProductRepository.products[index] = updatedProduct
    return updatedProduct
  }

  /**
   * Elimina un producto
   */
  async delete(id: number): Promise<boolean> {
    const index = ProductRepository.products.findIndex((p) => p.id === id)
    if (index === -1) {
      return false
    }

    ProductRepository.products.splice(index, 1)
    return true
  }

  /**
   * Filtra productos por categoría
   */
  async findByCategory(category: string): Promise<Product[]> {
    return ProductRepository.products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    )
  }

  /**
   * Busca productos por nombre (búsqueda parcial)
   */
  async search(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase()
    return ProductRepository.products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.brand?.toLowerCase().includes(lowerQuery)
    )
  }
}
