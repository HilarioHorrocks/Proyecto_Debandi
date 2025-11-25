import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Simulación de base de datos (reemplazar con tu BD real)
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario
    const newUser = {
      id: users.length + 1,
      email,
      passwordHash,
      firstName: firstName || "",
      lastName: lastName || "",
      isAdmin: false,
      createdAt: new Date(),
    }

    users.push(newUser)

    // Retornar usuario sin la contraseña
    const { passwordHash: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      { 
        message: "Usuario registrado exitosamente",
        user: userWithoutPassword 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    )
  }
}
