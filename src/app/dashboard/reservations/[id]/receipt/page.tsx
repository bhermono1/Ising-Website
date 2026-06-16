import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReceiptView } from "@/components/dashboard/receipt-view";
import { formatTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Reservation Receipt" };

export default async function ReservationReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { room: true, user: true, payments: { where: { status: "SUCCEEDED" } } },
  });

  if (!reservation) notFound();
  if (reservation.userId !== session!.user.id && session!.user.role !== "ADMIN") redirect("/dashboard/reservations");

  const paid = reservation.payments[0]?.amount ?? reservation.depositAmount;

  return (
    <ReceiptView
      title="Deposit Receipt"
      receiptId={reservation.id}
      date={reservation.createdAt}
      customerName={reservation.user.name ?? "Guest"}
      customerEmail={reservation.user.email}
      lines={[
        {
          label: `${reservation.room.name} — ${formatTime(reservation.startTime)} to ${formatTime(reservation.endTime)}`,
          amount: Number(paid.toString()),
        },
      ]}
      total={Number(paid.toString())}
      footerNote={`Estimated room total of ${Number(reservation.totalAmount.toString()).toFixed(2)} (deposit shown above) is settled at the venue, less any amount already paid.`}
    />
  );
}
