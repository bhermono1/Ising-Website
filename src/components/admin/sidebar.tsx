"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, DoorOpen, CalendarDays, UtensilsCrossed, ShoppingBag, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Analytics", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            )}
          >
            <link.icon className="h-4 w-4" /> {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
