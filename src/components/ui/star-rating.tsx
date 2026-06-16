"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = 16,
  className,
  onChange,
}: {
  rating: number;
  size?: number;
  className?: string;
  onChange?: (value: number) => void;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars.map((value) => (
        <button
          key={value}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(value)}
          className={cn(!onChange && "cursor-default", onChange && "cursor-pointer")}
        >
          <Star
            size={size}
            className={value <= rating ? "fill-accent text-accent" : "fill-transparent text-muted-foreground"}
          />
        </button>
      ))}
    </div>
  );
}
