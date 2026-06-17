import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { BookingWizard, type BookingPrefill } from "@/components/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Book a Room",
  description: "Pick a room, date, and time — pay a small deposit online to lock in your reservation.",
};

export const dynamic = "force-dynamic";

async function BookingWizardServer({ prefill }: { prefill: BookingPrefill }) {
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <BookingWizard
      rooms={rooms.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        capacity: r.capacity,
        weekdayRatePerPerson: r.weekdayRatePerPerson.toString(),
        weekendRatePerPerson: r.weekendRatePerPerson.toString(),
        minDuration: r.minDuration,
        maxDuration: r.maxDuration,
      }))}
      prefill={prefill}
    />
  );
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string; date?: string; duration?: string; guests?: string; slot?: string }>;
}) {
  const { room, date, duration, guests, slot } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Reserve</span>
        <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">Book your room</h1>
        <p className="mt-4 text-muted-foreground">Real-time availability. A small deposit secures your spot.</p>
      </div>

      <div className="mt-12">
        <Suspense fallback={<p className="text-center text-muted-foreground">Loading rooms...</p>}>
          <BookingWizardServer
            prefill={{
              slug: room,
              date,
              duration: duration ? Number(duration) : undefined,
              guestCount: guests ? Number(guests) : undefined,
              slot,
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
