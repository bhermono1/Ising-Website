import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MenuBrowser } from "@/components/menu/menu-browser";

export const metadata: Metadata = {
  title: "Menu",
  description: "Shareable plates, signature cocktails, and zero-proof drinks — order ahead or from your room.",
};

// See page.tsx (home) for why this is force-dynamic rather than ISR.
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [categories, items] = await Promise.all([
    prisma.menuCategory.findMany({ orderBy: [{ type: "asc" }, { position: "asc" }] }),
    prisma.menuItem.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Menu</span>
        <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">Kitchen & Bar</h1>
        <p className="mt-4 text-muted-foreground">
          Order ahead for your reservation or browse the full lineup before you arrive.
        </p>
      </div>

      <div className="mt-12">
        <MenuBrowser
          categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
          items={items.map((i) => ({
            id: i.id,
            categoryId: i.categoryId,
            name: i.name,
            description: i.description,
            price: i.price.toString(),
            imageUrl: i.imageUrl,
            isAvailable: i.isAvailable,
            allergens: i.allergens,
          }))}
        />
      </div>
    </div>
  );
}
