"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">ProTools</h3>
            <p className="text-sm opacity-75">Tu tienda de herramientas profesionales de confianza.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Productos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:opacity-75 transition">
                  Taladros
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-75 transition">
                  Sierras
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-75 transition">
                  Lijadoras
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-75 transition">
                  Herramientas Manuales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:opacity-75 transition">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-75 transition">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-75 transition">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-75 transition">
                  Devoluciones
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:opacity-75 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:opacity-75 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:opacity-75 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:opacity-75 transition">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>&copy; 2025 ProTools. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:opacity-75 transition">
              Privacidad
            </Link>
            <Link href="#" className="hover:opacity-75 transition">
              Términos
            </Link>
            <Link href="#" className="hover:opacity-75 transition">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
