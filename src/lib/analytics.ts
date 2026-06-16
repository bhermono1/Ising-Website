import { prisma } from "@/lib/prisma";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}
function monthKey(d: Date) {
  return d.toISOString().slice(0, 7);
}

export async function getAnalytics() {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [deposits, paidOrders, totalBookings, rooms, reservationsInWindow, popularItemsRaw, occupancyReservations] =
    await Promise.all([
      prisma.reservationPayment.findMany({
        where: { status: "SUCCEEDED", createdAt: { gte: sixMonthsAgo } },
        select: { amount: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: { paymentStatus: "PAID", createdAt: { gte: sixMonthsAgo } },
        select: { totalAmount: true, createdAt: true },
      }),
      prisma.reservation.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.room.findMany({ where: { isActive: true }, select: { id: true, openTime: true, closeTime: true } }),
      prisma.reservation.findMany({
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
        select: { roomId: true, totalAmount: true, room: { select: { name: true } } },
      }),
      prisma.orderItem.groupBy({
        by: ["menuItemId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.reservation.findMany({
        where: { status: { in: ["CONFIRMED", "COMPLETED"] }, date: { gte: thirtyDaysAgo } },
        select: { startTime: true, endTime: true },
      }),
    ]);

  // --- Revenue buckets ---
  const dailyMap = new Map<string, number>();
  const monthlyMap = new Map<string, number>();

  for (const p of deposits) {
    const amt = Number(p.amount.toString());
    dailyMap.set(dayKey(p.createdAt), (dailyMap.get(dayKey(p.createdAt)) ?? 0) + amt);
    monthlyMap.set(monthKey(p.createdAt), (monthlyMap.get(monthKey(p.createdAt)) ?? 0) + amt);
  }
  for (const o of paidOrders) {
    const amt = Number(o.totalAmount.toString());
    dailyMap.set(dayKey(o.createdAt), (dailyMap.get(dayKey(o.createdAt)) ?? 0) + amt);
    monthlyMap.set(monthKey(o.createdAt), (monthlyMap.get(monthKey(o.createdAt)) ?? 0) + amt);
  }

  const dailyRevenue = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    const key = dayKey(d);
    return { date: key, amount: Math.round((dailyMap.get(key) ?? 0) * 100) / 100 };
  });

  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    const key = monthKey(d);
    return { month: key, amount: Math.round((monthlyMap.get(key) ?? 0) * 100) / 100 };
  });

  const totalRevenue = Math.round([...dailyMap.values()].reduce((a, b) => a + b, 0) * 100) / 100;

  // --- Popular rooms ---
  const roomStats = new Map<string, { name: string; bookings: number; revenue: number }>();
  for (const r of reservationsInWindow) {
    const entry = roomStats.get(r.roomId) ?? { name: r.room.name, bookings: 0, revenue: 0 };
    entry.bookings += 1;
    entry.revenue += Number(r.totalAmount.toString());
    roomStats.set(r.roomId, entry);
  }
  const popularRooms = Array.from(roomStats.values())
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5)
    .map((r) => ({ ...r, revenue: Math.round(r.revenue * 100) / 100 }));

  // --- Popular menu items ---
  const menuItemIds = popularItemsRaw.map((p) => p.menuItemId);
  const menuItems = await prisma.menuItem.findMany({ where: { id: { in: menuItemIds } }, select: { id: true, name: true } });
  const popularMenuItems = popularItemsRaw.map((p) => ({
    name: menuItems.find((m) => m.id === p.menuItemId)?.name ?? "Unknown",
    quantity: p._sum.quantity ?? 0,
  }));

  // --- Occupancy rate (last 30 days) ---
  const bookedMinutes = occupancyReservations.reduce(
    (sum, r) => sum + (r.endTime.getTime() - r.startTime.getTime()) / 60000,
    0
  );
  const minutesPerRoomPerDay = rooms.reduce((sum, room) => {
    const [oh, om] = room.openTime.split(":").map(Number);
    const [ch, cm] = room.closeTime.split(":").map(Number);
    return sum + (ch * 60 + cm - (oh * 60 + om));
  }, 0);
  const availableMinutes = minutesPerRoomPerDay * 30;
  const occupancyRate = availableMinutes > 0 ? Math.round((bookedMinutes / availableMinutes) * 1000) / 10 : 0;

  return {
    totalRevenue,
    totalBookings,
    dailyRevenue,
    monthlyRevenue,
    popularRooms,
    popularMenuItems,
    occupancyRate,
  };
}

export type Analytics = Awaited<ReturnType<typeof getAnalytics>>;
