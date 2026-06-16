import Link from "next/link";
import Image from "next/image";
import { Users, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { RESERVATION_STATUS_LABELS } from "@/lib/constants";

const STATUS_VARIANT: Record<string, "default" | "primary" | "success" | "destructive"> = {
  PENDING: "default",
  CONFIRMED: "primary",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export type ReservationCardData = {
  id: string;
  date: Date | string;
  startTime: Date | string;
  endTime: Date | string;
  guestCount: number;
  status: string;
  depositAmount: string | number;
  room: { name: string; slug: string; images: { url: string; alt: string }[] };
};

export function ReservationCard({ reservation }: { reservation: ReservationCardData }) {
  const cover = reservation.room.images[0]?.url;

  return (
    <Card className="flex gap-4 overflow-hidden p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:h-24 sm:w-24">
        {cover && <Image src={cover} alt={reservation.room.name} fill sizes="96px" className="object-cover" />}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/dashboard/reservations/${reservation.id}`} className="font-display text-lg text-foreground hover:text-primary">
            {reservation.room.name}
          </Link>
          <Badge variant={STATUS_VARIANT[reservation.status] ?? "default"}>
            {RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{formatDate(reservation.date)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {formatTime(reservation.startTime)}–{formatTime(reservation.endTime)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {reservation.guestCount}
          </span>
          <span>Deposit: {formatCurrency(reservation.depositAmount)}</span>
        </div>
      </div>
    </Card>
  );
}
