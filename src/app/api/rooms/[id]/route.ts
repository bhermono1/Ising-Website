import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { roomUpdateSchema } from "@/lib/validations/room";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Admin-only: may return inactive rooms. Public room pages fetch by slug
  // via Prisma directly in the Server Component instead of this route.
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const room = await prisma.room.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(room);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = roomUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { images, ...data } = parsed.data;

  const room = await prisma.room.update({
    where: { id },
    data: {
      ...data,
      ...(images
        ? {
            images: {
              deleteMany: {},
              create: images,
            },
          }
        : {}),
    },
    include: { images: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(room);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;

  const activeReservations = await prisma.reservation.count({
    where: { roomId: id, status: { in: ["PENDING", "CONFIRMED"] } },
  });
  if (activeReservations > 0) {
    return NextResponse.json(
      { error: "This room has active reservations. Deactivate it instead of deleting." },
      { status: 409 }
    );
  }

  await prisma.room.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
