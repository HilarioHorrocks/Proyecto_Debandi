import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/middlewares/auth.middleware"
import { ProductService } from "@/services/product.service"
import { validateData, updateProductSchema } from "@/lib/validators/schemas"

const productService = new ProductService()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id: idString } = await params
      const id = parseInt(idString)
      
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "ID de producto inválido" },
          { status: 400 }
        )
      }

      const body = await request.json()

      // Validar datos de entrada
      const validatedData = validateData(updateProductSchema, body)

      // Actualizar producto
      const product = await productService.updateProduct(id, validatedData)

      return NextResponse.json({ product })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "PRODUCT_NOT_FOUND") {
          return NextResponse.json(
            { error: "Producto no encontrado" },
            { status: 404 }
          )
        }
        if (error.message === "INVALID_PRICE") {
          return NextResponse.json(
            { error: "El precio original debe ser mayor que el precio actual" },
            { status: 400 }
          )
        }
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

      console.error("Error al actualizar producto:", error)
      return NextResponse.json(
        { error: "Error al actualizar producto" },
        { status: 500 }
      )
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id: idString } = await params
      const id = parseInt(idString)
      
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "ID de producto inválido" },
          { status: 400 }
        )
      }

      await productService.deleteProduct(id)

      return NextResponse.json({ message: "Producto eliminado exitosamente" })
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return NextResponse.json(
          { error: "Producto no encontrado" },
          { status: 404 }
        )
      }

      console.error("Error al eliminar producto:", error)
      return NextResponse.json(
        { error: "Error al eliminar producto" },
        { status: 500 }
      )
    }
  })
}
