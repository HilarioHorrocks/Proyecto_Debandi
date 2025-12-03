# 🔐 Arquitectura de Seguridad - Debandi Store

## Descripción General

Este proyecto implementa una arquitectura de seguridad robusta en capas, siguiendo las mejores prácticas de desarrollo web moderno.

## 📁 Estructura del Proyecto

```
├── services/                      # Capa de servicios (lógica de negocio)
│   ├── auth.service.ts           # Servicio de autenticación
│   ├── product.service.ts        # Servicio de productos
│   └── repositories/             # Capa de acceso a datos
│       ├── user.repository.ts    # Repositorio de usuarios
│       └── product.repository.ts # Repositorio de productos
│
├── lib/
│   ├── middlewares/              # Middlewares de seguridad
│   │   └── auth.middleware.ts    # Middleware de autenticación/autorización
│   │
│   ├── validators/               # Validadores de entrada
│   │   └── schemas.ts            # Schemas de validación con Zod
│   │
│   └── security/                 # Utilidades de seguridad
│       ├── rate-limiter.ts       # Rate limiting contra ataques de fuerza bruta
│       └── utils.ts              # Utilidades de seguridad
│
└── app/api/                      # Rutas API (controladores)
    ├── auth/
    │   ├── login/route.ts
    │   ├── register/route.ts
    │   ├── logout/route.ts
    └── └── me/route.ts
    └── admin/products/
        ├── route.ts
        └── [id]/route.ts
```

## 🏗️ Arquitectura en Capas

### 1. **Capa de Presentación (API Routes)**
- **Responsabilidad**: Manejar requests HTTP, validar inputs y retornar respuestas
- **Archivos**: `app/api/**/*.ts`
- **Características**:
  - Validación de datos con Zod
  - Manejo de errores centralizado
  - Rate limiting por endpoint

### 2. **Capa de Servicios**
- **Responsabilidad**: Lógica de negocio pura
- **Archivos**: `services/*.service.ts`
- **Características**:
  - Independiente de HTTP/Express/Next.js
  - Reutilizable en diferentes contextos
  - Fácil de testear

### 3. **Capa de Repositorios**
- **Responsabilidad**: Acceso a datos (actualmente en memoria, fácil migrar a DB)
- **Archivos**: `services/repositories/*.ts`
- **Características**:
  - Abstracción del almacenamiento
  - Fácil migración a PostgreSQL/MongoDB
  - CRUD operations encapsuladas

### 4. **Capa de Seguridad**
- **Responsabilidad**: Protección contra vulnerabilidades
- **Archivos**: `lib/middlewares/*`, `lib/security/*`
- **Características**:
  - Autenticación JWT
  - Autorización basada en roles
  - Rate limiting
  - Validación de inputs

## 🛡️ Características de Seguridad

### 1. **Autenticación JWT**
- Tokens firmados con HS256
- Expiración configurable (7 días por defecto)
- Almacenamiento en cookies httpOnly
- Soporte para header Authorization

```typescript
// Ejemplo de uso
const { user, token } = await authService.login({ email, password })
```

### 2. **Validación de Contraseñas**
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Hashing con bcrypt (12 rounds)
- Detección de contraseñas comunes

```typescript
// Contraseñas nuevas requieren
Admin123!  // ✅ Válida
cliente123 // ❌ Rechazada (sin mayúscula)
password   // ❌ Rechazada (demasiado común)
```

### 3. **Rate Limiting**
Protección contra ataques de fuerza bruta:

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/api/auth/login` | 5 intentos | 15 minutos |
| `/api/auth/register` | 3 intentos | 1 hora |
| API general | 100 requests | 1 minuto |

```typescript
// Se bloquea automáticamente después de exceder el límite
// HTTP 429 Too Many Requests
{
  "error": "Demasiados intentos...",
  "resetTime": "2025-12-03T15:30:00.000Z"
}
```

### 4. **Middleware de Autorización**

```typescript
// Solo usuarios autenticados
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    // Tu lógica aquí
  })
}

// Solo administradores
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async (req, userId) => {
    // Tu lógica aquí
  })
}
```

### 5. **Validación de Inputs con Zod**

Todos los inputs se validan antes de procesarse:

```typescript
// Validación automática
const validatedData = validateData(loginSchema, body)

// Si falla, retorna:
{
  "error": "Errores de validación",
  "details": [
    { "field": "email", "message": "Email inválido" },
    { "field": "password", "message": "La contraseña es requerida" }
  ]
}
```

### 6. **Cookies Seguras**

```typescript
response.cookies.set("auth-token", token, {
  httpOnly: true,    // No accesible desde JavaScript
  secure: true,      // Solo HTTPS en producción
  sameSite: "lax",   // Protección CSRF
  maxAge: 604800,    // 7 días
  path: "/"
})
```

### 7. **Sanitización y Headers de Seguridad**

- XSS Protection
- Content Type Options
- Frame Options (clickjacking)
- Referrer Policy
- Permissions Policy

## 🔑 Usuarios por Defecto

Para desarrollo y testing:

```
Admin:
  Email: admin@debandi.com
  Password: Admin123!

Cliente:
  Email: cliente@debandi.com
  Password: Cliente123!
```

## 📊 Flujo de Autenticación

```
1. Cliente → POST /api/auth/login
2. Rate Limiter → Verificar límite de intentos
3. Validator → Validar email y password
4. AuthService → Verificar credenciales
5. UserRepository → Buscar usuario en BD
6. bcrypt → Comparar hashes
7. JWT → Generar token firmado
8. Response → Retornar token + usuario (sin password)
9. Cookie → Establecer cookie httpOnly
```

## 📊 Flujo de Autorización

```
1. Cliente → GET /api/admin/products
2. withAdminAuth → Extraer token de cookie/header
3. JWT → Verificar y decodificar token
4. Middleware → Verificar rol de admin
5. Controller → Ejecutar lógica de negocio
6. ProductService → Procesar request
7. ProductRepository → Acceder a datos
8. Response → Retornar datos
```

## 🚀 Mejoras Futuras Recomendadas

### Corto Plazo
- [ ] Migrar de almacenamiento en memoria a PostgreSQL/MongoDB
- [ ] Implementar refresh tokens
- [ ] Agregar logging estructurado (Winston/Pino)
- [ ] Implementar auditoría de acciones administrativas

### Mediano Plazo
- [ ] 2FA (Autenticación de dos factores)
- [ ] OAuth/Social login (Google, Facebook)
- [ ] Recuperación de contraseña por email
- [ ] Verificación de email al registrarse
- [ ] CAPTCHA en formularios de registro/login

### Largo Plazo
- [ ] Sistema de permisos granulares (RBAC completo)
- [ ] Sesiones distribuidas con Redis
- [ ] Monitoreo de seguridad en tiempo real
- [ ] WAF (Web Application Firewall)
- [ ] Análisis de comportamiento anómalo

## 🔒 Variables de Entorno

Crear archivo `.env.local`:

```bash
# JWT Secret (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu-secreto-super-seguro-de-al-menos-32-caracteres

# Entorno
NODE_ENV=development # o production

# Base de datos (cuando migres)
# DATABASE_URL=postgresql://user:password@localhost:5432/debandi
```

## 📝 Ejemplo de Uso

### Login
```typescript
// Frontend
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@debandi.com',
    password: 'Admin123!'
  })
})

const { user, token } = await response.json()
```

### Request Autenticado
```typescript
// Frontend (con cookie)
const response = await fetch('/api/admin/products', {
  credentials: 'include' // Incluir cookies
})

// Frontend (con header)
const response = await fetch('/api/admin/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Crear Producto (Admin)
```typescript
const response = await fetch('/api/admin/products', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Nuevo Producto',
    description: 'Descripción del producto',
    price: 99.99,
    originalPrice: 149.99,
    category: 'herramientas',
    image: '/image.jpg',
    stock: 50,
    brand: 'Marca'
  })
})
```

## 🧪 Testing

```bash
# Instalar dependencias de testing (futuro)
pnpm add -D vitest @testing-library/react

# Ejemplos de tests que se pueden agregar:
# - AuthService.login() con credenciales válidas/inválidas
# - Rate limiter alcanza el límite correctamente
# - Middleware rechaza tokens inválidos
# - Validadores rechazan datos incorrectos
```

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Zod Documentation](https://zod.dev/)

## 🤝 Contribución

Al agregar nuevas rutas API:
1. Usar los middlewares de autenticación apropiados
2. Validar todos los inputs con Zod
3. Implementar lógica en servicios, no en routes
4. Manejar errores específicos
5. Documentar cambios en este README
