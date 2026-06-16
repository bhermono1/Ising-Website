import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RoomCard, type RoomCardData } from "@/components/rooms/room-card";
import { Button } from "@/components/ui/button";

export function FeaturedRooms({ rooms }: { rooms: RoomCardData[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Featured Rooms</span>
          <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">Find your room</h2>
        </div>
        <Button variant="link" asChild>
          <Link href="/rooms" className="flex items-center gap-1">
            View all rooms <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </section>
  );
}
