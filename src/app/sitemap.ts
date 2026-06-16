import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const rooms = await prisma.room.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/rooms`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/menu`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/login`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/register`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const roomRoutes: MetadataRoute.Sitemap = rooms.map((room) => ({
    url: `${baseUrl}/rooms/${room.slug}`,
    lastModified: room.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...roomRoutes];
}
