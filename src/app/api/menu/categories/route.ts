import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { menuCategorySchema } from "@/lib/validations/menu";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.menuCategory.findMany({
    orderBy: [{ type: "asc" }, { position: "asc" }],
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = menuCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.menuCategory.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const category = await prisma.menuCategory.create({ data: { ...parsed.data, slug } });
  return NextResponse.json(category, { status: 201 });
}
