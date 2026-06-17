export const BUSINESS = {
  name: "I-Sing Karaoke",
  shortName: "I-Sing",
  tagline: "Private rooms. Big sound. Bottomless nights.",
  phone: "+1 (559) XXX-XXXX",
  email: "hello@ising.karaokecafe.com",
  address: "130 W Shaw Avenue, Clovis, CA 93612",
  hours: "Mon–Thu 4:30pm–10pm · Fri–Sat 12pm–11pm · Sun 12pm–9pm",
  instagram: "https://www.instagram.com/ising.karaokecafe/",
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
