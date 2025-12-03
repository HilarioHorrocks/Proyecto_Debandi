import { ProductRepository, CreateProductData } from "./repositories/product.repository"
import type { Product } from "./repositories/product.repository"

/**
 * Servicio de productos - Maneja la lógica de negocio
 */
export class ProductService {
  private productRepository = new ProductRepository()

  /**
   * Obtiene todos los productos
   */
  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.findAll()
  }

  /**
   * Obtiene un producto por ID
   */
  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id)
    
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND")
    }

    return product
  }

  /**
   * Obtiene un producto por slug
   */
  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findBySlug(slug)
    
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND")
    }

    return product
  }

  /**
   * Crea un nuevo producto (solo administradores)
   */
  async createProduct(data: CreateProductData): Promise<Product> {
    // Validar que el precio original sea mayor que el precio actual
    if (data.originalPrice && data.originalPrice < data.price) {
      throw new Error("INVALID_PRICE")
    }

    return await this.productRepository.create(data)
  }

  /**
   * Actualiza un producto existente (solo administradores)
   */
  async updateProduct(id: number, data: Partial<CreateProductData>): Promise<Product> {
    // Validar que el precio original sea mayor que el precio actual
    if (data.price && data.originalPrice && data.originalPrice < data.price) {
      throw new Error("INVALID_PRICE")
    }

    const updatedProduct = await this.productRepository.update(id, data)
    
    if (!updatedProduct) {
      throw new Error("PRODUCT_NOT_FOUND")
    }

    return updatedProduct
  }

  /**
   * Elimina un producto (solo administradores)
   */
  async deleteProduct(id: number): Promise<void> {
    const deleted = await this.productRepository.delete(id)
    
    if (!deleted) {
      throw new Error("PRODUCT_NOT_FOUND")
    }
  }

  /**
   * Busca productos por categoría
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    return await this.productRepository.findByCategory(category)
  }

  /**
   * Busca productos por texto
   */
  async searchProducts(query: string): Promise<Product[]> {
    if (!query || query.trim().length < 2) {
      throw new Error("INVALID_SEARCH_QUERY")
    }

    return await this.productRepository.search(query.trim())
  }
}
