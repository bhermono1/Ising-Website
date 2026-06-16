import { TIME_SLOT_INTERVAL_MINUTES } from "@/lib/constants";
import { timeStringToDate } from "@/lib/utils";

export type ExistingBlock = { startTime: Date; endTime: Date };

type RoomWindow = {
  openTime: string;
  closeTime: string;
  minDuration: number;
  maxDuration: number;
};

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Returns every "HH:mm" start time on `date` where a booking of
 * `durationMinutes` would fit inside the room's opening hours without
 * overlapping an existing (non-cancelled) reservation.
 */
export function getAvailableSlots({
  date,
  durationMinutes,
  room,
  existingReservations,
  now = new Date(),
}: {
  date: Date;
  durationMinutes: number;
  room: RoomWindow;
  existingReservations: ExistingBlock[];
  now?: Date;
}): string[] {
  const open = timeStringToDate(date, room.openTime);
  const close = timeStringToDate(date, room.closeTime);

  const slots: string[] = [];
  for (
    let cursor = new Date(open);
    cursor.getTime() + durationMinutes * 60_000 <= close.getTime();
    cursor = new Date(cursor.getTime() + TIME_SLOT_INTERVAL_MINUTES * 60_000)
  ) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);

    if (slotStart < now) continue;

    const conflict = existingReservations.some((r) =>
      overlaps(slotStart, slotEnd, r.startTime, r.endTime)
    );
    if (conflict) continue;

    const hh = String(slotStart.getHours()).padStart(2, "0");
    const mm = String(slotStart.getMinutes()).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }

  return slots;
}

/** Server-side re-validation performed right before creating a reservation. */
export function isSlotAvailable({
  date,
  startTime,
  durationMinutes,
  room,
  existingReservations,
}: {
  date: Date;
  startTime: string;
  durationMinutes: number;
  room: RoomWindow;
  existingReservations: ExistingBlock[];
}): { ok: true; start: Date; end: Date } | { ok: false; reason: string } {
  if (durationMinutes < room.minDuration || durationMinutes > room.maxDuration) {
    return { ok: false, reason: `Duration must be between ${room.minDuration} and ${room.maxDuration} minutes` };
  }

  const open = timeStringToDate(date, room.openTime);
  const close = timeStringToDate(date, room.closeTime);
  const start = timeStringToDate(date, startTime);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  if (start < open || end > close) {
    return { ok: false, reason: "Selected time is outside business hours" };
  }

  if (start < new Date()) {
    return { ok: false, reason: "Selected time is in the past" };
  }

  const conflict = existingReservations.some((r) => overlaps(start, end, r.startTime, r.endTime));
  if (conflict) {
    return { ok: false, reason: "This time slot was just booked. Please pick another." };
  }

  return { ok: true, start, end };
}
