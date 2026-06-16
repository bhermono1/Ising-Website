"use client";

import { useMemo, useState } from "react";
import { Search, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuItemCard, type MenuItemCardData } from "@/components/menu/menu-item-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export type MenuCategoryData = {
  id: string;
  name: string;
  type: "FOOD" | "DRINK";
};

export function MenuBrowser({
  categories,
  items,
}: {
  categories: MenuCategoryData[];
  items: (MenuItemCardData & { categoryId: string })[];
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"ALL" | "FOOD" | "DRINK">("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");

  const visibleCategories = useMemo(
    () => categories.filter((c) => type === "ALL" || c.type === type),
    [categories, type]
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      if (!category) return false;
      if (type !== "ALL" && category.type !== type) return false;
      if (categoryId !== "ALL" && item.categoryId !== categoryId) return false;
      if (query && !`${item.name} ${item.description}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, categories, type, categoryId, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, (MenuItemCardData & { categoryId: string })[]>();
    for (const item of filteredItems) {
      const list = map.get(item.categoryId) ?? [];
      list.push(item);
      map.set(item.categoryId, list);
    }
    return map;
  }, [filteredItems]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={type}
          onValueChange={(v) => {
            setType(v as typeof type);
            setCategoryId("ALL");
          }}
        >
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="FOOD">Food</TabsTrigger>
            <TabsTrigger value="DRINK">Drinks</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search the menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryId("ALL")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors cursor-pointer",
            categoryId === "ALL" ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          All categories
        </button>
        {visibleCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors cursor-pointer",
              categoryId === c.id ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No items match your search"
          description="Try a different keyword or clear your filters."
          className="mt-10"
        />
      ) : (
        <div className="mt-10 space-y-12">
          {visibleCategories.map((category) => {
            const categoryItems = grouped.get(category.id);
            if (!categoryItems?.length) return null;
            return (
              <div key={category.id}>
                <h2 className="font-display text-2xl text-foreground">{category.name}</h2>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {categoryItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
