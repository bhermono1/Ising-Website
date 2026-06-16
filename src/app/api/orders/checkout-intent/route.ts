import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createOrderSchema } from "@/lib/validations/order";
import { getSiteSettings } from "@/lib/settings";
import { stripe, toStripeAmount } from "@/lib/stripe";

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { success } = await rateLimit("payment", getClientIp(req));
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { items, reservationId, notes } = parsed.data;

  if (reservationId) {
    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation || reservation.userId !== auth.user.id) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.menuItemId) } },
  });

  const lineItems: { menuItem: (typeof menuItems)[number]; quantity: number; notes?: string }[] = [];
  for (const item of items) {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
    if (!menuItem) {
      return NextResponse.json({ error: "One of the items in your cart is no longer on the menu" }, { status: 400 });
    }
    if (!menuItem.isAvailable) {
      return NextResponse.json({ error: `${menuItem.name} is currently unavailable` }, { status: 400 });
    }
    lineItems.push({ menuItem, quantity: item.quantity, notes: item.notes });
  }

  const settings = await getSiteSettings();
  const subtotal = lineItems.reduce((sum, li) => sum + Number(li.menuItem.price.toString()) * li.quantity, 0);
  const tax = subtotal * (Number(settings.taxRatePercent.toString()) / 100);
  const totalAmount = Math.round((subtotal + tax) * 100) / 100;

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(totalAmount),
      currency: settings.currency,
      automatic_payment_methods: { enabled: true },
      metadata: { type: "order", userId: auth.user.id },
    });
  } catch (err) {
    console.error("Stripe paymentIntents.create failed", err);
    return NextResponse.json({ error: "Payment provider is unavailable. Please try again shortly." }, { status: 502 });
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId: auth.user.id,
        reservationId,
        notes,
        totalAmount,
        stripePaymentIntentId: paymentIntent.id,
        status: "PENDING",
        paymentStatus: "UNPAID",
        items: {
          create: lineItems.map((li) => ({
            menuItemId: li.menuItem.id,
            quantity: li.quantity,
            unitPrice: li.menuItem.price,
            notes: li.notes,
          })),
        },
      },
    });

    await stripe.paymentIntents.update(paymentIntent.id, { metadata: { type: "order", orderId: order.id, userId: auth.user.id } });

    return NextResponse.json(
      { orderId: order.id, clientSecret: paymentIntent.client_secret, totalAmount: totalAmount.toString() },
      { status: 201 }
    );
  } catch (err) {
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {});
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not create order" }, { status: 400 });
  }
}
