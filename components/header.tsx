"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Menu, X, User, LogOut, Shield } from "lucide-react"
import { playfairDisplay } from "@/lib/fonts"
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
        const items = JSON.parse(cart)
        if (Array.isArray(items)) {
          const count = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
          setCartCount(count)
        }
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
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-light">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
              <span className="font-black">⚙</span>
            </div>
            <span className={playfairDisplay.className}>Debandi</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="hover:opacity-80 transition">
              Inicio
            </Link>
            <Link href="/listado" className="hover:opacity-80 transition">
              Listado De Productos
            </Link>
            <Link href="#" className="hover:opacity-80 transition">
              Contacto
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchValue}
                onChange={handleSearch}
                className="bg-primary-foreground text-foreground pl-10 pr-4 py-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-accent"
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchValue}
                onChange={handleSearch}
                className="bg-primary-foreground text-foreground pl-10 pr-4 py-2 rounded w-full focus:outline-none"
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
            
            {user ? (
              <div className="space-y-2 border-t pt-2">
                <p className="text-sm">Hola, {user.firstName || user.email}</p>
                {user.isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2 py-2 hover:opacity-80 transition">
                    <Shield className="w-5 h-5" />
                    Panel Admin
                  </Link>
                )}
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
