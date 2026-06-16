"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function RoomGallery({ images, name }: { images: { url: string; alt: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-border bg-surface-2 sm:h-96 lg:h-[28rem]">
        {current && (
          <Image src={current.url} alt={current.alt || name} fill sizes="800px" className="object-cover" priority />
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 overflow-hidden rounded-xl border-2 transition-colors cursor-pointer sm:h-20",
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image src={img.url} alt={img.alt || name} fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
