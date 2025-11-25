"use client"

import { Trash2, Minus, Plus } from "lucide-react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  stock: number
}

interface CartItemsProps {
  items: CartItem[]
  onUpdate: (items: CartItem[]) => void
}

export default function CartItems({ items, onUpdate }: CartItemsProps) {
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    const updated = items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    onUpdate(updated)
  }

  const removeItem = (id: number) => {
    const updated = items.filter((item) => item.id !== id)
    onUpdate(updated)
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
          <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-24 h-24 object-cover rounded" />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
            <p className="text-lg font-bold text-primary">${item.price.toFixed(2)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-2 hover:bg-muted rounded transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-semibold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="p-2 hover:bg-muted rounded transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            className="p-2 text-destructive hover:bg-destructive/10 rounded transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  )
}
