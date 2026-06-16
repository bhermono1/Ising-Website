import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReceiptView } from "@/components/dashboard/receipt-view";

export const metadata: Metadata = { title: "Order Receipt" };

export default async function OrderReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { menuItem: true } }, user: true },
  });

  if (!order) notFound();
  if (order.userId !== session!.user.id && session!.user.role !== "ADMIN") redirect("/dashboard/orders");

  return (
    <ReceiptView
      title="Order Receipt"
      receiptId={order.id}
      date={order.createdAt}
      customerName={order.user.name ?? "Guest"}
      customerEmail={order.user.email}
      lines={order.items.map((item) => ({
        label: item.menuItem.name,
        quantity: item.quantity,
        amount: Number(item.unitPrice.toString()) * item.quantity,
      }))}
      total={Number(order.totalAmount.toString())}
      footerNote={`Payment status: ${order.paymentStatus}`}
    />
  );
}
