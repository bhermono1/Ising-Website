"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Clock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuestCounter } from "@/components/booking/guest-counter";
import { TimeSlotGrid } from "@/components/booking/time-slot-grid";
import { StripePaymentForm } from "@/components/payments/stripe-payment-form";
import { formatCurrency, minutesToLabel } from "@/lib/utils";

export type BookableRoom = {
  id: string;
  slug: string;
  name: string;
  capacity: number;
  weekdayRatePerPerson: string;
  weekendRatePerPerson: string;
  minDuration: number;
  maxDuration: number;
};

export type BookingPrefill = {
  slug?: string;
  date?: string;
  duration?: number;
  guestCount?: number;
  slot?: string;
};

function todayStr() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function BookingWizard({ rooms, prefill }: { rooms: BookableRoom[]; prefill?: BookingPrefill }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [roomId, setRoomId] = useState(rooms.find((r) => r.slug === prefill?.slug)?.id ?? rooms[0]?.id ?? "");
  const [date, setDate] = useState(prefill?.date ?? todayStr());
  const room = rooms.find((r) => r.id === roomId);

  const [duration, setDuration] = useState(prefill?.duration ?? room?.minDuration ?? 60);
  const [guestCount, setGuestCount] = useState(prefill?.guestCount ?? 1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(prefill?.slot ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<{ reservationId: string; clientSecret: string; depositAmount: string } | null>(
    null
  );

  // Clamp duration/guests and clear the picked slot when the room changes.
  // Adjusted during render (React's documented pattern for "reset state when
  // a prop changes") rather than in an effect, which would cause an extra
  // render pass after commit.
  const [adjustedForRoomId, setAdjustedForRoomId] = useState(roomId);
  if (room && roomId !== adjustedForRoomId) {
    setAdjustedForRoomId(roomId);
    setDuration((d) => Math.min(Math.max(d, room.minDuration), room.maxDuration));
    setGuestCount((g) => Math.min(g, room.capacity));
    setSelectedSlot(null);
  }

  const durationOptions = useMemo(() => {
    if (!room) return [];
    const options: number[] = [];
    for (let m = room.minDuration; m <= room.maxDuration; m += 30) options.push(m);
    return options;
  }, [room]);

  const { data: availability, isFetching: loadingSlots } = useQuery({
    queryKey: ["availability", roomId, date, duration],
    queryFn: async () => {
      const res = await fetch(`/api/availability?roomId=${roomId}&date=${date}&duration=${duration}`);
      if (!res.ok) throw new Error("Failed to load availability");
      return res.json() as Promise<{ slots: string[] }>;
    },
    enabled: Boolean(roomId && date && duration),
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings/public");
      return res.json() as Promise<{ depositPercentage: string; minDepositAmount: string; currency: string }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const isWeekend = [0, 5, 6].includes(new Date(date + "T00:00:00").getDay());
  const ratePerPerson = room ? Number(isWeekend ? room.weekendRatePerPerson : room.weekdayRatePerPerson) : 0;
  const totalAmount = ratePerPerson * guestCount * (duration / 60);
  const depositAmount = siteSettings
    ? Math.max((totalAmount * Number(siteSettings.depositPercentage)) / 100, Number(siteSettings.minDepositAmount))
    : null;

  async function handleReserve() {
    if (!room || !selectedSlot) return;

    if (sessionStatus !== "authenticated") {
      const params = new URLSearchParams({ room: room.slug, date, duration: String(duration), guests: String(guestCount), slot: selectedSlot });
      router.push(`/login?callbackUrl=${encodeURIComponent(`/book?${params.toString()}`)}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          date,
          startTime: selectedSlot,
          durationMinutes: duration,
          guestCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create reservation");
      setPayment({ reservationId: data.reservationId, clientSecret: data.clientSecret, depositAmount: data.depositAmount });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!room) {
    return <p className="text-center text-muted-foreground">No bookable rooms available right now.</p>;
  }

  if (payment) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="p-6">
          <h2 className="font-display text-xl text-foreground">Pay your deposit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(payment.depositAmount)} due now to confirm {room.name} on {date}.
          </p>
          <div className="mt-6">
            <StripePaymentForm
              clientSecret={payment.clientSecret}
              returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/reservations/${payment.reservationId}?success=1`}
              label="Pay Deposit & Confirm"
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="p-6">
          <Label>Room</Label>
          <Select value={roomId} onValueChange={setRoomId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name} · up to {r.capacity} guests · from {formatCurrency(r.weekdayRatePerPerson)}/person
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="date">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> Date
                </span>
              </Label>
              <Input
                id="date"
                type="date"
                min={todayStr()}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot(null);
                }}
              />
            </div>
            <div>
              <Label>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Duration
                </span>
              </Label>
              <Select
                value={String(duration)}
                onValueChange={(v) => {
                  setDuration(Number(v));
                  setSelectedSlot(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {minutesToLabel(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5">
            <GuestCounter value={guestCount} max={room.capacity} onChange={setGuestCount} />
          </div>
        </Card>

        <Card className="p-6">
          <Label>Available start times</Label>
          <p className="mb-4 text-xs text-muted-foreground">All times shown are local to the lounge.</p>
          <TimeSlotGrid
            slots={availability?.slots ?? []}
            selected={selectedSlot}
            onSelect={setSelectedSlot}
            loading={loadingSlots}
          />
        </Card>
      </div>

      <div>
        <Card className="sticky top-24 p-6">
          <h3 className="font-display text-lg text-foreground">Booking summary</h3>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Room</dt>
              <dd className="text-foreground">{room.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date</dt>
              <dd className="text-foreground">{date}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="text-foreground">{minutesToLabel(duration)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Guests</dt>
              <dd className="text-foreground">{guestCount}</dd>
            </div>
            <div className="my-3 h-px bg-border" />
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Estimated total</dt>
              <dd className="text-foreground">{formatCurrency(totalAmount)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt className="text-foreground">Deposit due now</dt>
              <dd className="text-primary">{depositAmount !== null ? formatCurrency(depositAmount) : "—"}</dd>
            </div>
          </dl>

          <Button
            size="lg"
            className="mt-6 w-full"
            disabled={!selectedSlot || submitting}
            onClick={handleReserve}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {session?.user ? "Reserve & Pay Deposit" : "Sign in to Reserve"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            The remaining balance is settled at the venue. Free cancellation applies up to the policy window.
          </p>
        </Card>
      </div>
    </div>
  );
}
