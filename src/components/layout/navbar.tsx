"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, LayoutDashboard, ShieldCheck, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUSINESS } from "@/lib/constants";
import { ISingLogo } from "@/components/layout/logo";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { href: "/rooms", label: "Rooms" },
  { href: "/menu", label: "Menu" },
  { href: "/book", label: "Book Now" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const itemCount = useCart((s) => s.itemCount());
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
    : "U";

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8e0d0] bg-[#faf7f2] print:hidden">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <ISingLogo className="h-16" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-[#4a4060] transition-colors hover:text-primary",
                pathname === link.href && "text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingBag className="h-4.5 w-4.5" />
            </Button>
            {mounted && itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer rounded-full ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <Avatar>
                    <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                {session.user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <ShieldCheck className="h-4 w-4" /> Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Join</Link>
              </Button>
            </div>
          )}

          <button
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-[#4a4060] md:hidden cursor-pointer"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-[#e8e0d0] bg-[#faf7f2] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#4a4060] hover:bg-[#f0e8dc]"
              >
                {link.label}
              </Link>
            ))}
            {!session?.user && (
              <div className="mt-2 flex gap-2">
                <Button variant="secondary" className="flex-1" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>Join</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
