import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, CalendarCheck, Sparkles, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RoomGallery } from "@/components/rooms/room-gallery";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

// See app/page.tsx (home) for why this is force-dynamic rather than ISR.
export const dynamic = "force-dynamic";

async function getRoom(slug: string) {
  return prisma.room.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoom(slug);
  if (!room) return {};
  return {
    title: room.name,
    description: room.description,
  };
}

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await getRoom(slug);
  if (!room || !room.isActive) notFound();

  const avgRating =
    room.reviews.length > 0 ? room.reviews.reduce((sum, r) => sum + r.rating, 0) / room.reviews.length : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <RoomGallery images={room.images} name={room.name} />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">{room.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Up to {room.capacity} guests
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {room.minDuration}–{room.maxDuration} min sessions
            </span>
            {avgRating && (
              <span className="flex items-center gap-1.5">
                <StarRating rating={Math.round(avgRating)} size={14} /> {avgRating.toFixed(1)} ({room.reviews.length})
              </span>
            )}
          </div>

          <p className="mt-6 text-muted-foreground leading-relaxed">{room.description}</p>

          <h2 className="mt-10 font-display text-xl text-foreground">Amenities</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {room.amenities.map((a) => (
              <div key={a} className="flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-sm text-foreground">
                <Sparkles className="h-4 w-4 text-secondary" /> {a}
              </div>
            ))}
          </div>

          {room.reviews.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-xl text-foreground">Guest reviews</h2>
              <div className="mt-4 space-y-4">
                {room.reviews.map((review) => (
                  <Card key={review.id} className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{review.user.name ?? "Guest"}</span>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-24 p-6">
            <p className="text-sm text-muted-foreground">Admission</p>
            <p className="font-display text-2xl text-foreground">
              {formatCurrency(room.weekdayRatePerPerson)}<span className="text-base text-muted-foreground">/person·hr</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Mon–Thu · {formatCurrency(room.weekendRatePerPerson)}/person·hr Fri–Sun</p>
            <Button size="lg" className="mt-6 w-full" asChild>
              <Link href={`/book?room=${room.slug}`}>
                <CalendarCheck className="h-4 w-4" /> Book this room
              </Link>
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              A small deposit secures your reservation. Free cancellation up to 24h before.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
