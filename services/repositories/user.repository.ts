import bcrypt from "bcryptjs"

export interface User {
  id: number
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  isAdmin: boolean
  createdAt: Date
}

export interface CreateUserData {
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  isAdmin: boolean
}

/**
 * Repositorio para gestionar el acceso a datos de usuarios
 * En producción, esto se conectaría a una base de datos real
 */
export class UserRepository {
  // Simulación de base de datos en memoria
  // TODO: Reemplazar con una base de datos real (PostgreSQL, MongoDB, etc.)
  private static users: User[] = []
  private static initialized = false

  constructor() {
    // Inicializar usuarios por defecto
    if (!UserRepository.initialized) {
      this.initializeDefaultUsers()
      UserRepository.initialized = true
    }
  }

  /**
   * Inicializa usuarios por defecto para testing/desarrollo
   */
  private async initializeDefaultUsers() {
    const adminHash = await bcrypt.hash("admin123", 12)
    const clienteHash = await bcrypt.hash("cliente123", 12)

    UserRepository.users = [
      {
        id: 1,
        email: "admin@debandi.com",
        passwordHash: adminHash,
        firstName: "Admin",
        lastName: "Debandi",
        isAdmin: true,
        createdAt: new Date(),
      },
      {
        id: 2,
        email: "cliente@debandi.com",
        passwordHash: clienteHash,
        firstName: "Cliente",
        lastName: "Debandi",
        isAdmin: false,
        createdAt: new Date(),
      },
    ]
  }

  /**
   * Busca un usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim()
    const user = UserRepository.users.find((u) => u.email === normalizedEmail)
    return user || null
  }

  /**
   * Busca un usuario por ID
   */
  async findById(id: number): Promise<User | null> {
    const user = UserRepository.users.find((u) => u.id === id)
    return user || null
  }

  /**
   * Crea un nuevo usuario
   */
  async create(data: CreateUserData): Promise<User> {
    const newUser: User = {
      id: Math.max(0, ...UserRepository.users.map((u) => u.id)) + 1,
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      isAdmin: data.isAdmin,
      createdAt: new Date(),
    }

    UserRepository.users.push(newUser)
    return newUser
  }

  /**
   * Actualiza un usuario existente
   */
  async update(id: number, data: Partial<CreateUserData>): Promise<User | null> {
    const index = UserRepository.users.findIndex((u) => u.id === id)
    if (index === -1) {
      return null
    }

    UserRepository.users[index] = {
      ...UserRepository.users[index],
      ...data,
    }

    return UserRepository.users[index]
  }

  /**
   * Elimina un usuario
   */
  async delete(id: number): Promise<boolean> {
    const index = UserRepository.users.findIndex((u) => u.id === id)
    if (index === -1) {
      return false
    }

    UserRepository.users.splice(index, 1)
    return true
  }

  /**
   * Obtiene todos los usuarios (sin contraseñas)
   */
  async findAll(): Promise<Omit<User, "passwordHash">[]> {
    return UserRepository.users.map(({ passwordHash: _, ...user }) => user)
  }
}
