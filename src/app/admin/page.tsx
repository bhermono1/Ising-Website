import type { Metadata } from "next";
import { DollarSign, CalendarCheck, TrendingUp, Percent } from "lucide-react";
import { getAnalytics } from "@/lib/analytics";
import { StatCard } from "@/components/admin/stat-card";
import { DailyRevenueChart, MonthlyRevenueChart } from "@/components/admin/revenue-chart";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Analytics" };
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalytics();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-foreground">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Revenue (6mo)" value={formatCurrency(analytics.totalRevenue)} icon={DollarSign} />
        <StatCard label="Total bookings" value={String(analytics.totalBookings)} icon={CalendarCheck} />
        <StatCard label="Occupancy (30d)" value={`${analytics.occupancyRate}%`} icon={Percent} />
        <StatCard
          label="This month"
          value={formatCurrency(analytics.monthlyRevenue.at(-1)?.amount ?? 0)}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg text-foreground">Daily revenue (14 days)</h2>
          <div className="mt-4">
            <DailyRevenueChart data={analytics.dailyRevenue} />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-lg text-foreground">Monthly revenue (6 months)</h2>
          <div className="mt-4">
            <MonthlyRevenueChart data={analytics.monthlyRevenue} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg text-foreground">Most popular rooms</h2>
          <div className="mt-4 space-y-3">
            {analytics.popularRooms.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
            {analytics.popularRooms.map((room, i) => (
              <div key={room.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-xs text-primary">
                    {i + 1}
                  </span>
                  {room.name}
                </span>
                <span className="text-muted-foreground">
                  {room.bookings} bookings · {formatCurrency(room.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg text-foreground">Most popular menu items</h2>
          <div className="mt-4 space-y-3">
            {analytics.popularMenuItems.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
            {analytics.popularMenuItems.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/15 text-xs text-secondary">
                    {i + 1}
                  </span>
                  {item.name}
                </span>
                <span className="text-muted-foreground">{item.quantity} ordered</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
