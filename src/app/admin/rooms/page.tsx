"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RoomForm, type RoomFormValues } from "@/components/admin/room-form";
import { formatCurrency } from "@/lib/utils";

type AdminRoom = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerHour: string;
  amenities: string[];
  minDuration: number;
  maxDuration: number;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  images: { url: string; alt: string }[];
  _count: { reservations: number };
};

export default function AdminRoomsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoomFormValues | undefined>(undefined);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: async () => {
      const res = await fetch("/api/rooms");
      if (!res.ok) throw new Error("Failed to load rooms");
      return res.json() as Promise<AdminRoom[]>;
    },
  });

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(room: AdminRoom) {
    setEditing({
      id: room.id,
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      pricePerHour: Number(room.pricePerHour),
      amenities: room.amenities,
      minDuration: room.minDuration,
      maxDuration: room.maxDuration,
      openTime: room.openTime,
      closeTime: room.closeTime,
      isActive: room.isActive,
      images: room.images.map((i) => i.url),
    });
    setDialogOpen(true);
  }

  async function handleDelete(room: AdminRoom) {
    if (!confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/rooms/${room.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not delete room");
      return;
    }
    toast.success("Room deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
  }

  function handleSaved() {
    setDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">Rooms</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New room
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {rooms?.map((room) => (
            <Card key={room.id} className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {room.images[0] && <Image src={room.images[0].url} alt={room.name} fill sizes="64px" className="object-cover" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{room.name}</p>
                  <Badge variant={room.isActive ? "success" : "outline"}>{room.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(room.pricePerHour)}/hr · up to {room.capacity} guests · {room._count.reservations} bookings
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit(room)} aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(room)} aria-label="Delete">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit room" : "New room"}</DialogTitle>
          </DialogHeader>
          <RoomForm initial={editing} onSaved={handleSaved} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
