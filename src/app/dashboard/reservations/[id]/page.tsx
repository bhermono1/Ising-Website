import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Users, Clock, Receipt, ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CancelReservationButton } from "@/components/dashboard/cancel-reservation-button";
import { PaymentStatusPoller } from "@/components/dashboard/payment-status-poller";
import { ReviewForm } from "@/components/dashboard/review-form";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { RESERVATION_STATUS_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Reservation Details" };

export default async function ReservationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const { success } = await searchParams;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { room: { include: { images: { orderBy: { position: "asc" } } } }, payments: true, orders: true },
  });

  if (!reservation) notFound();
  if (reservation.userId !== session!.user.id && session!.user.role !== "ADMIN") redirect("/dashboard/reservations");

  const cancellable = reservation.status === "PENDING" || reservation.status === "CONFIRMED";
  const cover = reservation.room.images[0]?.url;

  const existingReview =
    reservation.status === "COMPLETED"
      ? await prisma.review.findFirst({ where: { userId: reservation.userId, roomId: reservation.roomId } })
      : null;

  return (
    <div>
      <Link href="/dashboard/reservations" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to reservations
      </Link>

      <PaymentStatusPoller pending={Boolean(success) && reservation.status === "PENDING"} endpoint={`/api/reservations/${id}`} />

      <Card className="overflow-hidden p-0">
        {cover && (
          <div className="relative h-48 w-full">
            <Image src={cover} alt={reservation.room.name} fill sizes="800px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl text-foreground">{reservation.room.name}</h1>
              <p className="mt-1 text-muted-foreground">{formatDate(reservation.date)}</p>
            </div>
            <Badge variant={reservation.status === "CONFIRMED" ? "primary" : reservation.status === "CANCELLED" ? "destructive" : "default"}>
              {RESERVATION_STATUS_LABELS[reservation.status]}
            </Badge>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Time</p>
              <p className="mt-1 flex items-center gap-1.5 text-foreground">
                <Clock className="h-4 w-4" /> {formatTime(reservation.startTime)}–{formatTime(reservation.endTime)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Guests</p>
              <p className="mt-1 flex items-center gap-1.5 text-foreground">
                <Users className="h-4 w-4" /> {reservation.guestCount}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Deposit paid</p>
              <p className="mt-1 text-foreground">{formatCurrency(reservation.depositAmount)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated total</p>
              <p className="mt-1 text-foreground">{formatCurrency(reservation.totalAmount)}</p>
            </div>
          </div>

          {reservation.notes && (
            <p className="mt-5 rounded-xl bg-surface-2 p-3 text-sm text-muted-foreground">{reservation.notes}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {cancellable && <CancelReservationButton reservationId={reservation.id} />}
            <Button asChild variant="secondary" size="sm">
              <Link href={`/dashboard/reservations/${reservation.id}/receipt`}>
                <Receipt className="h-3.5 w-3.5" /> View receipt
              </Link>
            </Button>
            {reservation.status === "CONFIRMED" && (
              <Button asChild size="sm">
                <Link href={`/cart?reservation=${reservation.id}`}>Order food for this room</Link>
              </Button>
            )}
          </div>

          {reservation.cancellationReason && (
            <p className="mt-4 text-sm text-muted-foreground">Cancellation note: {reservation.cancellationReason}</p>
          )}
        </div>
      </Card>

      {reservation.status === "COMPLETED" && !existingReview && <ReviewForm roomId={reservation.roomId} />}
    </div>
  );
}
