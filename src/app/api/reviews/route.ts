import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createReviewSchema } from "@/lib/validations/review";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  const reviews = await prisma.review.findMany({
    where: { isPublished: true, ...(roomId ? { roomId } : {}) },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } }, room: { select: { name: true } } },
  });

  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { success } = await rateLimit("api", getClientIp(req));
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { roomId, rating, comment } = parsed.data;

  if (roomId) {
    const hasCompletedStay = await prisma.reservation.findFirst({
      where: { userId: auth.user.id, roomId, status: "COMPLETED" },
    });
    if (!hasCompletedStay) {
      return NextResponse.json({ error: "You can only review rooms you've completed a reservation in" }, { status: 403 });
    }

    const existing = await prisma.review.findFirst({ where: { userId: auth.user.id, roomId } });
    if (existing) {
      return NextResponse.json({ error: "You've already reviewed this room" }, { status: 409 });
    }
  }

  const review = await prisma.review.create({
    data: { userId: auth.user.id, roomId, rating, comment },
  });

  return NextResponse.json(review, { status: 201 });
}
