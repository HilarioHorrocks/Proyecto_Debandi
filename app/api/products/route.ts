import { type NextRequest, NextResponse } from "next/server"

// Datos de productos de ejemplo (después conectarás a BD)
const PRODUCTS = [
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = 12

  let filtered = [...PRODUCTS]

  if (category && category !== "all") {
    filtered = filtered.filter((p) => p.category === category)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower),
    )
  }

  const total = filtered.length
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    products: paginated,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  })
}
