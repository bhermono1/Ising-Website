import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Admin · Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground">Settings</h1>
      <SettingsForm
        initial={{
          depositPercentage: Number(settings.depositPercentage.toString()),
          minDepositAmount: Number(settings.minDepositAmount.toString()),
          freeCancellationWindowHours: settings.freeCancellationWindowHours,
          lateCancellationFeePercent: Number(settings.lateCancellationFeePercent.toString()),
          taxRatePercent: Number(settings.taxRatePercent.toString()),
        }}
      />
    </div>
  );
}
