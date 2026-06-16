import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-surface via-surface to-violet/20 px-8 py-16 text-center sm:px-16">
        <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/30 blur-[100px]" />
        <h2 className="relative font-display text-3xl text-foreground sm:text-4xl">Ready to take the mic?</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
          Lock in your room with a quick deposit and we&apos;ll have it warmed up and ready when you arrive.
        </p>
        <div className="relative mt-8 flex justify-center">
          <Button size="lg" asChild>
            <Link href="/book">
              <CalendarCheck className="h-4 w-4" /> Book Your Room
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
