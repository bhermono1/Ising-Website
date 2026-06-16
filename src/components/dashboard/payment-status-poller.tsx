"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * The reservation/order is authoritatively confirmed by the Stripe webhook.
 * Right after a successful client-side payment confirmation we may land here
 * before the webhook has been processed, so we briefly poll and refresh the
 * server-rendered page once the status flips.
 */
export function PaymentStatusPoller({ pending, endpoint }: { pending: boolean; endpoint: string }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const stopped = useRef(false);

  useEffect(() => {
    if (!pending || stopped.current || attempts >= 8) return;

    const timeout = setTimeout(async () => {
      const res = await fetch(endpoint, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const status = data.status ?? data.paymentStatus;
        if (status && status !== "PENDING" && status !== "UNPAID") {
          stopped.current = true;
          router.refresh();
          return;
        }
      }
      setAttempts((a) => a + 1);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [pending, attempts, endpoint, router]);

  if (!pending || attempts >= 8) return null;

  return (
    <div className="mb-6 flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
      <Loader2 className="h-4 w-4 animate-spin" /> Confirming your payment...
    </div>
  );
}
