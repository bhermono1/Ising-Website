"use client";

import { CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";

function to12Hour(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function TimeSlotGrid({
  slots,
  selected,
  onSelect,
  loading,
}: {
  slots: string[];
  selected: string | null;
  onSelect: (slot: string) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-xl bg-surface-2" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
        <CalendarX className="h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No openings for this date & duration. Try another day.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelect(slot)}
          className={cn(
            "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
            selected === slot
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:border-secondary hover:text-secondary"
          )}
        >
          {to12Hour(slot)}
        </button>
      ))}
    </div>
  );
}
