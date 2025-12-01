"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Menu, X, User, LogOut, Shield, Heart, Package } from "lucide-react"
import { playfairDisplay, poppins } from "@/lib/fonts"
import { useAuth } from "@/contexts/auth-context"
import AuthModal from "./auth-modal"
import { Button } from "./ui/button"

interface HeaderProps {
  onSearch: (query: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem("cart")
      if (cart) {
        try {
          const items = JSON.parse(cart)
          if (Array.isArray(items) && items.length > 0) {
            const count = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
            setCartCount(count)
          } else {
            setCartCount(0)
          }
        } catch {
          setCartCount(0)
        }
      } else {
        setCartCount(0)
      }
    }

    updateCartCount()
    window.addEventListener("storage", updateCartCount)
    return () => window.removeEventListener("storage", updateCartCount)
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="max-w-full px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img 
              src="/logo-debandi.svg" 
              alt="Debandi" 
              className="h-12 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link href="/" className={`px-3 py-2 hover:bg-primary-foreground/10 rounded transition ${poppins.className} text-sm font-medium`}>
              Inicio
            </Link>
            <Link href="/listado" className={`px-3 py-2 hover:bg-primary-foreground/10 rounded transition ${poppins.className} text-sm font-medium`}>
              Listado De Productos
            </Link>
            <Link href="/contacto" className={`px-3 py-2 hover:bg-primary-foreground/10 rounded transition ${poppins.className} text-sm font-medium`}>
              Contacto
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4 flex-shrink-0 ml-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchValue}
                onChange={handleSearch}
                className="bg-gradient-to-r from-white to-gray-50 text-foreground pl-12 pr-5 py-2.5 rounded-full w-72 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 border border-gray-200 hover:border-gray-300 transition-all placeholder:text-gray-400 shadow-sm hover:shadow-md"
              />
            </div>
            <Link href="/cart" className="relative p-2 hover:bg-primary-foreground/10 rounded transition">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/favoritos" className="p-2 hover:bg-primary-foreground/10 rounded transition">
              <Heart className="w-6 h-6" />
            </Link>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-primary-foreground/10 rounded transition"
                >
                  <User className="w-6 h-6" />
                  <span>{user.firstName || user.email}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-background text-foreground rounded-lg shadow-lg border py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium">{user.email}</p>
                      {user.isAdmin && (
                        <span className="text-xs text-accent">Administrador</span>
                      )}
                    </div>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-accent/10 transition"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Shield className="w-4 h-4" />
                        Panel Admin
                      </Link>
                    )}
                    <Link
                      href="/ordenes"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent/10 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Package className="w-4 h-4" />
                      Historial Pedidos
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent/10 transition w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                className="bg-primary-foreground/10"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden space-y-4 pb-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchValue}
                onChange={handleSearch}
                className="bg-gradient-to-r from-white to-gray-50 text-foreground pl-12 pr-5 py-2.5 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 border border-gray-200 hover:border-gray-300 transition-all placeholder:text-gray-400 shadow-sm hover:shadow-md"
              />
            </div>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="hover:opacity-80 transition py-2">
                Inicio
              </Link>
              <Link href="/listado" className="hover:opacity-80 transition py-2">
                Listado De Productos
              </Link>
              <Link href="#" className="hover:opacity-80 transition py-2">
                Contacto
              </Link>
            </nav>
            <Link href="/cart" className="flex items-center gap-2 py-2 hover:opacity-80 transition">
              <ShoppingCart className="w-5 h-5" />
              Carrito ({cartCount})
            </Link>
            <Link href="/favoritos" className="flex items-center gap-2 py-2 hover:opacity-80 transition">
              <Heart className="w-5 h-5" />
              Mis Favoritos
            </Link>
            
            {user ? (
              <div className="space-y-2 border-t pt-2">
                <p className="text-sm">Hola, {user.firstName || user.email}</p>
                {user.isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2 py-2 hover:opacity-80 transition">
                    <Shield className="w-5 h-5" />
                    Panel Admin
                  </Link>
                )}
                <Link href="/ordenes" className="flex items-center gap-2 py-2 hover:opacity-80 transition">
                  <Package className="w-5 h-5" />
                  Historial Pedidos
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 py-2 hover:opacity-80 transition w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Button onClick={() => setShowAuthModal(true)} className="w-full">
                Iniciar Sesión
              </Button>
            )}
          </div>
        )}
      </div>
      
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </header>
  )
}
