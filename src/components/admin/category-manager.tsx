"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = { id: string; name: string; type: "FOOD" | "DRINK"; _count: { items: number } };

export function CategoryManager({ onChanged }: { onChanged?: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<"FOOD" | "DRINK">("FOOD");

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/menu/categories");
      return res.json() as Promise<Category[]>;
    },
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch("/api/menu/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, position: categories?.length ?? 0 }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not create category");
      return;
    }
    setName("");
    toast.success("Category created");
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    onChanged?.();
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Delete "${category.name}"?`)) return;
    const res = await fetch(`/api/menu/categories/${category.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not delete category");
      return;
    }
    toast.success("Category deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    onChanged?.();
  }

  return (
    <Card className="p-5">
      <h3 className="font-display text-lg text-foreground">Categories</h3>
      <form onSubmit={handleCreate} className="mt-4 flex gap-2">
        <Input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <Select value={type} onValueChange={(v) => setType(v as "FOOD" | "DRINK")}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FOOD">Food</SelectItem>
            <SelectItem value="DRINK">Drink</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" size="icon" aria-label="Add category">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-4 space-y-2">
        {categories?.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">{c.name}</span>
              <Badge variant={c.type === "FOOD" ? "primary" : "secondary"}>{c.type}</Badge>
              <span className="text-xs text-muted-foreground">{c._count.items} items</span>
            </div>
            <button onClick={() => handleDelete(c)} className="text-muted-foreground hover:text-destructive cursor-pointer">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
