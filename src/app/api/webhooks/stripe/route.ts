import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, fromStripeAmount } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { reservationConfirmationEmail, orderConfirmationEmail } from "@/lib/email-templates";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook signature or secret" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
  const type = intent.metadata?.type;

  if (type === "deposit") {
    const payment = await prisma.reservationPayment.findUnique({
      where: { stripePaymentIntentId: intent.id },
      include: { reservation: { include: { room: true, user: true } } },
    });
    if (!payment || payment.status === "SUCCEEDED") return;

    await prisma.$transaction([
      prisma.reservationPayment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED" } }),
      prisma.reservation.update({ where: { id: payment.reservationId }, data: { status: "CONFIRMED" } }),
    ]);

    const { reservation } = payment;
    await sendEmail({
      to: reservation.user.email,
      subject: "Your karaoke room is booked!",
      html: reservationConfirmationEmail({
        customerName: reservation.user.name ?? "there",
        roomName: reservation.room.name,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        guestCount: reservation.guestCount,
        depositAmount: fromStripeAmount(intent.amount_received || intent.amount),
        totalAmount: Number(reservation.totalAmount.toString()),
        reservationId: reservation.id,
      }),
    });
    return;
  }

  if (type === "order") {
    const order = await prisma.order.findUnique({
      where: { stripePaymentIntentId: intent.id },
      include: { items: { include: { menuItem: true } }, user: true },
    });
    if (!order || order.paymentStatus === "PAID") return;

    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });

    await sendEmail({
      to: order.user.email,
      subject: "Order confirmed",
      html: orderConfirmationEmail({
        customerName: order.user.name ?? "there",
        orderId: order.id,
        items: order.items.map((i) => ({
          name: i.menuItem.name,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice.toString()),
        })),
        totalAmount: Number(order.totalAmount.toString()),
      }),
    });
  }
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  const type = intent.metadata?.type;

  if (type === "deposit") {
    await prisma.reservationPayment.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data: { status: "FAILED" },
    });
  }

  if (type === "order") {
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data: { paymentStatus: "UNPAID" },
    });
  }
}
