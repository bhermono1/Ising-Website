"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart, type CartItem } from "@/hooks/use-cart";

export function CartItemRow({ item }: { item: CartItem }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);

  return (
    <div className="flex items-center gap-4 border-b border-border py-4 last:border-0">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
        {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />}
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{item.name}</p>
        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setQuantity(item.menuItemId, item.quantity - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary cursor-pointer"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-foreground">{item.quantity}</span>
        <button
          onClick={() => setQuantity(item.menuItemId, item.quantity + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary cursor-pointer"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <p className="w-20 shrink-0 text-right font-semibold text-foreground">
        {formatCurrency(item.price * item.quantity)}
      </p>
      <button
        onClick={() => removeItem(item.menuItemId)}
        className="text-muted-foreground transition-colors hover:text-destructive cursor-pointer"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
