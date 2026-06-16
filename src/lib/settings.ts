import { prisma } from "@/lib/prisma";

/**
 * SiteSettings is a singleton row (id = 1). Admin-configurable business
 * rules (deposit %, cancellation window/fee, tax) read through here so the
 * rest of the app never hardcodes them.
 */
export async function getSiteSettings() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return settings;
}

export function computeDeposit(
  totalAmount: number,
  settings: { depositPercentage: { toString(): string }; minDepositAmount: { toString(): string } }
) {
  const pct = Number(settings.depositPercentage.toString());
  const min = Number(settings.minDepositAmount.toString());
  const computed = (totalAmount * pct) / 100;
  return Math.max(Math.round(computed * 100) / 100, min);
}
