import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReservationCard } from "@/components/dashboard/reservation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "My Reservations" };

export default async function ReservationsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const reservations = await prisma.reservation.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { room: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
  });

  const now = new Date();
  const upcoming = reservations.filter((r) => r.date >= new Date(now.toDateString()) && r.status !== "CANCELLED");
  const past = reservations.filter((r) => r.date < new Date(now.toDateString()) || r.status === "CANCELLED");

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">My Reservations</h1>
        <Button asChild size="sm">
          <Link href="/book">Book a room</Link>
        </Button>
      </div>

      <div>
        <h2 className="font-display text-lg text-foreground">Upcoming</h2>
        <div className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No upcoming reservations" />
          ) : (
            upcoming.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={{
                  id: r.id,
                  date: r.date,
                  startTime: r.startTime,
                  endTime: r.endTime,
                  guestCount: r.guestCount,
                  status: r.status,
                  depositAmount: r.depositAmount.toString(),
                  room: r.room,
                }}
              />
            ))
          )}
        </div>
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-foreground">Past & cancelled</h2>
          <div className="mt-4 space-y-3 opacity-80">
            {past.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={{
                  id: r.id,
                  date: r.date,
                  startTime: r.startTime,
                  endTime: r.endTime,
                  guestCount: r.guestCount,
                  status: r.status,
                  depositAmount: r.depositAmount.toString(),
                  room: r.room,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
