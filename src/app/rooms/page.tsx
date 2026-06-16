import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { RoomCard } from "@/components/rooms/room-card";
import { EmptyState } from "@/components/ui/empty-state";
import { DoorOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Rooms",
  description: "Browse our private karaoke rooms — capacity, hourly pricing, and amenities for every group size.",
};

export const revalidate = 60;

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { capacity: "asc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Our Rooms</span>
        <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">Five rooms, five moods</h1>
        <p className="mt-4 text-muted-foreground">
          Whether it&apos;s a duet for two or a 24-person send-off, there&apos;s a stage built for it.
        </p>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No rooms available right now"
          description="Check back soon — we're refreshing our room lineup."
          className="mt-12"
        />
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, index) => (
            <RoomCard
              key={room.id}
              priority={index === 0}
              room={{
                id: room.id,
                name: room.name,
                slug: room.slug,
                capacity: room.capacity,
                pricePerHour: room.pricePerHour.toString(),
                amenities: room.amenities,
                images: room.images,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
