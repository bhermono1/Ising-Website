"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/admin/image-uploader";

export type RoomFormValues = {
  id?: string;
  name: string;
  description: string;
  capacity: number;
  weekdayRatePerPerson: number;
  weekendRatePerPerson: number;
  amenities: string[];
  minDuration: number;
  maxDuration: number;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  images: string[];
};

const EMPTY: RoomFormValues = {
  name: "",
  description: "",
  capacity: 8,
  weekdayRatePerPerson: 7.50,
  weekendRatePerPerson: 9.50,
  amenities: [],
  minDuration: 60,
  maxDuration: 240,
  openTime: "11:00",
  closeTime: "23:30",
  isActive: true,
  images: [],
};

export function RoomForm({ initial, onSaved }: { initial?: RoomFormValues; onSaved: () => void }) {
  const [values, setValues] = useState<RoomFormValues>(initial ?? EMPTY);
  const [amenitiesText, setAmenitiesText] = useState((initial?.amenities ?? []).join(", "));
  const [loading, setLoading] = useState(false);

  function set<K extends keyof RoomFormValues>(key: K, value: RoomFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const amenities = amenitiesText
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const payload = {
      name: values.name,
      description: values.description,
      capacity: values.capacity,
      weekdayRatePerPerson: values.weekdayRatePerPerson,
      weekendRatePerPerson: values.weekendRatePerPerson,
      amenities,
      minDuration: values.minDuration,
      maxDuration: values.maxDuration,
      openTime: values.openTime,
      closeTime: values.closeTime,
      isActive: values.isActive,
      images: values.images.map((url, i) => ({ url, alt: values.name, position: i })),
    };

    try {
      const res = await fetch(values.id ? `/api/rooms/${values.id}` : "/api/rooms", {
        method: values.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save room");
      toast.success(values.id ? "Room updated" : "Room created");
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
        <Label htmlFor="name">Name</Label>
        <Input id="name" required value={values.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" required rows={3} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input id="capacity" type="number" min={1} required value={values.capacity} onChange={(e) => set("capacity", Number(e.target.value))} />
        </div>
        <div>
          <Label htmlFor="weekdayRate">Weekday ($/person/hr)</Label>
          <Input id="weekdayRate" type="number" min={0} step="0.01" required value={values.weekdayRatePerPerson} onChange={(e) => set("weekdayRatePerPerson", Number(e.target.value))} />
        </div>
        <div>
          <Label htmlFor="weekendRate">Weekend ($/person/hr)</Label>
          <Input id="weekendRate" type="number" min={0} step="0.01" required value={values.weekendRatePerPerson} onChange={(e) => set("weekendRatePerPerson", Number(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minDuration">Min duration (min)</Label>
          <Input id="minDuration" type="number" min={30} step={30} value={values.minDuration} onChange={(e) => set("minDuration", Number(e.target.value))} />
        </div>
        <div>
          <Label htmlFor="maxDuration">Max duration (min)</Label>
          <Input id="maxDuration" type="number" min={30} step={30} value={values.maxDuration} onChange={(e) => set("maxDuration", Number(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="openTime">Opens</Label>
          <Input id="openTime" type="time" value={values.openTime} onChange={(e) => set("openTime", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="closeTime">Closes</Label>
          <Input id="closeTime" type="time" value={values.closeTime} onChange={(e) => set("closeTime", e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="amenities">Amenities (comma separated)</Label>
        <Input id="amenities" value={amenitiesText} onChange={(e) => setAmenitiesText(e.target.value)} placeholder="Disco lighting, Premium sound system" />
      </div>
      <div>
        <Label>Photos</Label>
        <ImageUploader images={values.images} onChange={(urls) => set("images", urls)} />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-2.5">
        <Label className="mb-0">Active (visible to customers)</Label>
        <Switch checked={values.isActive} onCheckedChange={(v) => set("isActive", v)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {values.id ? "Save changes" : "Create room"}
      </Button>
    </form>
  );
}
