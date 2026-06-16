"use client";

import { Minus, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function GuestCounter({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-2.5">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" /> Guests
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors cursor-pointer hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center font-semibold text-foreground">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors cursor-pointer hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
