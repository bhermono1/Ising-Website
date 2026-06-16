import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderCard } from "@/components/dashboard/order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const session = await auth();
  const userId = session!.user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { menuItem: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">My Orders</h1>
        <Button asChild size="sm">
          <Link href="/menu">Order food</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Order ahead for your next visit." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={{
                id: order.id,
                status: order.status,
                paymentStatus: order.paymentStatus,
                totalAmount: order.totalAmount.toString(),
                createdAt: order.createdAt,
                items: order.items,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
