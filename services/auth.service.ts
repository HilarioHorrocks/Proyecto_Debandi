import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { UserRepository } from "./repositories/user.repository"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tu-secreto-super-seguro-cambialo"
)

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface JWTPayload {
  userId: number
  email: string
  isAdmin: boolean
  [key: string]: unknown // Index signature para compatibilidad con jose
}

export class AuthService {
  private userRepository = new UserRepository()

  /**
   * Autentica un usuario con email y contraseña
   */
  async login(credentials: LoginCredentials) {
    const { email, password } = credentials

    // Buscar usuario
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new Error("INVALID_CREDENTIALS")
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      throw new Error("INVALID_CREDENTIALS")
    }

    // Generar token
    const token = await this.generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    })

    // Retornar usuario sin contraseña
    const { passwordHash: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
    }
  }

  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterData) {
    const { email, password, firstName, lastName } = data

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS")
    }

    // Validar fortaleza de contraseña
    this.validatePasswordStrength(password)

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12) // 12 rounds para mayor seguridad

    // Crear usuario
    const newUser = await this.userRepository.create({
      email: email.toLowerCase().trim(), // Normalizar email
      passwordHash,
      firstName: firstName?.trim() || "",
      lastName: lastName?.trim() || "",
      isAdmin: false,
    })

    // Generar token
    const token = await this.generateToken({
      userId: newUser.id,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    })

    // Retornar usuario sin contraseña
    const { passwordHash: _, ...userWithoutPassword } = newUser

    return {
      user: userWithoutPassword,
      token,
    }
  }

  /**
   * Verifica y decodifica un JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return payload as unknown as JWTPayload
    } catch (error) {
      throw new Error("INVALID_TOKEN")
    }
  }

  /**
   * Genera un JWT token
   */
  private async generateToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .setIssuer("debandi-store") // Identificador de la aplicación
      .sign(JWT_SECRET)
  }

  /**
   * Valida la fortaleza de la contraseña
   */
  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error("PASSWORD_TOO_SHORT")
    }

    // Al menos una mayúscula, una minúscula y un número
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      throw new Error("PASSWORD_TOO_WEAK")
    }
  }

  /**
   * Obtiene la información del usuario actual desde el token
   */
  async getCurrentUser(token: string) {
    const payload = await this.verifyToken(token)
    const user = await this.userRepository.findById(payload.userId)
    
    if (!user) {
      throw new Error("USER_NOT_FOUND")
    }

    const { passwordHash: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}
