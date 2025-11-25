"use client"

import Link from "next/link"

interface CartItem {
  price: number
  quantity: number
}

interface CartSummaryProps {
  items: CartItem[]
}

export default function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping

  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky top-24 h-fit">
      <h2 className="text-xl font-bold text-foreground mb-6">Resumen</h2>

      <div className="space-y-3 mb-6 pb-6 border-b border-border">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Impuestos (8%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Envío</span>
          <span>{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span>
        </div>
      </div>

      <div className="flex justify-between text-xl font-bold text-foreground mb-6">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <Link
        href="/checkout"
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition font-semibold block text-center"
      >
        Proceder al Pago
      </Link>

      {subtotal > 0 && subtotal <= 100 && (
        <p className="text-xs text-muted-foreground text-center mt-4 bg-muted p-2 rounded">
          Envío gratis al gastar más de $100
        </p>
      )}
    </div>
  )
}
