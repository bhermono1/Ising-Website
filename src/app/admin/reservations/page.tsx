"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, XCircle, LogIn } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { RESERVATION_STATUS_LABELS } from "@/lib/constants";

type AdminReservation = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  status: string;
  depositAmount: string;
  totalAmount: string;
  checkedInAt: string | null;
  room: { name: string };
  user: { name: string | null; email: string };
  payments: { status: string }[];
};

const STATUS_VARIANT: Record<string, "default" | "primary" | "success" | "destructive"> = {
  PENDING: "default",
  CONFIRMED: "primary",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export default function AdminReservationsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["admin-reservations", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "ALL" ? "/api/reservations?all=1" : `/api/reservations?all=1&status=${statusFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load reservations");
      return res.json() as Promise<AdminReservation[]>;
    },
  });

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not update reservation");
      return;
    }
    toast.success(`Reservation ${status.toLowerCase()}`);
    queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
  }

  async function rejectReservation(id: string) {
    if (!confirm("Cancel this reservation? Any deposit paid will be refunded per the cancellation policy.")) return;
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", reason: "Cancelled by venue" }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not cancel reservation");
      return;
    }
    toast.success("Reservation cancelled and refund processed");
    queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
  }

  async function checkIn(id: string) {
    const res = await fetch(`/api/reservations/${id}/checkin`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not check in");
      return;
    }
    toast.success("Checked in");
    queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
  }

  const depositsCollected = (reservations ?? [])
    .flatMap((r) => r.payments)
    .filter((p) => p.status === "SUCCEEDED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-foreground">Reservations</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{depositsCollected} deposits collected on this page</p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {reservations?.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{r.room.name}</p>
                    <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>{RESERVATION_STATUS_LABELS[r.status]}</Badge>
                    {r.checkedInAt && <Badge variant="secondary">Checked in</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.user.name ?? "Guest"} ({r.user.email})
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(r.date)} · {formatTime(r.startTime)}–{formatTime(r.endTime)} · {r.guestCount} guests
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Deposit {formatCurrency(r.depositAmount)} · Est. total {formatCurrency(r.totalAmount)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status === "PENDING" && (
                    <Button size="sm" variant="secondary" onClick={() => updateStatus(r.id, "CONFIRMED")}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  {(r.status === "PENDING" || r.status === "CONFIRMED") && !r.checkedInAt && (
                    <Button size="sm" variant="outline" onClick={() => checkIn(r.id)}>
                      <LogIn className="h-3.5 w-3.5" /> Check in
                    </Button>
                  )}
                  {r.status === "CONFIRMED" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "COMPLETED")}>
                      Mark completed
                    </Button>
                  )}
                  {r.status !== "CANCELLED" && r.status !== "COMPLETED" && (
                    <Button size="sm" variant="destructive" onClick={() => rejectReservation(r.id)}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {reservations?.length === 0 && <p className="text-muted-foreground">No reservations found.</p>}
        </div>
      )}
    </div>
  );
}
