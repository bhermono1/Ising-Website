import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getAnalytics } from "@/lib/analytics";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const analytics = await getAnalytics();
  return NextResponse.json(analytics);
}
