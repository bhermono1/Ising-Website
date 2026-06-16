import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reservation.status === "CANCELLED") {
    return NextResponse.json({ error: "Cannot check in a cancelled reservation" }, { status: 400 });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { checkedInAt: new Date(), status: "CONFIRMED" },
  });

  return NextResponse.json(updated);
}
