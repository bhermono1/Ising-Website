"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoryManager } from "@/components/admin/category-manager";
import { MenuItemForm, type MenuItemFormValues } from "@/components/admin/menu-item-form";
import { formatCurrency } from "@/lib/utils";

type AdminMenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens: string[];
  category: { name: string; type: "FOOD" | "DRINK" };
};

type Category = { id: string; name: string; type: "FOOD" | "DRINK" };

export default function AdminMenuPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItemFormValues | undefined>(undefined);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-menu-items"],
    queryFn: async () => {
      const res = await fetch("/api/menu/items");
      return res.json() as Promise<AdminMenuItem[]>;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/menu/categories");
      return res.json() as Promise<Category[]>;
    },
  });

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(item: AdminMenuItem) {
    setEditing({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      imageUrl: item.imageUrl ?? "",
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      allergens: item.allergens,
    });
    setDialogOpen(true);
  }

  async function toggleAvailable(item: AdminMenuItem) {
    const res = await fetch(`/api/menu/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    if (!res.ok) {
      toast.error("Could not update item");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
  }

  async function handleDelete(item: AdminMenuItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const res = await fetch(`/api/menu/items/${item.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not delete item");
      return;
    }
    toast.success("Item deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
  }

  function handleSaved() {
    setDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">Menu</h1>
        <Button size="sm" onClick={openCreate} disabled={!categories?.length}>
          <Plus className="h-4 w-4" /> New item
        </Button>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-3">
              {items?.map((item) => (
                <Card key={item.id} className="flex items-center gap-4 p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <Badge variant={item.category.type === "FOOD" ? "primary" : "secondary"}>{item.category.name}</Badge>
                      {item.isFeatured && <Badge variant="accent">Featured</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    Available <Switch checked={item.isAvailable} onCheckedChange={() => toggleAvailable(item)} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </Card>
              ))}
              {items?.length === 0 && <p className="text-muted-foreground">No menu items yet.</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager onChanged={() => queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] })} />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit item" : "New item"}</DialogTitle>
          </DialogHeader>
          {categories && <MenuItemForm initial={editing} categories={categories} onSaved={handleSaved} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
