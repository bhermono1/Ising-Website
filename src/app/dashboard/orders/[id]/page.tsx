import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentStatusPoller } from "@/components/dashboard/payment-status-poller";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const { success } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { menuItem: true } }, reservation: { include: { room: true } } },
  });

  if (!order) notFound();
  if (order.userId !== session!.user.id && session!.user.role !== "ADMIN") redirect("/dashboard/orders");

  return (
    <div>
      <Link href="/dashboard/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
      </Link>

      <PaymentStatusPoller pending={Boolean(success) && order.paymentStatus === "UNPAID"} endpoint={`/api/orders/${id}`} />

      <Card className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-foreground">Order #{order.id.slice(-6).toUpperCase()}</h1>
            <p className="mt-1 text-muted-foreground">{formatDate(order.createdAt)}</p>
            {order.reservation && (
              <p className="mt-1 text-sm text-muted-foreground">For: {order.reservation.room.name}</p>
            )}
          </div>
          <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "destructive" : "primary"}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>

        <div className="mt-6 divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-foreground">{item.quantity}× {item.menuItem.name}</p>
                {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
              </div>
              <p className="text-foreground">{formatCurrency(Number(item.unitPrice.toString()) * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm uppercase tracking-wide text-muted-foreground">{order.paymentStatus}</span>
          <span className="font-display text-xl text-foreground">{formatCurrency(order.totalAmount)}</span>
        </div>

        <div className="mt-6">
          <Button asChild variant="secondary" size="sm">
            <Link href={`/dashboard/orders/${order.id}/receipt`}>
              <Receipt className="h-3.5 w-3.5" /> View receipt
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
