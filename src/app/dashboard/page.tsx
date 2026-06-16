import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, ShoppingBag } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReservationCard } from "@/components/dashboard/reservation-card";
import { OrderCard } from "@/components/dashboard/order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [upcoming, recentOrders, totalReservations, totalOrders] = await Promise.all([
    prisma.reservation.findFirst({
      where: { userId, status: { in: ["PENDING", "CONFIRMED"] }, date: { gte: new Date(new Date().toDateString()) } },
      orderBy: { date: "asc" },
      include: { room: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { items: { include: { menuItem: true } } },
    }),
    prisma.reservation.count({ where: { userId } }),
    prisma.order.count({ where: { userId } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-foreground">Welcome back, {session!.user.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s what&apos;s coming up.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Reservations</p>
          <p className="mt-1 font-display text-2xl text-foreground">{totalReservations}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Orders</p>
          <p className="mt-1 font-display text-2xl text-foreground">{totalOrders}</p>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">Next reservation</h2>
          <Link href="/dashboard/reservations" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4">
          {upcoming ? (
            <ReservationCard
              reservation={{
                id: upcoming.id,
                date: upcoming.date,
                startTime: upcoming.startTime,
                endTime: upcoming.endTime,
                guestCount: upcoming.guestCount,
                status: upcoming.status,
                depositAmount: upcoming.depositAmount.toString(),
                room: upcoming.room,
              }}
            />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming reservations"
              description="Lock in your next room before the good slots are gone."
              action={
                <Button asChild>
                  <Link href="/book">Book a room</Link>
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">Recent orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders yet"
              description="Order ahead for your next visit."
              action={
                <Button asChild variant="secondary">
                  <Link href="/menu">Browse menu</Link>
                </Button>
              }
            />
          ) : (
            recentOrders.map((order) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
