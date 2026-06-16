"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

export type MenuItemCardData = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  imageUrl: string | null;
  isAvailable: boolean;
  allergens: string[];
};

export function MenuItemCard({ item }: { item: MenuItemCardData }) {
  const addItem = useCart((s) => s.addItem);

  return (
    <Card className="flex gap-4 overflow-hidden p-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:h-28 sm:w-28">
        {item.imageUrl && (
          <Image src={item.imageUrl} alt={item.name} fill sizes="112px" className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base text-foreground sm:text-lg">{item.name}</h3>
          <span className="shrink-0 font-semibold text-secondary">{formatCurrency(item.price)}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex flex-wrap gap-1.5">
            {item.allergens.slice(0, 2).map((a) => (
              <Badge key={a} variant="outline" className="text-[10px] capitalize">
                {a}
              </Badge>
            ))}
          </div>
          <Button
            size="sm"
            variant="secondary"
            disabled={!item.isAvailable}
            onClick={() => {
              addItem({
                menuItemId: item.id,
                name: item.name,
                price: Number(item.price),
                imageUrl: item.imageUrl,
              });
              toast.success(`${item.name} added to cart`);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> {item.isAvailable ? "Add" : "Sold out"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
