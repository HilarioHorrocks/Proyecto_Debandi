import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/services/auth.service"
import { validateData, loginSchema } from "@/lib/validators/schemas"
import { loginRateLimiter, getClientIdentifier } from "@/lib/security/rate-limiter"

const authService = new AuthService()

export async function POST(request: NextRequest) {
  // Verificar rate limit
  const clientId = getClientIdentifier(request)
  
  if (loginRateLimiter.isRateLimited(clientId)) {
    const status = loginRateLimiter.getStatus(clientId)
    const resetTime = status.resetTime ? new Date(status.resetTime).toISOString() : "unknown"
    
    return NextResponse.json(
      { 
        error: "Demasiados intentos de inicio de sesión. Por favor, inténtelo más tarde.",
        resetTime 
      },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()

    // Validar datos de entrada
    const validatedData = validateData(loginSchema, body)

    // Autenticar usuario
    const { user, token } = await authService.login(validatedData)

    // Login exitoso - resetear el rate limit para esta IP
    loginRateLimiter.reset(clientId)

    const response = NextResponse.json({
      message: "Login exitoso",
      user,
      token,
    })

    // Establecer cookie segura con el token
    response.cookies.set("auth-token", token, {
      httpOnly: true, // No accesible desde JavaScript
      secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
      sameSite: "lax", // Protección contra CSRF
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/", // Disponible en toda la aplicación
    })

    return response
  } catch (error) {
    // Registrar intento fallido
    loginRateLimiter.recordAttempt(clientId)

    // Manejo de errores específicos
    if (error instanceof Error) {
      switch (error.message) {
        case "INVALID_CREDENTIALS":
          return NextResponse.json(
            { error: "Credenciales inválidas" },
            { status: 401 }
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

    console.error("Error en login:", error)
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    )
  }
}
