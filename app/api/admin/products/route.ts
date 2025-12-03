import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/middlewares/auth.middleware"
import { ProductService } from "@/services/product.service"
import { validateData, productSchema } from "@/lib/validators/schemas"

const productService = new ProductService()

export async function POST(request: NextRequest) {
  return withAdminAuth(request, async (req) => {
    try {
      const body = await request.json()

      // Validar datos de entrada
      const validatedData = validateData(productSchema, body)

      // Crear producto
      const product = await productService.createProduct(validatedData)

      return NextResponse.json({ product }, { status: 201 })
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_PRICE") {
        return NextResponse.json(
          { error: "El precio original debe ser mayor que el precio actual" },
          { status: 400 }
        )
      }

      // Error de validación
      if (typeof error === "object" && error !== null && "type" in error) {
        const validationError = error as { type: string; errors: unknown; message: string }
        if (validationError.type === "VALIDATION_ERROR") {
          return NextResponse.json(
            { 
              error: validationError.message,
              details: validationError.errors 
            },
            { status: 400 }
          )
        }
      }

      console.error("Error al crear producto:", error)
      return NextResponse.json(
        { error: "Error al crear producto" },
        { status: 500 }
      )
    }
  })
}

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const products = await productService.getAllProducts()
      return NextResponse.json({ products })
    } catch (error) {
      console.error("Error al obtener productos:", error)
      return NextResponse.json(
        { error: "Error al obtener productos" },
        { status: 500 }
      )
    }
  })
}
