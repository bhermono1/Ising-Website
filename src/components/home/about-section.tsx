import { Mic2, UtensilsCrossed, PartyPopper } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

const PILLARS = [
  {
    icon: Mic2,
    title: "Five Themed Rooms",
    description: "From intimate two-tops to a 24-person penthouse stage — every room has its own personality.",
  },
  {
    icon: UtensilsCrossed,
    title: "Full Lounge Kitchen & Bar",
    description: "Shareable plates, signature cocktails, and zero-proof options — order ahead or from your room.",
  },
  {
    icon: PartyPopper,
    title: "Built for Celebrations",
    description: "Birthdays, bachelorettes, team nights — confetti rigs, VIP service, and a song catalog that never quits.",
  },
];

export function AboutSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">About {BUSINESS.shortName}</span>
        <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">
          Where every song gets the spotlight it deserves
        </h2>
        <p className="mt-4 text-muted-foreground">
          {BUSINESS.name} brings the energy of a sold-out show to a room that&apos;s just for you. Premium sound,
          mood lighting, and a kitchen that keeps up with the encore.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-border bg-surface/60 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <p.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg text-foreground">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
