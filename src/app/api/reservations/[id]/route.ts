import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe, toStripeAmount } from "@/lib/stripe";
import { getSiteSettings } from "@/lib/settings";
import { cancelReservationSchema, reservationStatusSchema } from "@/lib/validations/reservation";
import { sendEmail } from "@/lib/email";
import { reservationCancelledEmail } from "@/lib/email-templates";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "You must be signed in" }, { status: 401 });

  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { room: { include: { images: { take: 1, orderBy: { position: "asc" } } } }, payments: true, orders: true },
  });

  if (!reservation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reservation.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(reservation);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "You must be signed in" }, { status: 401 });

  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { room: true, payments: { where: { status: "SUCCEEDED" } }, user: true },
  });
  if (!reservation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = reservation.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);

  // Admin-only direct status change (e.g. approve, mark completed).
  if (isAdmin && body?.status) {
    const parsed = reservationStatusSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    const updated = await prisma.reservation.update({ where: { id }, data: { status: parsed.data.status } });
    return NextResponse.json(updated);
  }

  // Cancellation (owner or admin).
  if (body?.action === "cancel") {
    if (reservation.status === "CANCELLED" || reservation.status === "COMPLETED") {
      return NextResponse.json({ error: `Reservation is already ${reservation.status.toLowerCase()}` }, { status: 400 });
    }

    const parsed = cancelReservationSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const settings = await getSiteSettings();
    const hoursUntilStart = (reservation.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    const withinFreeWindow = hoursUntilStart >= Number(settings.freeCancellationWindowHours);
    const feePercent = withinFreeWindow ? 0 : Number(settings.lateCancellationFeePercent.toString());
    const refundAmount = Math.max(Number(reservation.depositAmount.toString()) * (1 - feePercent / 100), 0);

    const successfulPayment = reservation.payments[0];
    if (successfulPayment && refundAmount > 0) {
      await stripe.refunds.create({
        payment_intent: successfulPayment.stripePaymentIntentId,
        amount: toStripeAmount(refundAmount),
      });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason: parsed.data.reason,
      },
    });

    if (successfulPayment) {
      await prisma.reservationPayment.update({
        where: { id: successfulPayment.id },
        data: { status: refundAmount >= Number(successfulPayment.amount.toString()) ? "REFUNDED" : "SUCCEEDED" },
      });
    }

    await sendEmail({
      to: reservation.user.email,
      subject: "Your reservation was cancelled",
      html: reservationCancelledEmail({
        customerName: reservation.user.name ?? "there",
        roomName: reservation.room.name,
        date: reservation.date,
        refundAmount,
      }),
    });

    return NextResponse.json({ ...updated, refundAmount });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
