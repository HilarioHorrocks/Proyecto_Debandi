import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

// Base de datos simulada compartida
const users = [
  {
    id: 1,
    email: "admin@debandi.com",
    passwordHash: "", // Se establecerá en la primera ejecución
    firstName: "Admin",
    lastName: "Debandi",
    isAdmin: true,
    createdAt: new Date(),
  },
  {
    id: 2,
    email: "cliente@debandi.com",
    passwordHash: "", // Se establecerá en la primera ejecución
    firstName: "Cliente",
    lastName: "Debandi",
    isAdmin: false,
    createdAt: new Date(),
  }
]

// Inicializar contraseñas de usuarios por defecto
async function initDefaultPasswords() {
  if (!users[0].passwordHash) {
    users[0].passwordHash = await bcrypt.hash("admin123", 10)
  }
  if (!users[1].passwordHash) {
    users[1].passwordHash = await bcrypt.hash("cliente123", 10)
  }
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tu-secreto-super-seguro-cambialo"
)

export async function POST(request: NextRequest) {
  try {
    await initDefaultPasswords()
    
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

    // Crear JWT token
    const token = await new SignJWT({ 
      userId: newUser.id, 
      email: newUser.email,
      isAdmin: newUser.isAdmin 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    // Retornar usuario sin la contraseña
    const { passwordHash: _, ...userWithoutPassword } = newUser

    const response = NextResponse.json(
      { 
        message: "Usuario registrado exitosamente",
        user: userWithoutPassword,
        token
      },
      { status: 201 }
    )

    // Establecer cookie con el token
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    )
  }
}
