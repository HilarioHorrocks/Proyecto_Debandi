import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tu-secreto-super-seguro-cambialo"
)

// Base de datos simulada (debe coincidir con login)
const users = [
  {
    id: 1,
    email: "admin@debandi.com",
    firstName: "Admin",
    lastName: "Debandi",
    isAdmin: true,
  }
]

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Verificar token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Buscar usuario
    const user = users.find((u) => u.id === payload.userId)
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error al verificar token:", error)
    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    )
  }
}
