import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Debandi - Tienda de Herramientas Profesionales",
  description: "Tu tienda en línea de herramientas de calidad profesional. Taladros, sierras, lijadoras y más.",
  keywords: "herramientas, taladros, sierras, profesional",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <FavoritesProvider>
            {children}
            <Toaster />
          </FavoritesProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
