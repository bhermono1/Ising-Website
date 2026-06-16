import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/api-auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wantsAll = searchParams.get("all") === "1";

  if (wantsAll) {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const statusParam = searchParams.get("status");
    const isValidStatus = (v: string | null): v is OrderStatus =>
      !!v && (Object.values(OrderStatus) as string[]).includes(v);

    const orders = await prisma.order.findMany({
      where: isValidStatus(statusParam) ? { status: statusParam } : {},
      orderBy: { createdAt: "desc" },
      include: { items: { include: { menuItem: true } }, user: { select: { name: true, email: true } } },
    });
    return NextResponse.json(orders);
  }

  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const orders = await prisma.order.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { menuItem: true } } },
  });
  return NextResponse.json(orders);
}
