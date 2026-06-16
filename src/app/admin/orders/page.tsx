"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/constants";

type AdminOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  createdAt: string;
  user: { name: string | null; email: string };
  items: { quantity: number; menuItem: { name: string } }[];
};

const STATUS_VARIANT: Record<string, "default" | "primary" | "secondary" | "success" | "destructive"> = {
  PENDING: "default",
  PREPARING: "primary",
  READY: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "ALL" ? "/api/orders?all=1" : `/api/orders?all=1&status=${statusFilter}`;
      const res = await fetch(url);
      return res.json() as Promise<AdminOrder[]>;
    },
  });

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not update order");
      return;
    }
    toast.success(`Order marked ${ORDER_STATUS_LABELS[status].toLowerCase()}`);
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  const revenue = (orders ?? [])
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-foreground">Orders</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {Object.keys(ORDER_STATUS_LABELS).map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">Revenue on this page: {formatCurrency(revenue)}</p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {orders?.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">#{order.id.slice(-6).toUpperCase()}</p>
                    <Badge variant={STATUS_VARIANT[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                    <Badge variant="outline">{order.paymentStatus}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.user.name ?? "Guest"} ({order.user.email}) · {formatDate(order.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.items.map((i) => `${i.quantity}× ${i.menuItem.name}`).join(", ")}
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{formatCurrency(order.totalAmount)}</p>
                </div>
                <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...ORDER_STATUS_FLOW, "CANCELLED"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {ORDER_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          ))}
          {orders?.length === 0 && <p className="text-muted-foreground">No orders found.</p>}
        </div>
      )}
    </div>
  );
}
