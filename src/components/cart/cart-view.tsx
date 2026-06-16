"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { StripePaymentForm } from "@/components/payments/stripe-payment-form";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

type ReservationOption = { id: string; date: string; status: string; room: { name: string } };

export function CartView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const reservationId = useCart((s) => s.reservationId);
  const setReservationId = useCart((s) => s.setReservationId);

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<{ orderId: string; clientSecret: string } | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("reservation");
    if (fromUrl) setReservationId(fromUrl);
  }, [searchParams, setReservationId]);

  const { data: reservations } = useQuery({
    queryKey: ["my-reservations-active"],
    queryFn: async () => {
      const res = await fetch("/api/reservations");
      if (!res.ok) return [];
      return res.json() as Promise<ReservationOption[]>;
    },
    enabled: sessionStatus === "authenticated",
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings/public");
      return res.json() as Promise<{ taxRatePercent: string; currency: string }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const upcoming = (reservations ?? []).filter((r) => r.status === "PENDING" || r.status === "CONFIRMED");

  const taxRate = siteSettings ? Number(siteSettings.taxRatePercent) : 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  async function handleCheckout() {
    if (sessionStatus !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/cart")}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/checkout-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: reservationId ?? undefined,
          notes: notes || undefined,
          items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout");
      setPayment({ orderId: data.orderId, clientSecret: data.clientSecret });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0 && !payment) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Browse the menu and add a few favorites before you arrive."
        action={
          <Button asChild>
            <Link href="/menu">Browse menu</Link>
          </Button>
        }
      />
    );
  }

  if (payment) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="p-6">
          <h2 className="font-display text-xl text-foreground">Pay for your order</h2>
          <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(total)} total</p>
          <div className="mt-6">
            <StripePaymentForm
              clientSecret={payment.clientSecret}
              returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/orders/${payment.orderId}?success=1`}
              label="Pay & Place Order"
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        {items.map((item) => (
          <CartItemRow key={item.menuItemId} item={item} />
        ))}
      </Card>

      <div>
        <Card className="sticky top-24 p-6">
          <h3 className="font-display text-lg text-foreground">Order summary</h3>

          {session?.user && upcoming.length > 0 && (
            <div className="mt-4">
              <Label>Order for reservation (optional)</Label>
              <Select value={reservationId ?? "none"} onValueChange={(v) => setReservationId(v === "none" ? null : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No reservation — order ahead</SelectItem>
                  {upcoming.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.room.name} · {new Date(r.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="mt-4">
            <Label htmlFor="notes">Special instructions</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, spice level, etc." />
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-foreground">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="text-foreground">{formatCurrency(tax)}</dd>
            </div>
            <div className="my-2 h-px bg-border" />
            <div className="flex justify-between font-semibold">
              <dt className="text-foreground">Total</dt>
              <dd className="text-primary">{formatCurrency(total)}</dd>
            </div>
          </dl>

          <Button size="lg" className="mt-6 w-full" disabled={submitting} onClick={handleCheckout}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {session?.user ? "Checkout" : "Sign in to Checkout"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
