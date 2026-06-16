import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { menuItemSchema } from "@/lib/validations/menu";

export async function GET() {
  const items = await prisma.menuItem.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true, type: true } } },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = menuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { imageUrl, ...data } = parsed.data;
  const item = await prisma.menuItem.create({ data: { ...data, imageUrl: imageUrl || null } });
  return NextResponse.json(item, { status: 201 });
}
