import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middlewares/auth.middleware"
import { AuthService } from "@/services/auth.service"

const authService = new AuthService()

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      // Extraer el token
      const token = req.cookies.get("auth-token")?.value || 
                    req.headers.get("Authorization")?.substring(7)

      if (!token) {
        return NextResponse.json(
          { error: "Token no encontrado" },
          { status: 401 }
        )
      }

      // Obtener información del usuario actual
      const user = await authService.getCurrentUser(token)

      return NextResponse.json({ user })
    } catch (error) {
      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        )
      }

      console.error("Error al obtener usuario:", error)
      return NextResponse.json(
        { error: "Error al obtener información del usuario" },
        { status: 500 }
      )
    }
  })
}
