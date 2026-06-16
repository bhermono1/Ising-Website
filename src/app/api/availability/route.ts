import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const dateParam = searchParams.get("date");
  const duration = Number(searchParams.get("duration"));

  if (!roomId || !dateParam || !duration) {
    return NextResponse.json({ error: "roomId, date, and duration are required" }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: "date must be in YYYY-MM-DD format" }, { status: 400 });
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room || !room.isActive) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (duration < room.minDuration || duration > room.maxDuration) {
    return NextResponse.json(
      { error: `Duration must be between ${room.minDuration} and ${room.maxDuration} minutes`, slots: [] },
      { status: 200 }
    );
  }

  const date = new Date(`${dateParam}T00:00:00`);

  const dayReservations = await prisma.reservation.findMany({
    where: {
      roomId,
      date,
      status: { not: "CANCELLED" },
    },
    select: { startTime: true, endTime: true },
  });

  const slots = getAvailableSlots({
    date,
    durationMinutes: duration,
    room,
    existingReservations: dayReservations,
  });

  return NextResponse.json({
    slots,
    room: {
      minDuration: room.minDuration,
      maxDuration: room.maxDuration,
      openTime: room.openTime,
      closeTime: room.closeTime,
      capacity: room.capacity,
      pricePerHour: room.pricePerHour.toString(),
    },
  });
}
