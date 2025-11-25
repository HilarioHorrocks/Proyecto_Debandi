import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

// Simulación de base de datos - incluye usuarios por defecto
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
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    // Buscar usuario
    const user = users.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      )
    }

    // Crear JWT token
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email,
      isAdmin: user.isAdmin 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    // Usuario sin contraseña
    const { passwordHash: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      message: "Login exitoso",
      user: userWithoutPassword,
      token,
    })

    // Establecer cookie con el token
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    return response
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    )
  }
}
