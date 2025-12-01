import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tu-secreto-super-seguro-cambialo"
)

// Base de datos local para admin (sincronizada)
let PRODUCTS = [
  { id: 1, name: "Taladro Profesional DeWalt 20V", slug: "taladro-dewalt-20v", description: "Taladro inalámbrico profesional", price: 149.99, originalPrice: 199.99, category: "taladros", image: "/professional-drill.jpg", stock: 50, brand: "DeWalt" },
  { id: 2, name: 'Sierra Circular Makita 7 1/4"', slug: "sierra-circular-makita", description: "Sierra circular de 7 1/4 pulgadas", price: 89.99, originalPrice: 129.99, category: "sierras", image: "/circular-saw-makita.jpg", stock: 35, brand: "Makita" },
  { id: 3, name: 'Lijadora Orbital Bosch 5"', slug: "lijadora-orbital-bosch", description: "Lijadora orbital profesional", price: 79.99, originalPrice: 119.99, category: "lijadoras", image: "/orbital-sander-bosch.jpg", stock: 42, brand: "Bosch" },
  { id: 4, name: "Juego 40 Destornilladores", slug: "juego-destornilladores", description: "Set de 40 destornilladores", price: 34.99, originalPrice: 49.99, category: "destornilladores", image: "/screwdriver-set-professional.jpg", stock: 100, brand: "Stanley" },
  { id: 5, name: "Mazo de Goma 32oz", slug: "mazo-goma-32oz", description: "Mazo profesional de goma", price: 15.99, originalPrice: 24.99, category: "herramientas-manuales", image: "/rubber-mallet-hammer.jpg", stock: 80, brand: "Estwing" },
  { id: 6, name: "Casco de Seguridad Amarillo", slug: "casco-amarillo", description: "Casco profesional ANSI", price: 12.99, originalPrice: 19.99, category: "seguridad", image: "/yellow-safety-helmet.jpg", stock: 200, brand: "3M" },
  { id: 7, name: "Martillo Perforador SDS Bosch", slug: "martillo-perforador-bosch", description: "Martillo con sistema SDS", price: 189.99, originalPrice: 269.99, category: "Herramientas varias", image: "/logo-debandi.svg", stock: 28, brand: "Bosch" },
  { id: 8, name: "Sierra Alternante DeWalt", slug: "sierra-alternante-dewalt", description: "Sierra alternante potente", price: 125.99, originalPrice: 179.99, category: "Herramientas varias", image: "/logo-debandi.svg", stock: 32, brand: "DeWalt" },
  { id: 9, name: "Motosierra Makita 45cc", slug: "motosierra-makita", description: "Motosierra de gasolina", price: 329.99, originalPrice: 449.99, category: "Riego y jardin", image: "/logo-debandi.svg", stock: 15, brand: "Makita" },
  { id: 10, name: "Compresor de Aire Stanley 50L", slug: "compresor-stanley", description: "Compresor profesional", price: 159.99, originalPrice: 229.99, category: "Herramientas varias", image: "/logo-debandi.svg", stock: 20, brand: "Stanley" },
  { id: 11, name: "Juego de Brocas Profesional 101pz", slug: "juego-brocas-profesional", description: "Set de 101 brocas", price: 29.99, originalPrice: 44.99, category: "Tornilleria", image: "/logo-debandi.svg", stock: 120, brand: "Bosch" },
  { id: 12, name: "Guantes de Trabajo Nitrilo", slug: "guantes-nitrilo", description: "Guantes de protección", price: 8.99, originalPrice: 12.99, category: "Seguridad", image: "/logo-debandi.svg", stock: 500, brand: "Ansell" },
  { id: 13, name: "Lentes de Seguridad Anti-reflejo", slug: "lentes-seguridad", description: "Lentes protectores", price: 18.99, originalPrice: 27.99, category: "Seguridad", image: "/logo-debandi.svg", stock: 150, brand: "Uvex" },
  { id: 14, name: "Nivel Láser Digital Bosch 30m", slug: "nivel-laser-bosch", description: "Nivel láser digital", price: 89.99, originalPrice: 129.99, category: "Ferreteria", image: "/logo-debandi.svg", stock: 45, brand: "Bosch" },
  { id: 15, name: "Linterna LED Profesional 1000 lum", slug: "linterna-led-profesional", description: "Linterna LED alta potencia", price: 34.99, originalPrice: 49.99, category: "Electricidad", image: "/logo-debandi.svg", stock: 80, brand: "Streamlight" },
  { id: 16, name: "Escalera Telescópica Aluminio 4.7m", slug: "escalera-telescopica", description: "Escalera telescópica", price: 109.99, originalPrice: 159.99, category: "Ferreteria", image: "/logo-debandi.svg", stock: 25, brand: "Werner" },
  { id: 17, name: "Llave Inglesa Ajustable", slug: "llave-inglesa-ajustable", description: "Llave inglesa 300mm", price: 14.99, originalPrice: 21.99, category: "Herramientas varias", image: "/logo-debandi.svg", stock: 200, brand: "Stanley" },
  { id: 18, name: "Pistola Caladora Inalámbrica", slug: "pistola-caladora-inalambrica", description: "Caladora inalámbrica 20V", price: 99.99, originalPrice: 149.99, category: "Herramientas varias", image: "/logo-debandi.svg", stock: 38, brand: "DeWalt" },
  { id: 19, name: "Cinta Métrica de Fibra 10m", slug: "cinta-metrica-fibra", description: "Cinta métrica 10 metros", price: 11.99, originalPrice: 17.99, category: "Ferreteria", image: "/logo-debandi.svg", stock: 250, brand: "Stanley" },
  { id: 20, name: "Soldador MMA 160A Portátil", slug: "soldador-mma-160a", description: "Soldador tipo inverter", price: 249.99, originalPrice: 349.99, category: "Herramientas varias", image: "/logo-debandi.svg", stock: 12, brand: "Esab" },
  { id: 21, name: "Bomba de Agua Sumergible 750W", slug: "bomba-agua-sumergible", description: "Bomba sumergible", price: 79.99, originalPrice: 119.99, category: "Agua", image: "/logo-debandi.svg", stock: 35, brand: "Makita" },
  { id: 22, name: "Cilindro de Gas Propano 10kg", slug: "cilindro-gas-propano-10kg", description: "Cilindro gas propano", price: 24.99, originalPrice: 34.99, category: "Gas", image: "/logo-debandi.svg", stock: 60, brand: "Ultragás" },
  { id: 23, name: "Adhesivo Epoxi Profesional 500ml", slug: "adhesivo-epoxi-profesional", description: "Adhesivo epoxi", price: 18.99, originalPrice: 27.99, category: "Quimicos y adhesivos", image: "/logo-debandi.svg", stock: 150, brand: "Loctite" },
  { id: 24, name: "Bombilla LED 9W E27 Cálida", slug: "bombilla-led-9w-e27", description: "Bombilla LED cálida", price: 9.99, originalPrice: 14.99, category: "Hogar", image: "/logo-debandi.svg", stock: 300, brand: "Philips" },
  { id: 25, name: "Tornillos Cabeza Plana Caja 500pz", slug: "tornillos-cabeza-plana-500", description: "Caja de tornillos", price: 12.99, originalPrice: 18.99, category: "Tornilleria", image: "/logo-debandi.svg", stock: 50, brand: "Stanley" },
  { id: 26, name: "Producto Sin Categoría", slug: "producto-sin-categoria", description: "Producto pendiente", price: 5.99, originalPrice: 9.99, category: "Sin definir", image: "/logo-debandi.svg", stock: 25, brand: "Genérico" },
  { id: 27, name: "Taladro Percutor Profesional", slug: "taladro-percutor-agotado", description: "Taladro percutor de alta potencia (producto sin stock)", price: 199.99, originalPrice: 279.99, category: "taladros", image: "/logo-debandi.svg", stock: 0, brand: "Bosch" },
]

async function verifyAdmin(request: NextRequest) {
  try {
    // Intentar leer el token de dos lugares: cookie o header Authorization
    let token = request.cookies.get("auth-token")?.value
    
    if (!token) {
      // Intentar desde el header Authorization
      const authHeader = request.headers.get("Authorization")
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }
    
    console.log("Token from cookie:", request.cookies.get("auth-token")?.value ? "✓" : "✗")
    console.log("Token from header:", request.headers.get("Authorization") ? "✓" : "✗")
    console.log("Final token:", token ? "✓ present" : "✗ missing")
    
    if (!token) return { isAdmin: false, error: "No autenticado" }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    console.log("Token payload:", payload)
    
    const isAdmin = (payload as any).isAdmin === true
    console.log("Is Admin:", isAdmin)
    
    if (!isAdmin) return { isAdmin: false, error: "No autorizado" }

    return { isAdmin: true }
  } catch (error) {
    console.error("Token verification error:", error)
    return { isAdmin: false, error: "Token inválido" }
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin(request)
  if (!auth.isAdmin) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const { id: idString } = await params
    const id = parseInt(idString)
    console.log("PUT /api/admin/products/[id] - ID:", id)
    
    const body = await request.json()
    const index = PRODUCTS.findIndex(p => p.id === id)
    
    if (index === -1) {
      console.log("Producto no encontrado:", id)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    PRODUCTS[index] = { ...PRODUCTS[index], ...body }
    console.log("Producto actualizado:", PRODUCTS[index])
    return NextResponse.json({ product: PRODUCTS[index] })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin(request)
  if (!auth.isAdmin) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const { id: idString } = await params
    const id = parseInt(idString)
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
