import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

const STATUS_VARIANT: Record<string, "default" | "primary" | "secondary" | "success" | "destructive"> = {
  PENDING: "default",
  PREPARING: "primary",
  READY: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export type OrderCardData = {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: string | number;
  createdAt: Date | string;
  items: { quantity: number; menuItem: { name: string } }[];
};

export function OrderCard({ order }: { order: OrderCardData }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/dashboard/orders/${order.id}`} className="font-display text-lg text-foreground hover:text-primary">
            Order #{order.id.slice(-6).toUpperCase()}
          </Link>
          <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {order.items.map((i) => `${i.quantity}× ${i.menuItem.name}`).join(", ")}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{order.paymentStatus}</span>
        <span className="font-semibold text-foreground">{formatCurrency(order.totalAmount)}</span>
      </div>
    </Card>
  );
}
