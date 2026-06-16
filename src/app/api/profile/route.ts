import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { updateProfileSchema } from "@/lib/validations/auth";

export async function PATCH(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: auth.user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json(updated);
}
