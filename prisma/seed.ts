import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const pic = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      depositPercentage: 25,
      minDepositAmount: 20,
      freeCancellationWindowHours: 24,
      lateCancellationFeePercent: 50,
      taxRatePercent: 8.5,
      currency: "usd",
    },
  });

  const adminPassword = await bcrypt.hash("Admin1234!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@crescendokaraoke.com" },
    update: {},
    create: {
      name: "Avery Reyes",
      email: "admin@crescendokaraoke.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      admin: { create: { level: "SUPER_ADMIN" } },
    },
  });

  const customerPassword = await bcrypt.hash("Customer1234!", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Jordan Lee",
      email: "customer@example.com",
      phone: "+1 (555) 222-9090",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });

  const rooms = [
    {
      name: "The Velvet Note",
      slug: "the-velvet-note",
      description:
        "An intimate room wrapped in deep velvet booths and moody pink neon — perfect for date night duets or a tight-knit friend group.",
      capacity: 6,
      pricePerHour: 45,
      amenities: ["Premium sound system", "Disco lighting", "Tablet song catalog", "Velvet booth seating"],
      seed: "velvet-note",
    },
    {
      name: "Neon Skyline",
      slug: "neon-skyline",
      description:
        "Floor-to-ceiling city views meet a wraparound LED stage. Our most requested room for birthdays and after-work send-offs.",
      capacity: 10,
      pricePerHour: 65,
      amenities: ["Floor-to-ceiling windows", "Wraparound LED stage", "Premium sound system", "Disco ball"],
      seed: "neon-skyline",
    },
    {
      name: "Electric Lotus",
      slug: "electric-lotus",
      description:
        "Bold jewel tones, a built-in dance floor, and a confetti-ready ceiling rig — built for the group that wants the whole night.",
      capacity: 16,
      pricePerHour: 95,
      amenities: ["Dance floor", "Confetti rig", "VIP bar service", "Photo booth corner"],
      seed: "electric-lotus",
    },
    {
      name: "Crimson Booth",
      slug: "crimson-booth",
      description: "A cozy two-to-four person pod tucked just off the main lounge — quick sessions, zero pressure.",
      capacity: 4,
      pricePerHour: 30,
      amenities: ["Tablet song catalog", "Mood lighting"],
      seed: "crimson-booth",
    },
    {
      name: "The Penthouse Stage",
      slug: "the-penthouse-stage",
      description:
        "Our largest and most lavish room: a raised stage, private bar, and gold-trimmed lounge seating for the big celebration.",
      capacity: 24,
      pricePerHour: 140,
      amenities: ["Raised stage", "Private bar", "VIP bar service", "Dance floor", "Confetti rig"],
      seed: "penthouse-stage",
    },
  ];

  for (const [index, room] of rooms.entries()) {
    await prisma.room.upsert({
      where: { slug: room.slug },
      update: {},
      create: {
        name: room.name,
        slug: room.slug,
        description: room.description,
        capacity: room.capacity,
        pricePerHour: room.pricePerHour,
        amenities: room.amenities,
        isActive: true,
        images: {
          create: [
            { url: pic(`${room.seed}-1`), alt: room.name, position: 0 },
            { url: pic(`${room.seed}-2`), alt: room.name, position: 1 },
            { url: pic(`${room.seed}-3`), alt: room.name, position: 2 },
          ],
        },
      },
    });
    void index;
  }

  const allRooms = await prisma.room.findMany();

  const categories: { name: string; slug: string; type: "FOOD" | "DRINK"; position: number }[] = [
    { name: "Appetizers", slug: "appetizers", type: "FOOD", position: 0 },
    { name: "Entrées", slug: "entrees", type: "FOOD", position: 1 },
    { name: "This Month's Special", slug: "specials", type: "FOOD", position: 2 },
    { name: "Desserts", slug: "desserts", type: "FOOD", position: 3 },
    { name: "Party Trays", slug: "party-trays", type: "FOOD", position: 4 },
    { name: "Beverages", slug: "beverages", type: "DRINK", position: 0 },
  ];

  const categoryRecords: Record<string, string> = {};
  for (const cat of categories) {
    const record = await prisma.menuCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, type: cat.type, position: cat.position },
      create: cat,
    });
    categoryRecords[cat.slug] = record.id;
  }

  const items: {
    categorySlug: string;
    name: string;
    description: string;
    price: number;
    isFeatured?: boolean;
    allergens?: string[];
    seed: string;
  }[] = [
    // Appetizers
    {
      categorySlug: "appetizers",
      name: "Garlic Fries",
      description: "Crispy fries tossed in garlic.",
      price: 4.50,
      seed: "garlic-fries",
    },
    {
      categorySlug: "appetizers",
      name: "Fried Gyoza (6 pcs)",
      description: "Pan-fried gyoza dumplings, 6 pieces.",
      price: 6.50,
      allergens: ["gluten", "soy"],
      seed: "gyoza-6",
    },
    {
      categorySlug: "appetizers",
      name: "Fried Gyoza (12 pcs)",
      description: "Pan-fried gyoza dumplings, 12 pieces.",
      price: 11.50,
      allergens: ["gluten", "soy"],
      seed: "gyoza-12",
    },
    {
      categorySlug: "appetizers",
      name: "Side Noodle",
      description: "A side serving of noodles.",
      price: 8.50,
      allergens: ["gluten"],
      seed: "side-noodle",
    },
    {
      categorySlug: "appetizers",
      name: "Chicken Karaage",
      description: "Japanese-style crispy fried chicken.",
      price: 8.50,
      isFeatured: true,
      seed: "chicken-karaage",
    },
    // Entrées
    {
      categorySlug: "entrees",
      name: "Grilled Chicken Plate",
      description: "Grilled chicken served with rice and mixed vegetables.",
      price: 13.50,
      seed: "grilled-chicken",
    },
    {
      categorySlug: "entrees",
      name: "Grilled Beef Plate",
      description: "Grilled beef served with rice and mixed vegetables.",
      price: 15.50,
      seed: "grilled-beef",
    },
    {
      categorySlug: "entrees",
      name: "Chicken Katsu Plate",
      description: "Breaded and fried chicken katsu served with rice and mixed vegetables.",
      price: 13.50,
      isFeatured: true,
      seed: "chicken-katsu",
    },
    {
      categorySlug: "entrees",
      name: "Beef Katsu Plate",
      description: "Breaded and fried beef katsu served with rice and mixed vegetables.",
      price: 15.50,
      seed: "beef-katsu",
    },
    // This Month's Special
    {
      categorySlug: "specials",
      name: "Pepper Beef",
      description: "Savory pepper beef served with rice and mixed vegetables.",
      price: 15.50,
      isFeatured: true,
      seed: "pepper-beef",
    },
    // Desserts
    {
      categorySlug: "desserts",
      name: "Taiyaki Soft Serve",
      description: "Fish-shaped waffle cone filled with soft serve. Available in Matcha, Chocolate, or Mixed. Served in cup or cone.",
      price: 5.50,
      isFeatured: true,
      seed: "taiyaki",
    },
    {
      categorySlug: "desserts",
      name: "Tiramisu",
      description: "Homemade classic Italian tiramisu.",
      price: 6.50,
      allergens: ["dairy", "gluten"],
      seed: "tiramisu",
    },
    // Party Trays
    {
      categorySlug: "party-trays",
      name: "Party Tray (Regular)",
      description: "French Fries, Chicken Karaage, Fried Gyoza, and Mixed Vegetables. Feeds up to 6 people.",
      price: 65.00,
      seed: "party-tray-regular",
    },
    {
      categorySlug: "party-trays",
      name: "Party Tray (Large)",
      description: "French Fries, Chicken Karaage, Fried Gyoza, and Mixed Vegetables. Feeds up to 12 people.",
      price: 120.00,
      seed: "party-tray-large",
    },
    {
      categorySlug: "party-trays",
      name: "Birthday Cake",
      description: "Available upon request. Please pre-order at least 3 days prior.",
      price: 0,
      seed: "birthday-cake",
    },
    // Beverages
    {
      categorySlug: "beverages",
      name: "Bottle Water",
      description: "Chilled bottled water.",
      price: 1.50,
      seed: "water",
    },
    {
      categorySlug: "beverages",
      name: "Soft Drink",
      description: "Your choice of soft drink, 22 oz.",
      price: 2.50,
      seed: "soft-drink",
    },
    {
      categorySlug: "beverages",
      name: "Iced Coffee",
      description: "Classic iced coffee over ice.",
      price: 4.50,
      seed: "iced-coffee",
    },
    {
      categorySlug: "beverages",
      name: "Iced Espresso",
      description: "Iced espresso sweetened with palm sugar.",
      price: 4.50,
      seed: "iced-espresso",
    },
    {
      categorySlug: "beverages",
      name: "Iced Matcha",
      description: "Smooth iced matcha over ice.",
      price: 6.50,
      isFeatured: true,
      seed: "iced-matcha",
    },
    {
      categorySlug: "beverages",
      name: "Iced Matcha w/ Fresh Strawberry",
      description: "Smooth iced matcha topped with fresh strawberry.",
      price: 6.50,
      seed: "iced-matcha-strawberry",
    },
  ];

  for (const item of items) {
    const existing = await prisma.menuItem.findFirst({
      where: { name: item.name, categoryId: categoryRecords[item.categorySlug] },
    });
    if (existing) continue;
    await prisma.menuItem.create({
      data: {
        categoryId: categoryRecords[item.categorySlug],
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: pic(item.seed, 600, 600),
        isFeatured: item.isFeatured ?? false,
        allergens: item.allergens ?? [],
      },
    });
  }

  const reviewSeed = [
    { roomSlug: "neon-skyline", rating: 5, comment: "Best birthday party we've ever thrown. The view and the sound system are unreal." },
    { roomSlug: "electric-lotus", rating: 5, comment: "Confetti cannon at midnight made the whole bachelorette party scream. 10/10." },
    { roomSlug: "the-velvet-note", rating: 4, comment: "Super cozy for a date night. Service was attentive without hovering." },
    { roomSlug: "the-penthouse-stage", rating: 5, comment: "Worth every penny for our company holiday party. Staff handled 20 people effortlessly." },
    { roomSlug: "crimson-booth", rating: 4, comment: "Great for a quick 1-hour session after work. Wish the song catalog had more 2010s pop." },
  ];

  for (const r of reviewSeed) {
    const room = allRooms.find((x) => x.slug === r.roomSlug);
    if (!room) continue;
    const existing = await prisma.review.findFirst({ where: { roomId: room.id, comment: r.comment } });
    if (existing) continue;
    await prisma.review.create({
      data: { userId: customer.id, roomId: room.id, rating: r.rating, comment: r.comment },
    });
  }

  console.log("Seed complete:");
  console.log(`  Admin login:    admin@crescendokaraoke.com / Admin1234!`);
  console.log(`  Customer login: customer@example.com / Customer1234!`);
  console.log(`  Rooms: ${allRooms.length}, Menu categories: ${categories.length}, Menu items: ${items.length}`);
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
