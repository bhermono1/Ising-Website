import Link from "next/link";
import { AtSign, MapPin, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40 print:hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-neon text-xl text-primary">{BUSINESS.shortName}</span>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{BUSINESS.tagline}</p>
            <a
              href={BUSINESS.instagram}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <AtSign className="h-4 w-4" /> Follow us
            </a>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-wide text-foreground">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/rooms" className="hover:text-primary">Rooms</Link></li>
              <li><Link href="/menu" className="hover:text-primary">Menu</Link></li>
              <li><Link href="/book" className="hover:text-primary">Book a Room</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary">My Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-wide text-foreground">Visit</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {BUSINESS.address}
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" /> {BUSINESS.phone}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-wide text-foreground">Hours</h4>
            <p className="mt-4 text-sm text-muted-foreground">{BUSINESS.hours}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-primary">Privacy</Link>
            <Link href="/" className="hover:text-primary">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
