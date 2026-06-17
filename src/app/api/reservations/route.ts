import { NextResponse } from "next/server";
import { Prisma, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/api-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createReservationSchema } from "@/lib/validations/reservation";
import { isSlotAvailable } from "@/lib/availability";
import { computeDeposit, getSiteSettings } from "@/lib/settings";
import { stripe, toStripeAmount } from "@/lib/stripe";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const isValidStatus = (v: string | null): v is ReservationStatus =>
    !!v && (Object.values(ReservationStatus) as string[]).includes(v);
  const wantsAll = searchParams.get("all") === "1";

  if (wantsAll) {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const reservations = await prisma.reservation.findMany({
      where: isValidStatus(statusParam) ? { status: statusParam } : {},
      orderBy: { date: "desc" },
      include: {
        room: { select: { name: true, slug: true, images: { take: 1, orderBy: { position: "asc" } } } },
        user: { select: { name: true, email: true } },
        payments: true,
      },
    });
    return NextResponse.json(reservations);
  }

  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const reservations = await prisma.reservation.findMany({
    where: {
      userId: auth.user.id,
      ...(isValidStatus(statusParam) ? { status: statusParam } : {}),
    },
    orderBy: { date: "desc" },
    include: {
      room: { select: { name: true, slug: true, images: { take: 1, orderBy: { position: "asc" } } } },
      payments: true,
    },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { success } = await rateLimit("api", getClientIp(req));
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createReservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { roomId, date: dateStr, startTime, durationMinutes, guestCount, notes } = parsed.data;

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room || !room.isActive) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (guestCount > room.capacity) {
    return NextResponse.json({ error: `This room holds up to ${room.capacity} guests` }, { status: 400 });
  }

  const date = new Date(`${dateStr}T00:00:00`);
  const settings = await getSiteSettings();

  // Cheap pre-check (no DB lock) so we don't create a Stripe PaymentIntent for an obviously bad request.
  const existingForPrecheck = await prisma.reservation.findMany({
    where: { roomId, date, status: { not: "CANCELLED" } },
    select: { startTime: true, endTime: true },
  });
  const precheck = isSlotAvailable({ date, startTime, durationMinutes, room, existingReservations: existingForPrecheck });
  if (!precheck.ok) {
    return NextResponse.json({ error: precheck.reason }, { status: 409 });
  }

  const dayOfWeek = new Date(`${dateStr}T00:00:00`).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
  const ratePerPerson = Number(isWeekend ? room.weekendRatePerPerson : room.weekdayRatePerPerson);
  const totalAmount = ratePerPerson * guestCount * (durationMinutes / 60);
  const depositAmount = computeDeposit(totalAmount, settings);

  // Create the PaymentIntent before writing the reservation: if Stripe fails, nothing
  // is committed to the DB and no slot is held. If the DB transaction fails after this
  // (e.g. a concurrent booking won the race), we cancel the PaymentIntent in the catch below.
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(depositAmount),
      currency: settings.currency,
      automatic_payment_methods: { enabled: true },
      metadata: { type: "deposit", userId: auth.user.id },
    });
  } catch (err) {
    console.error("Stripe paymentIntents.create failed", err);
    return NextResponse.json({ error: "Payment provider is unavailable. Please try again shortly." }, { status: 502 });
  }

  try {
    const reservation = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.reservation.findMany({
          where: { roomId, date, status: { not: "CANCELLED" } },
          select: { startTime: true, endTime: true },
        });

        const result = isSlotAvailable({ date, startTime, durationMinutes, room, existingReservations: existing });
        if (!result.ok) {
          throw new Error(result.reason);
        }

        const created = await tx.reservation.create({
          data: {
            userId: auth.user.id,
            roomId,
            date,
            startTime: result.start,
            endTime: result.end,
            guestCount,
            notes,
            depositAmount,
            totalAmount,
            status: "PENDING",
          },
        });

        await tx.reservationPayment.create({
          data: {
            reservationId: created.id,
            userId: auth.user.id,
            stripePaymentIntentId: paymentIntent.id,
            amount: depositAmount,
            currency: settings.currency,
            status: "PENDING",
          },
        });

        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    await stripe.paymentIntents.update(paymentIntent.id, { metadata: { type: "deposit", reservationId: reservation.id, userId: auth.user.id } });

    return NextResponse.json(
      {
        reservationId: reservation.id,
        clientSecret: paymentIntent.client_secret,
        depositAmount: reservation.depositAmount.toString(),
        totalAmount: reservation.totalAmount.toString(),
      },
      { status: 201 }
    );
  } catch (err) {
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {});

    const message = err instanceof Error ? err.message : "Could not create reservation";
    const isConflict =
      message.includes("just booked") ||
      message.includes("outside business hours") ||
      message.includes("in the past") ||
      (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034");
    return NextResponse.json(
      { error: isConflict ? "This time slot is no longer available. Please pick another." : message },
      { status: isConflict ? 409 : 400 }
    );
  }
}
