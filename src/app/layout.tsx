import type { Metadata } from "next";
import { Inter, Playfair_Display, Monoton } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BUSINESS } from "@/lib/constants";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const monoton = Monoton({ variable: "--font-monoton", weight: "400", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BUSINESS.name} | Private Karaoke Rooms & Lounge`,
    template: `%s | ${BUSINESS.shortName}`,
  },
  description: `${BUSINESS.tagline} Book private karaoke rooms, order food and drinks, and host an unforgettable night at ${BUSINESS.name}.`,
  keywords: ["karaoke", "private karaoke rooms", "karaoke lounge", "karaoke bar", "book karaoke room"],
  openGraph: {
    title: `${BUSINESS.name} | Private Karaoke Rooms & Lounge`,
    description: BUSINESS.tagline,
    url: siteUrl,
    siteName: BUSINESS.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: BUSINESS.name,
    description: BUSINESS.tagline,
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${monoton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
