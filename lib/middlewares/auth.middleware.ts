import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/services/auth.service"

/**
 * Middleware para verificar autenticación
 * Extrae el token de cookies o header Authorization
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: number) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = extractToken(request)
    
    if (!token) {
      return NextResponse.json(
        { error: "No autenticado. Token no proporcionado." },
        { status: 401 }
      )
    }

    const authService = new AuthService()
    const payload = await authService.verifyToken(token)

    // Adjuntar información del usuario al request (para usar en el handler)
    // @ts-ignore - Agregamos propiedades customizadas
    request.userId = payload.userId
    // @ts-ignore
    request.userEmail = payload.email
    // @ts-ignore
    request.isAdmin = payload.isAdmin

    return await handler(request, payload.userId)
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_TOKEN") {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      )
    }

    console.error("Error en middleware de autenticación:", error)
    return NextResponse.json(
      { error: "Error de autenticación" },
      { status: 500 }
    )
  }
}

/**
 * Middleware para verificar que el usuario sea administrador
 */
export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: number) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = extractToken(request)
    
    if (!token) {
      return NextResponse.json(
        { error: "No autenticado. Token no proporcionado." },
        { status: 401 }
      )
    }

    const authService = new AuthService()
    const payload = await authService.verifyToken(token)

    // Verificar permisos de administrador
    if (!payload.isAdmin) {
      return NextResponse.json(
        { error: "No autorizado. Se requieren permisos de administrador." },
        { status: 403 }
      )
    }

    // Adjuntar información del usuario al request
    // @ts-ignore
    request.userId = payload.userId
    // @ts-ignore
    request.userEmail = payload.email
    // @ts-ignore
    request.isAdmin = payload.isAdmin

    return await handler(request, payload.userId)
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_TOKEN") {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      )
    }

    console.error("Error en middleware de autenticación admin:", error)
    return NextResponse.json(
      { error: "Error de autenticación" },
      { status: 500 }
    )
  }
}

/**
 * Extrae el token JWT del request
 * Busca primero en cookies httpOnly, luego en header Authorization
 */
function extractToken(request: NextRequest): string | null {
  // Intentar obtener de cookie (más seguro)
  let token = request.cookies.get("auth-token")?.value

  // Si no está en cookie, intentar con header Authorization
  if (!token) {
    const authHeader = request.headers.get("Authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }
  }

  return token || null
}

/**
 * Obtiene la información del usuario actual desde el request
 * Solo debe usarse después de pasar por withAuth o withAdminAuth
 */
export function getCurrentUserFromRequest(request: NextRequest) {
  return {
    // @ts-ignore
    userId: request.userId as number,
    // @ts-ignore
    email: request.userEmail as string,
    // @ts-ignore
    isAdmin: request.isAdmin as boolean,
  }
}
