import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({
    depositPercentage: settings.depositPercentage.toString(),
    minDepositAmount: settings.minDepositAmount.toString(),
    freeCancellationWindowHours: settings.freeCancellationWindowHours,
    lateCancellationFeePercent: settings.lateCancellationFeePercent.toString(),
    currency: settings.currency,
  });
}
