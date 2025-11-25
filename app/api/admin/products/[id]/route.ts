import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tu-secreto-super-seguro-cambialo"
)

// Base de datos simulada - debe estar sincronizada
let PRODUCTS = [
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
  },
]

async function verifyAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return { isAdmin: false, error: "No autenticado" }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (!payload.isAdmin) return { isAdmin: false, error: "No autorizado" }

    return { isAdmin: true }
  } catch (error) {
    return { isAdmin: false, error: "Token inválido" }
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin(request)
  if (!auth.isAdmin) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const index = PRODUCTS.findIndex(p => p.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    PRODUCTS[index] = { ...PRODUCTS[index], ...body }
    return NextResponse.json({ product: PRODUCTS[index] })
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin(request)
  if (!auth.isAdmin) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const id = parseInt(params.id)
    const index = PRODUCTS.findIndex(p => p.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    PRODUCTS.splice(index, 1)
    return NextResponse.json({ message: "Producto eliminado" })
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
