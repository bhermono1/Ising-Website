"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/image-uploader";

export type MenuItemFormValues = {
  id?: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens: string[];
};

export function MenuItemForm({
  initial,
  categories,
  onSaved,
}: {
  initial?: MenuItemFormValues;
  categories: { id: string; name: string }[];
  onSaved: () => void;
}) {
  const [values, setValues] = useState<MenuItemFormValues>(
    initial ?? {
      categoryId: categories[0]?.id ?? "",
      name: "",
      description: "",
      price: 10,
      imageUrl: "",
      isAvailable: true,
      isFeatured: false,
      allergens: [],
    }
  );
  const [allergensText, setAllergensText] = useState((initial?.allergens ?? []).join(", "));
  const [loading, setLoading] = useState(false);

  function set<K extends keyof MenuItemFormValues>(key: K, value: MenuItemFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...values,
      allergens: allergensText.split(",").map((a) => a.trim()).filter(Boolean),
    };

    try {
      const res = await fetch(values.id ? `/api/menu/items/${values.id}` : "/api/menu/items", {
        method: values.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save item");
      toast.success(values.id ? "Item updated" : "Item created");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Category</Label>
        <Select value={values.categoryId} onValueChange={(v) => set("categoryId", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" required value={values.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" required rows={2} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="price">Price ($)</Label>
        <Input id="price" type="number" min={0} step="0.01" required value={values.price} onChange={(e) => set("price", Number(e.target.value))} />
      </div>
      <div>
        <Label>Photo</Label>
        <ImageUploader
          images={values.imageUrl ? [values.imageUrl] : []}
          onChange={(urls) => set("imageUrl", urls[0] ?? "")}
          max={1}
        />
      </div>
      <div>
        <Label htmlFor="allergens">Allergens (comma separated)</Label>
        <Input id="allergens" value={allergensText} onChange={(e) => setAllergensText(e.target.value)} placeholder="gluten, dairy" />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-2.5">
        <Label className="mb-0">Available</Label>
        <Switch checked={values.isAvailable} onCheckedChange={(v) => set("isAvailable", v)} />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-2.5">
        <Label className="mb-0">Featured on homepage</Label>
        <Switch checked={values.isFeatured} onCheckedChange={(v) => set("isFeatured", v)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {values.id ? "Save changes" : "Create item"}
      </Button>
    </form>
  );
}
