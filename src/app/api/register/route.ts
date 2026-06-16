import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";

export async function POST(req: Request) {
  const { success } = await rateLimit("auth", getClientIp(req));
  if (!success) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash },
    select: { id: true, name: true, email: true },
  });

  // Awaited (not fire-and-forget): serverless runtimes can terminate the
  // function as soon as the response is sent, killing un-awaited promises.
  await sendEmail({
    to: user.email,
    subject: "Welcome to Crescendo Karaoke Lounge",
    html: welcomeEmail({ customerName: user.name ?? "there" }),
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
}
