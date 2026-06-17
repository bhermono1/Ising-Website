import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/hero";
import { AboutSection } from "@/components/home/about-section";
import { FeaturedRooms } from "@/components/home/featured-rooms";
import { FeaturedMenu } from "@/components/home/featured-menu";
import { ReviewsSection } from "@/components/home/reviews-section";
import { CtaSection } from "@/components/home/cta-section";

// Rendered per-request rather than via ISR: this content is admin-editable
// at any time, and ISR's `revalidate` forces Next.js to run this page's
// Prisma queries at *build* time too, which fails the whole build if the
// database isn't reachable from the build environment.
export const dynamic = "force-dynamic";

async function getHomeData() {
  const [rooms, menuItems, reviews, heroImages] = await Promise.all([
    prisma.room.findMany({
      where: { isActive: true },
      orderBy: { capacity: "asc" },
      take: 3,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.menuItem.findMany({
      where: { isFeatured: true, isAvailable: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { isPublished: true },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, room: { select: { name: true } } },
    }),
    prisma.roomImage.findMany({ take: 3, orderBy: { position: "asc" } }),
  ]);

  return { rooms, menuItems, reviews, heroImages };
}

export default async function HomePage() {
  const { rooms, menuItems, reviews, heroImages } = await getHomeData();

  return (
    <>
      <Hero images={heroImages.map((i) => i.url)} />
      <AboutSection />
      <FeaturedRooms
        rooms={rooms.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          capacity: r.capacity,
          weekdayRatePerPerson: r.weekdayRatePerPerson.toString(),
          amenities: r.amenities,
          images: r.images,
        }))}
      />
      <FeaturedMenu
        items={menuItems.map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description,
          price: i.price.toString(),
          imageUrl: i.imageUrl,
          isAvailable: i.isAvailable,
          allergens: i.allergens,
        }))}
      />
      <ReviewsSection reviews={reviews} />
      <CtaSection />
    </>
  );
}
