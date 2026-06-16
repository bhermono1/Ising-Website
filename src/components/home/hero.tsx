import Image from "next/image";
import Link from "next/link";
import { Mic2, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";

export function Hero({ images }: { images: string[] }) {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary/25 blur-[100px]" />
      <div className="absolute -right-32 top-40 h-72 w-72 rounded-full bg-secondary/20 blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28 lg:px-8">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Mic2 className="h-3.5 w-3.5" /> Private Karaoke Lounge
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
            Your night, <span className="text-neon-pink">your stage</span>, your room.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">{BUSINESS.tagline}</p>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Five themed private rooms, a full lounge menu, and sound systems built for big moments. Book in
            under two minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/book">
                <CalendarCheck className="h-4 w-4" /> Book a Room
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/menu">View Menu</Link>
            </Button>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-4 animate-fade-up [animation-delay:150ms]">
          <div className="relative col-span-2 h-56 overflow-hidden rounded-3xl border border-border shadow-[0_0_40px_rgba(255,45,120,0.15)] sm:h-64">
            {images[0] && <Image src={images[0]} alt="Karaoke room" fill sizes="600px" className="object-cover" priority />}
          </div>
          <div className="relative h-40 overflow-hidden rounded-3xl border border-border sm:h-48">
            {images[1] && <Image src={images[1]} alt="Karaoke room" fill sizes="300px" className="object-cover" />}
          </div>
          <div className="relative h-40 overflow-hidden rounded-3xl border border-border sm:h-48">
            {images[2] && <Image src={images[2]} alt="Karaoke room" fill sizes="300px" className="object-cover" />}
          </div>
        </div>
      </div>
    </section>
  );
}
