import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/services/auth.service"
import { validateData, registerSchema } from "@/lib/validators/schemas"
import { registerRateLimiter, getClientIdentifier } from "@/lib/security/rate-limiter"
import { isCommonPassword } from "@/lib/security/utils"

const authService = new AuthService()

export async function POST(request: NextRequest) {
  // Verificar rate limit
  const clientId = getClientIdentifier(request)
  
  if (registerRateLimiter.isRateLimited(clientId)) {
    const status = registerRateLimiter.getStatus(clientId)
    const resetTime = status.resetTime ? new Date(status.resetTime).toISOString() : "unknown"
    
    return NextResponse.json(
      { 
        error: "Demasiados intentos de registro. Por favor, inténtelo más tarde.",
        resetTime 
      },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()

    // Validar datos de entrada
    const validatedData = validateData(registerSchema, body)

    // Verificar si la contraseña es demasiado común
    if (isCommonPassword(validatedData.password)) {
      registerRateLimiter.recordAttempt(clientId)
      return NextResponse.json(
        { error: "La contraseña es demasiado común. Por favor, elija una más segura." },
        { status: 400 }
      )
    }

    // Registrar usuario
    const { user, token } = await authService.register(validatedData)

    // Registro exitoso - resetear el rate limit para esta IP
    registerRateLimiter.reset(clientId)

    const response = NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        user,
        token,
      },
      { status: 201 }
    )

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
    registerRateLimiter.recordAttempt(clientId)

    // Manejo de errores específicos
    if (error instanceof Error) {
      switch (error.message) {
        case "EMAIL_ALREADY_EXISTS":
          return NextResponse.json(
            { error: "El email ya está registrado" },
            { status: 400 }
          )
        case "PASSWORD_TOO_SHORT":
          return NextResponse.json(
            { error: "La contraseña debe tener al menos 8 caracteres" },
            { status: 400 }
          )
        case "PASSWORD_TOO_WEAK":
          return NextResponse.json(
            { 
              error: "La contraseña debe contener al menos una mayúscula, una minúscula y un número" 
            },
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

    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    )
  }
}
