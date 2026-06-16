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
    { name: "Small Plates", slug: "small-plates", type: "FOOD", position: 0 },
    { name: "Shareable Mains", slug: "shareable-mains", type: "FOOD", position: 1 },
    { name: "Sweet Endings", slug: "sweet-endings", type: "FOOD", position: 2 },
    { name: "Signature Cocktails", slug: "signature-cocktails", type: "DRINK", position: 0 },
    { name: "Beer & Wine", slug: "beer-wine", type: "DRINK", position: 1 },
    { name: "Non-Alcoholic", slug: "non-alcoholic", type: "DRINK", position: 2 },
  ];

  const categoryRecords: Record<string, string> = {};
  for (const cat of categories) {
    const record = await prisma.menuCategory.upsert({
      where: { slug: cat.slug },
      update: {},
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
    {
      categorySlug: "small-plates",
      name: "Truffle Karaage Wings",
      description: "Crispy Japanese fried chicken wings tossed in truffle-soy glaze, scallion, sesame.",
      price: 14,
      isFeatured: true,
      allergens: ["soy", "sesame"],
      seed: "wings",
    },
    {
      categorySlug: "small-plates",
      name: "Loaded Kimchi Fries",
      description: "Crispy fries, melted cheese curd, kimchi, spicy mayo, scallions.",
      price: 12,
      allergens: ["dairy"],
      seed: "fries",
    },
    {
      categorySlug: "small-plates",
      name: "Edamame & Chili Salt",
      description: "Steamed edamame tossed with togarashi chili salt and lime.",
      price: 8,
      allergens: ["soy"],
      seed: "edamame",
    },
    {
      categorySlug: "shareable-mains",
      name: "K-BBQ Slider Trio",
      description: "Bulgogi beef, gochujang glaze, pickled slaw, brioche buns.",
      price: 18,
      isFeatured: true,
      allergens: ["gluten", "soy"],
      seed: "sliders",
    },
    {
      categorySlug: "shareable-mains",
      name: "Spicy Tuna Nachos",
      description: "Wonton chips, spicy tuna, avocado crema, jalapeño, sriracha drizzle.",
      price: 19,
      allergens: ["fish", "gluten"],
      seed: "nachos",
    },
    {
      categorySlug: "shareable-mains",
      name: "Truffle Mushroom Flatbread",
      description: "Wild mushroom, mozzarella, truffle oil, arugula, parmesan.",
      price: 16,
      allergens: ["dairy", "gluten"],
      seed: "flatbread",
    },
    {
      categorySlug: "sweet-endings",
      name: "Mochi Donut Tower",
      description: "Six warm mochi donuts, matcha glaze, chocolate drizzle, powdered sugar.",
      price: 11,
      isFeatured: true,
      allergens: ["gluten", "dairy"],
      seed: "donuts",
    },
    {
      categorySlug: "sweet-endings",
      name: "Mango Sticky Rice",
      description: "Coconut sticky rice, fresh mango, toasted sesame.",
      price: 9,
      seed: "mango-rice",
    },
    {
      categorySlug: "signature-cocktails",
      name: "Neon Lychee Martini",
      description: "Vodka, lychee liqueur, fresh lime, butterfly pea color-shift.",
      price: 15,
      isFeatured: true,
      seed: "lychee-martini",
    },
    {
      categorySlug: "signature-cocktails",
      name: "Electric Mule",
      description: "Spiced rum, ginger beer, blue curaçao, fresh lime.",
      price: 14,
      seed: "electric-mule",
    },
    {
      categorySlug: "signature-cocktails",
      name: "Crimson Smoke Old Fashioned",
      description: "Bourbon, cherry bitters, smoked orange peel.",
      price: 16,
      seed: "old-fashioned",
    },
    {
      categorySlug: "beer-wine",
      name: "Sapporo Draft",
      description: "Crisp Japanese lager, 20oz pour.",
      price: 9,
      seed: "sapporo",
    },
    {
      categorySlug: "beer-wine",
      name: "House Sparkling Rosé",
      description: "Bright, dry, and bubbly — by the glass or bottle.",
      price: 12,
      seed: "rose",
    },
    {
      categorySlug: "non-alcoholic",
      name: "Yuzu Spritz",
      description: "Yuzu, soda, mint, a splash of grenadine.",
      price: 7,
      seed: "yuzu-spritz",
    },
    {
      categorySlug: "non-alcoholic",
      name: "Thai Iced Tea",
      description: "Classic spiced black tea, condensed milk, over ice.",
      price: 6,
      seed: "thai-tea",
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
  console.log(`  Rooms: ${allRooms.length}, Categories: ${categories.length}, Items: ${items.length}`);
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
