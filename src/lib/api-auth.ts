import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "You must be signed in" }, { status: 401 }) } as const;
  }
  return { user: session.user } as const;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "You must be signed in" }, { status: 401 }) } as const;
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) } as const;
  }
  return { user: session.user } as const;
}
