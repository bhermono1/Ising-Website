export const BUSINESS = {
  name: "I-Sing Karaoke",
  shortName: "I-Sing",
  tagline: "Private rooms. Big sound. Bottomless nights.",
  phone: "+1 (555) 010-2024",
  email: "hello@crescendokaraoke.com",
  address: "488 Neon Alley, Los Angeles, CA 90012",
  hours: "Mon–Thu 4pm–1am · Fri–Sun 2pm–3am",
  instagram: "https://instagram.com/crescendokaraoke",
} as const;

export const TIME_SLOT_INTERVAL_MINUTES = 30;

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_FLOW = ["PENDING", "PREPARING", "READY", "DELIVERED"] as const;
