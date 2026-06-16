"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type SettingsValues = {
  depositPercentage: number;
  minDepositAmount: number;
  freeCancellationWindowHours: number;
  lateCancellationFeePercent: number;
  taxRatePercent: number;
};

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [values, setValues] = useState(initial);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, currency: "usd" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save settings");
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h2 className="font-display text-lg text-foreground">Deposit rules</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="depositPercentage">Deposit (% of booking total)</Label>
            <Input
              id="depositPercentage"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={values.depositPercentage}
              onChange={(e) => set("depositPercentage", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="minDepositAmount">Minimum deposit ($)</Label>
            <Input
              id="minDepositAmount"
              type="number"
              min={0}
              step="0.01"
              value={values.minDepositAmount}
              onChange={(e) => set("minDepositAmount", Number(e.target.value))}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg text-foreground">Cancellation policy</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="freeCancellationWindowHours">Free cancellation window (hours before)</Label>
            <Input
              id="freeCancellationWindowHours"
              type="number"
              min={0}
              value={values.freeCancellationWindowHours}
              onChange={(e) => set("freeCancellationWindowHours", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="lateCancellationFeePercent">Late cancellation fee (% of deposit kept)</Label>
            <Input
              id="lateCancellationFeePercent"
              type="number"
              min={0}
              max={100}
              value={values.lateCancellationFeePercent}
              onChange={(e) => set("lateCancellationFeePercent", Number(e.target.value))}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg text-foreground">Tax</h2>
        <div className="mt-4">
          <Label htmlFor="taxRatePercent">Food & drink tax rate (%)</Label>
          <Input
            id="taxRatePercent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={values.taxRatePercent}
            onChange={(e) => set("taxRatePercent", Number(e.target.value))}
          />
        </div>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Save settings
      </Button>
    </form>
  );
}
