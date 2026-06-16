import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { roomSchema } from "@/lib/validations/room";
import { slugify } from "@/lib/utils";

export async function GET() {
  // Admin-only: returns inactive rooms too. Public pages query Prisma directly server-side.
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" } }, _count: { select: { reservations: true } } },
  });
  return NextResponse.json(rooms);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = roomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { images, ...data } = parsed.data;
  const baseSlug = slugify(data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.room.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const room = await prisma.room.create({
    data: {
      ...data,
      slug,
      images: images?.length ? { create: images } : undefined,
    },
    include: { images: true },
  });

  return NextResponse.json(room, { status: 201 });
}
