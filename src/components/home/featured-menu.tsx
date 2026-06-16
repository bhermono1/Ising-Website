import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MenuItemCard, type MenuItemCardData } from "@/components/menu/menu-item-card";
import { Button } from "@/components/ui/button";

export function FeaturedMenu({ items }: { items: MenuItemCardData[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Crowd Favorites</span>
          <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">From the kitchen & bar</h2>
        </div>
        <Button variant="link" asChild>
          <Link href="/menu" className="flex items-center gap-1">
            View full menu <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
