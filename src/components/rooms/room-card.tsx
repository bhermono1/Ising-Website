import Link from "next/link";
import Image from "next/image";
import { Users, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export type RoomCardData = {
  id: string;
  name: string;
  slug: string;
  capacity: number;
  pricePerHour: number | string;
  amenities: string[];
  images: { url: string; alt: string }[];
};

export function RoomCard({ room, priority = false }: { room: RoomCardData; priority?: boolean }) {
  const cover = room.images[0]?.url;

  return (
    <Card className="group overflow-hidden p-0 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_0_32px_rgba(255,45,120,0.18)]">
      <Link href={`/rooms/${room.slug}`} className="block">
        <div className="relative h-56 w-full overflow-hidden bg-surface-2">
          {cover && (
            <Image
              src={cover}
              alt={room.images[0]?.alt || room.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
          <Badge variant="primary" className="absolute left-4 top-4">
            {formatCurrency(room.pricePerHour)}/hr
          </Badge>
        </div>
      </Link>
      <div className="p-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl text-foreground">
            <Link href={`/rooms/${room.slug}`} className="hover:text-primary">
              {room.name}
            </Link>
          </h3>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" /> Up to {room.capacity} guests
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {room.amenities.slice(0, 3).map((a) => (
            <span key={a} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-secondary" /> {a}
            </span>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Button asChild className="flex-1" size="sm">
            <Link href={`/book?room=${room.slug}`}>Book now</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/rooms/${room.slug}`}>Details</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
