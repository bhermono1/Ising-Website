import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { orderStatusSchema } from "@/lib/validations/order";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "You must be signed in" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { menuItem: true } }, reservation: { include: { room: true } } },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminAuth = await requireAdmin();
  if ("error" in adminAuth) return adminAuth.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
  return NextResponse.json(updated);
}
