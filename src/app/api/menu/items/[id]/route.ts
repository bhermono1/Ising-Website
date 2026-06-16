import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { menuItemUpdateSchema } from "@/lib/validations/menu";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = menuItemUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { imageUrl, ...data } = parsed.data;
  const item = await prisma.menuItem.update({
    where: { id },
    data: { ...data, ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}) },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  try {
    await prisma.menuItem.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "This item has existing orders and cannot be deleted. Mark it unavailable instead." },
      { status: 409 }
    );
  }
  return NextResponse.json({ success: true });
}
